import type { ParseResult } from "papaparse";

export interface RentRollRow {
  unitNumber: string;
  tenantFirstName: string;
  tenantLastName: string;
  status: string;
  moveInDate: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  monthlyRent: number;
  deposit: number;
  balance: number;
}

// AppFolio Rent Roll CSVs use various column naming conventions.
// This maps common variations to our normalized field names.
const columnMap: Record<string, keyof RentRollRow> = {
  unit: "unitNumber",
  "unit number": "unitNumber",
  "unit #": "unitNumber",
  unit_number: "unitNumber",

  "first name": "tenantFirstName",
  first_name: "tenantFirstName",
  "tenant first": "tenantFirstName",

  "last name": "tenantLastName",
  last_name: "tenantLastName",
  "tenant last": "tenantLastName",

  tenant: "tenantLastName", // single "Tenant" column = full name → goes to lastName

  status: "status",
  "occupancy status": "status",
  "lease status": "status",

  "move in": "moveInDate",
  "move-in date": "moveInDate",
  "move in date": "moveInDate",
  move_in_date: "moveInDate",

  "lease from": "leaseStart",
  "lease start": "leaseStart",
  "lease start date": "leaseStart",
  start_date: "leaseStart",

  "lease to": "leaseEnd",
  "lease end": "leaseEnd",
  "lease end date": "leaseEnd",
  end_date: "leaseEnd",

  rent: "monthlyRent",
  "monthly rent": "monthlyRent",
  "rent amount": "monthlyRent",
  monthly_rent: "monthlyRent",

  deposit: "deposit",
  "security deposit": "deposit",
  security_deposit: "deposit",

  balance: "balance",
  "balance due": "balance",
  "outstanding balance": "balance",
  "past due": "balance",
};

function parseCurrency(val: string | number | undefined): number {
  if (val === undefined || val === null || val === "") return 0;
  const str = String(val).replace(/[$,\s]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseDate(val: string | undefined): string | null {
  if (!val || val.trim() === "") return null;
  // Try common date formats
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return null;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-]/g, " ");
}

export function parseRentRoll(result: ParseResult<Record<string, string>>): RentRollRow[] {
  if (!result.data.length) return [];

  // Build column mapping from actual headers
  const headers = Object.keys(result.data[0]);
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    const field = columnMap[normalized];
    if (field) {
      mapping[header] = field;
    }
  }

  const rows: RentRollRow[] = [];

  for (const row of result.data) {
    // Skip empty rows
    const values = Object.values(row).filter((v) => v && v.trim());
    if (values.length === 0) continue;

    // Skip section header rows (e.g. "-> Double Jack Properties, LLC - ...")
    // and summary rows (e.g. "Total 38 Units", "38 Units")
    const firstCol = Object.values(row)[0]?.trim() ?? "";
    if (firstCol.startsWith("->")) continue;
    if (firstCol.toLowerCase().startsWith("total")) continue;
    if (/^\d+\s+units$/i.test(firstCol)) continue;

    const parsed: Partial<RentRollRow> = {};

    for (const [header, field] of Object.entries(mapping)) {
      const value = row[header];
      switch (field) {
        case "unitNumber":
          parsed.unitNumber = value?.trim() ?? "";
          break;
        case "tenantFirstName":
          parsed.tenantFirstName = value?.trim() ?? "";
          break;
        case "tenantLastName": {
          const name = value?.trim() ?? "";
          // If this is a full name in the "Tenant" column, split it
          if (!parsed.tenantFirstName && name.includes(" ")) {
            const parts = name.split(" ");
            parsed.tenantFirstName = parts[0];
            parsed.tenantLastName = parts.slice(1).join(" ");
          } else {
            parsed.tenantLastName = name;
          }
          break;
        }
        case "status":
          parsed.status = value?.trim() ?? "";
          break;
        case "moveInDate":
          parsed.moveInDate = parseDate(value);
          break;
        case "leaseStart":
          parsed.leaseStart = parseDate(value);
          break;
        case "leaseEnd":
          parsed.leaseEnd = parseDate(value);
          break;
        case "monthlyRent":
          parsed.monthlyRent = parseCurrency(value);
          break;
        case "deposit":
          parsed.deposit = parseCurrency(value);
          break;
        case "balance":
          parsed.balance = parseCurrency(value);
          break;
      }
    }

    // Only include rows that have at minimum a unit number
    if (parsed.unitNumber) {
      rows.push({
        unitNumber: parsed.unitNumber,
        tenantFirstName: parsed.tenantFirstName ?? "",
        tenantLastName: parsed.tenantLastName ?? "",
        status: parsed.status ?? "",
        moveInDate: parsed.moveInDate ?? null,
        leaseStart: parsed.leaseStart ?? null,
        leaseEnd: parsed.leaseEnd ?? null,
        monthlyRent: parsed.monthlyRent ?? 0,
        deposit: parsed.deposit ?? 0,
        balance: parsed.balance ?? 0,
      });
    }
  }

  return rows;
}

// Detect if a CSV is a Rent Roll by checking header signatures
export function isRentRoll(headers: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
  const hasUnit = normalized.some(
    (h) => h === "unit" || h === "unit number" || h === "unit #"
  );
  const hasRent = normalized.some(
    (h) => h.includes("rent") || h.includes("market rent")
  );
  const hasTenant = normalized.some(
    (h) => h.includes("tenant") || h.includes("first name")
  );
  return hasUnit && (hasRent || hasTenant);
}
