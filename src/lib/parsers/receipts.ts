import type { ParseResult } from "papaparse";

export interface ReceiptRow {
  date: string;
  unitNumber: string;
  tenantName: string;
  amount: number;
  method: string;
  description: string;
  referenceNumber: string;
}

const columnMap: Record<string, keyof ReceiptRow> = {
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

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-]/g, " ");
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
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    const field = columnMap[normalized];
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
      });
    }
  }

  return rows;
}

export function isReceipts(headers: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
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
