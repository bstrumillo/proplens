import type { ParseResult } from "papaparse";

export interface ReceiptRow {
  date: string;
  unitNumber: string;
  tenantName: string;
  amount: number;
  method: string;
  description: string;
  referenceNumber: string;
  category: "rent" | "fee" | "insurance" | "cam" | "security_deposit" | "prepayment" | "other";
}

function parseCurrency(val: string | number | undefined): number {
  if (val === undefined || val === null || val === "") return 0;
  const str = String(val).replace(/[$,\s]/g, "");
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

/**
 * Parse a section header to extract unit number and tenant name.
 * Format: "-> ... - Unit XXX - LastName, FirstName M."
 * or:     "-> ... - No Unit - LastName, FirstName M."
 */
function parseSectionHeader(accountName: string): {
  unitNumber: string;
  tenantName: string;
} | null {
  if (!accountName.startsWith("->")) return null;

  // Try to match "- Unit XXX - TenantName" pattern
  const unitMatch = accountName.match(/- Unit (.+?)\s{0,2}- ([^-]+)$/);
  if (unitMatch) {
    const rawUnit = unitMatch[1].trim();
    const rawTenant = unitMatch[2].trim();
    return {
      unitNumber: rawUnit,
      tenantName: formatTenantName(rawTenant),
    };
  }

  // Try to match "- No Unit - TenantName" pattern
  const noUnitMatch = accountName.match(/- No Unit - ([^-]+)$/);
  if (noUnitMatch) {
    return {
      unitNumber: "",
      tenantName: formatTenantName(noUnitMatch[1].trim()),
    };
  }

  return null;
}

/**
 * Convert "LastName, FirstName M." to "FirstName M. LastName"
 */
function formatTenantName(name: string): string {
  if (name.includes(",")) {
    const [last, first] = name.split(",", 2);
    return `${first.trim()} ${last.trim()}`;
  }
  return name;
}

/**
 * Classify an AppFolio account name into a payment category.
 */
function classifyAccountType(accountName: string): ReceiptRow["category"] {
  const lower = accountName.toLowerCase().trim();
  if (lower === "rent") return "rent";
  if (lower.includes("management fee")) return "fee";
  if (lower.includes("tenant liability insurance") || lower.includes("renters insurance")) return "insurance";
  if (lower.startsWith("cam")) return "cam";
  if (lower.includes("prepay")) return "prepayment";
  if (lower.includes("security deposit")) return "security_deposit";
  return "other";
}

/**
 * Detect if this is an AppFolio Resident Financial Activity report.
 * These have headers: Account Name, Last Receipt Date, Beginning Balance, Charges, Payments, Ending Balance
 */
function isResidentFinancialActivity(headers: string[]): boolean {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  const hasAccountName = normalized.some((h) => h === "account name");
  const hasPayments = normalized.some((h) => h === "payments");
  const hasCharges = normalized.some((h) => h === "charges");
  return hasAccountName && hasPayments && hasCharges;
}

/**
 * Parse AppFolio Resident Financial Activity report.
 * This format has nested sections per tenant with sub-rows for each charge type.
 */
function parseResidentFinancialActivity(
  result: ParseResult<Record<string, string>>
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let currentUnit = "";
  let currentTenant = "";

  for (const row of result.data) {
    const accountName = (row["Account Name"] ?? "").trim();

    // Skip empty rows and total row
    if (!accountName || accountName.toLowerCase() === "total") continue;

    // Check if this is a section header
    const header = parseSectionHeader(accountName);
    if (header) {
      currentUnit = header.unitNumber;
      currentTenant = header.tenantName;
      continue;
    }

    // Skip rows without a current tenant context
    if (!currentTenant) continue;

    // Classify the account type
    const category = classifyAccountType(accountName);

    // Skip prepayments entirely — they're balance adjustments, not real payments
    if (category === "prepayment") continue;

    // We're interested in Rent rows (primary) and can capture other account types too
    const paymentsRaw = parseCurrency(row["Payments"]);
    const amount = Math.abs(paymentsRaw);
    const date = parseDate(row["Last Receipt Date"]);

    // Only include rows where a payment was actually made (negative = payment)
    if (amount > 0 && paymentsRaw < 0) {
      rows.push({
        date,
        unitNumber: currentUnit,
        tenantName: currentTenant,
        amount,
        method: "autopay", // AppFolio doesn't include method in this report
        description: accountName, // e.g., "Rent", "Management Fees", etc.
        referenceNumber: "",
        category,
      });
    }
  }

  return rows;
}

/**
 * Parse flat-table receipt/payment CSVs (generic format).
 * Kept as fallback for non-AppFolio payment reports.
 */
function parseFlatReceipts(
  result: ParseResult<Record<string, string>>
): ReceiptRow[] {
  if (!result.data.length) return [];

  const flatColumnMap: Record<string, keyof ReceiptRow> = {
    date: "date",
    "payment date": "date",
    "receipt date": "date",
    "date received": "date",
    paid_at: "date",
    unit: "unitNumber",
    "unit number": "unitNumber",
    "unit #": "unitNumber",
    tenant: "tenantName",
    "tenant name": "tenantName",
    payer: "tenantName",
    name: "tenantName",
    amount: "amount",
    "payment amount": "amount",
    total: "amount",
    "amount received": "amount",
    method: "method",
    "payment method": "method",
    "payment type": "method",
    type: "method",
    description: "description",
    memo: "description",
    notes: "description",
    "payment description": "description",
    reference: "referenceNumber",
    "reference number": "referenceNumber",
    "ref #": "referenceNumber",
    "check number": "referenceNumber",
    "check #": "referenceNumber",
  };

  const headers = Object.keys(result.data[0]);
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalized = header.toLowerCase().trim().replace(/[_\-]/g, " ");
    const field = flatColumnMap[normalized];
    if (field) {
      mapping[header] = field;
    }
  }

  const rows: ReceiptRow[] = [];

  for (const row of result.data) {
    const values = Object.values(row).filter((v) => v && v.trim());
    if (values.length === 0) continue;

    const parsed: Partial<ReceiptRow> = {};

    for (const [header, field] of Object.entries(mapping)) {
      const value = row[header];
      switch (field) {
        case "date":
          parsed.date = parseDate(value);
          break;
        case "unitNumber":
          parsed.unitNumber = value?.trim() ?? "";
          break;
        case "tenantName":
          parsed.tenantName = value?.trim() ?? "";
          break;
        case "amount":
          parsed.amount = parseCurrency(value);
          break;
        case "method":
          parsed.method = value ? normalizeMethod(value) : "";
          break;
        case "description":
          parsed.description = value?.trim() ?? "";
          break;
        case "referenceNumber":
          parsed.referenceNumber = value?.trim() ?? "";
          break;
      }
    }

    if (parsed.amount && parsed.amount > 0) {
      rows.push({
        date: parsed.date ?? "",
        unitNumber: parsed.unitNumber ?? "",
        tenantName: parsed.tenantName ?? "",
        amount: parsed.amount,
        method: parsed.method ?? "other",
        description: parsed.description ?? "",
        referenceNumber: parsed.referenceNumber ?? "",
        category: "rent",
      });
    }
  }

  return rows;
}

function normalizeMethod(method: string): string {
  const m = method.toLowerCase().trim();
  if (m.includes("ach") || m.includes("electronic")) return "ach";
  if (m.includes("credit")) return "credit_card";
  if (m.includes("debit")) return "debit_card";
  if (m.includes("check")) return "check";
  if (m.includes("cash")) return "cash";
  if (m.includes("wire")) return "wire";
  return "other";
}

export function parseReceipts(
  result: ParseResult<Record<string, string>>
): ReceiptRow[] {
  if (!result.data.length) return [];

  const headers = Object.keys(result.data[0]);

  // Detect if this is an AppFolio Resident Financial Activity report
  if (isResidentFinancialActivity(headers)) {
    return parseResidentFinancialActivity(result);
  }

  // Fall back to flat-table parsing for generic payment CSVs
  return parseFlatReceipts(result);
}

export function isReceipts(headers: string[]): boolean {
  const normalized = headers.map((h) => h.toLowerCase().trim().replace(/[_\-]/g, " "));

  // AppFolio Resident Financial Activity detection
  const hasAccountName = normalized.some((h) => h === "account name");
  const hasPaymentsCol = normalized.some((h) => h === "payments");
  const hasCharges = normalized.some((h) => h === "charges");
  if (hasAccountName && hasPaymentsCol && hasCharges) return true;

  // Generic flat receipt/payment detection
  const hasPaymentField = normalized.some(
    (h) =>
      h.includes("payment") ||
      h.includes("receipt") ||
      h.includes("amount received")
  );
  const hasAmount = normalized.some(
    (h) => h === "amount" || h.includes("total") || h.includes("amount")
  );
  const hasDate = normalized.some(
    (h) => h === "date" || h.includes("payment date") || h.includes("receipt date")
  );
  return (hasPaymentField || hasAmount) && hasDate;
}
