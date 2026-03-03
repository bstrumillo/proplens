"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { csvImports } from "@/lib/db/schema";
import { parseCSV, reportTypeLabels } from "@/lib/parsers";
import { importParsedData } from "@/lib/services/csv-import";
import type { ReportType } from "@/lib/parsers";

export interface UploadResult {
  success: boolean;
  reportType: ReportType;
  reportTypeLabel: string;
  rowCount: number;
  importStats?: {
    created: { units: number; tenants: number; leases: number; payments: number };
    updated: { units: number; tenants: number; leases: number };
    skipped: number;
    errors: string[];
  };
  error?: string;
}

export async function uploadCSV(
  formData: FormData
): Promise<UploadResult> {
  const session = await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) {
    return {
      success: false,
      reportType: "unknown",
      reportTypeLabel: "Unknown",
      rowCount: 0,
      error: "No file provided",
    };
  }

  const csvText = await file.text();
  if (!csvText.trim()) {
    return {
      success: false,
      reportType: "unknown",
      reportTypeLabel: "Unknown",
      rowCount: 0,
      error: "File is empty",
    };
  }

  const parsed = parseCSV(csvText);

  if (parsed.type === "unknown") {
    return {
      success: false,
      reportType: "unknown",
      reportTypeLabel: "Unknown",
      rowCount: 0,
      error: `Could not detect report type. Headers found: ${(parsed as { headers?: string[] }).headers?.join(", ") ?? "none"}`,
    };
  }

  // Import parsed data into domain tables
  const importResult = await importParsedData(session.organizationId, parsed);

  // Record the import metadata
  await db.insert(csvImports).values({
    organizationId: session.organizationId,
    reportType: parsed.type,
    fileName: file.name,
    rowCount: parsed.rowCount,
    stats: {
      importedBy: session.user.email,
      parsedAt: new Date().toISOString(),
      ...importResult,
    },
  });

  revalidatePath("/");
  revalidatePath("/upload");

  return {
    success: true,
    reportType: parsed.type,
    reportTypeLabel: reportTypeLabels[parsed.type],
    rowCount: parsed.rowCount,
    importStats: {
      created: importResult.created,
      updated: importResult.updated,
      skipped: importResult.skipped,
      errors: importResult.errors,
    },
  };
}
