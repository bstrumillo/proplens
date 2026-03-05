import Papa from "papaparse";
import { parseRentRoll, isRentRoll, type RentRollRow } from "./rent-roll";
import { parseReceipts, isReceipts, type ReceiptRow } from "./receipts";
import { parseOccupancy, isOccupancy, type OccupancyRow } from "./occupancy";

export type ReportType = "rent_roll" | "receipts" | "occupancy" | "unknown";

export type ParsedReport =
  | { type: "rent_roll"; data: RentRollRow[]; rowCount: number }
  | { type: "receipts"; data: ReceiptRow[]; rowCount: number }
  | { type: "occupancy"; data: OccupancyRow[]; rowCount: number }
  | { type: "unknown"; data: never[]; rowCount: 0; headers: string[] };

export function detectReportType(headers: string[]): ReportType {
  if (isRentRoll(headers)) return "rent_roll";
  if (isReceipts(headers)) return "receipts";
  if (isOccupancy(headers)) return "occupancy";
  return "unknown";
}

export function parseCSV(csvString: string): ParsedReport {
  const result = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (!result.data.length) {
    return { type: "unknown", data: [] as never[], rowCount: 0, headers: [] };
  }

  const headers = Object.keys(result.data[0]);
  const reportType = detectReportType(headers);

  switch (reportType) {
    case "rent_roll": {
      const data = parseRentRoll(result);
      return { type: "rent_roll", data, rowCount: data.length };
    }
    case "receipts": {
      const data = parseReceipts(result);
      return { type: "receipts", data, rowCount: data.length };
    }
    case "occupancy": {
      const data = parseOccupancy(result);
      return { type: "occupancy", data, rowCount: data.length };
    }
    default:
      return {
        type: "unknown",
        data: [] as never[],
        rowCount: 0,
        headers,
      };
  }
}

export const reportTypeLabels: Record<ReportType, string> = {
  rent_roll: "Rent Roll",
  receipts: "Resident Financial Activity",
  occupancy: "Occupancy Summary",
  unknown: "Unknown Report",
};

export type { RentRollRow, ReceiptRow, OccupancyRow };
