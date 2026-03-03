import type { ParseResult } from "papaparse";

export interface OccupancyRow {
  unitType: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  averageSqFt: number;
  averageMarketRent: number;
  vacantRented: number;
  vacantUnrented: number;
  noticeRented: number;
  noticeUnrented: number;
}

const columnMap: Record<string, keyof OccupancyRow> = {
  "unit type": "unitType",
  "property type": "unitType",
  type: "unitType",
  category: "unitType",

  "# of units": "totalUnits",
  "total units": "totalUnits",
  total: "totalUnits",
  "unit count": "totalUnits",
  units: "totalUnits",

  occupied: "occupiedUnits",
  "occupied units": "occupiedUnits",
  "units occupied": "occupiedUnits",

  "% occupied": "occupancyRate",
  "occupancy rate": "occupancyRate",
  occupancy: "occupancyRate",
  "occupancy %": "occupancyRate",

  "average sq ft": "averageSqFt",
  "avg sq ft": "averageSqFt",
  sqft: "averageSqFt",

  "average market rent": "averageMarketRent",
  "avg market rent": "averageMarketRent",
  "market rent": "averageMarketRent",

  "vacant rented": "vacantRented",
  "vacant unrented": "vacantUnrented",
  "notice rented": "noticeRented",
  "notice unrented": "noticeUnrented",
};

function parseNumber(val: string | number | undefined): number {
  if (val === undefined || val === null || val === "") return 0;
  const str = String(val).replace(/[%,$\s]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
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
        case "unitType":
          parsed.unitType = value?.trim() ?? "";
          break;
        case "totalUnits":
          parsed.totalUnits = parseNumber(value);
          break;
        case "occupiedUnits":
          parsed.occupiedUnits = parseNumber(value);
          break;
        case "occupancyRate":
          parsed.occupancyRate = parseNumber(value);
          break;
        case "averageSqFt":
          parsed.averageSqFt = parseNumber(value);
          break;
        case "averageMarketRent":
          parsed.averageMarketRent = parseNumber(value);
          break;
        case "vacantRented":
          parsed.vacantRented = parseNumber(value);
          break;
        case "vacantUnrented":
          parsed.vacantUnrented = parseNumber(value);
          break;
        case "noticeRented":
          parsed.noticeRented = parseNumber(value);
          break;
        case "noticeUnrented":
          parsed.noticeUnrented = parseNumber(value);
          break;
      }
    }

    // Compute vacant units from sub-categories if not directly available
    const vacantTotal =
      (parsed.vacantRented ?? 0) +
      (parsed.vacantUnrented ?? 0) +
      (parsed.noticeRented ?? 0) +
      (parsed.noticeUnrented ?? 0);

    // Compute derived values if missing
    if (parsed.totalUnits && parsed.occupiedUnits && !parsed.occupancyRate) {
      parsed.occupancyRate =
        parsed.totalUnits > 0
          ? (parsed.occupiedUnits / parsed.totalUnits) * 100
          : 0;
    }

    // Only include rows that have a unit type name
    if (parsed.unitType) {
      rows.push({
        unitType: parsed.unitType,
        totalUnits: parsed.totalUnits ?? 0,
        occupiedUnits: parsed.occupiedUnits ?? 0,
        vacantUnits: vacantTotal || (parsed.totalUnits ?? 0) - (parsed.occupiedUnits ?? 0),
        occupancyRate: parsed.occupancyRate ?? 0,
        averageSqFt: parsed.averageSqFt ?? 0,
        averageMarketRent: parsed.averageMarketRent ?? 0,
        vacantRented: parsed.vacantRented ?? 0,
        vacantUnrented: parsed.vacantUnrented ?? 0,
        noticeRented: parsed.noticeRented ?? 0,
        noticeUnrented: parsed.noticeUnrented ?? 0,
      });
    }
  }

  return rows;
}

export function isOccupancy(headers: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
  const hasOccupancy = normalized.some(
    (h) =>
      h.includes("occupancy") ||
      h === "occupied" ||
      h === "% occupied" ||
      h.includes("vacant rented") ||
      h.includes("vacant unrented")
  );
  const hasUnitType = normalized.some(
    (h) => h === "unit type" || h === "property type"
  );
  return hasOccupancy || hasUnitType;
}
