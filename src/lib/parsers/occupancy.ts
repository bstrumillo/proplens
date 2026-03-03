import type { ParseResult } from "papaparse";

export interface OccupancyRow {
  period: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
}

const columnMap: Record<string, keyof OccupancyRow> = {
  date: "period",
  month: "period",
  period: "period",
  "report date": "period",
  "as of": "period",

  "total units": "totalUnits",
  total: "totalUnits",
  "unit count": "totalUnits",

  "occupied units": "occupiedUnits",
  occupied: "occupiedUnits",
  "units occupied": "occupiedUnits",

  "vacant units": "vacantUnits",
  vacant: "vacantUnits",
  "units vacant": "vacantUnits",
  vacancies: "vacantUnits",

  "occupancy rate": "occupancyRate",
  occupancy: "occupancyRate",
  "occupancy %": "occupancyRate",
  "% occupied": "occupancyRate",
};

function parseNumber(val: string | number | undefined): number {
  if (val === undefined || val === null || val === "") return 0;
  const str = String(val).replace(/[%,\s]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseDate(val: string | undefined): string {
  if (!val || val.trim() === "") return "";
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return val.trim();
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-]/g, " ");
}

export function parseOccupancy(
  result: ParseResult<Record<string, string>>
): OccupancyRow[] {
  if (!result.data.length) return [];

  const headers = Object.keys(result.data[0]);
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    const field = columnMap[normalized];
    if (field) {
      mapping[header] = field;
    }
  }

  const rows: OccupancyRow[] = [];

  for (const row of result.data) {
    const values = Object.values(row).filter((v) => v && v.trim());
    if (values.length === 0) continue;

    const parsed: Partial<OccupancyRow> = {};

    for (const [header, field] of Object.entries(mapping)) {
      const value = row[header];
      switch (field) {
        case "period":
          parsed.period = parseDate(value);
          break;
        case "totalUnits":
          parsed.totalUnits = parseNumber(value);
          break;
        case "occupiedUnits":
          parsed.occupiedUnits = parseNumber(value);
          break;
        case "vacantUnits":
          parsed.vacantUnits = parseNumber(value);
          break;
        case "occupancyRate":
          parsed.occupancyRate = parseNumber(value);
          break;
      }
    }

    // Compute derived values if missing
    if (parsed.totalUnits && parsed.occupiedUnits && !parsed.vacantUnits) {
      parsed.vacantUnits = parsed.totalUnits - parsed.occupiedUnits;
    }
    if (parsed.totalUnits && parsed.vacantUnits && !parsed.occupiedUnits) {
      parsed.occupiedUnits = parsed.totalUnits - parsed.vacantUnits;
    }
    if (parsed.totalUnits && parsed.occupiedUnits && !parsed.occupancyRate) {
      parsed.occupancyRate =
        parsed.totalUnits > 0
          ? (parsed.occupiedUnits / parsed.totalUnits) * 100
          : 0;
    }

    if (parsed.period) {
      rows.push({
        period: parsed.period,
        totalUnits: parsed.totalUnits ?? 0,
        occupiedUnits: parsed.occupiedUnits ?? 0,
        vacantUnits: parsed.vacantUnits ?? 0,
        occupancyRate: parsed.occupancyRate ?? 0,
      });
    }
  }

  return rows;
}

export function isOccupancy(headers: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
  const hasOccupancy = normalized.some(
    (h) => h.includes("occupancy") || h.includes("occupied") || h.includes("vacant")
  );
  return hasOccupancy;
}
