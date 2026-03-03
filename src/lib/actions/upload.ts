"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { csvImports } from "@/lib/db/schema";
import { parseCSV, reportTypeLabels } from "@/lib/parsers";
import type { ReportType } from "@/lib/parsers";

export interface UploadResult {
  success: boolean;
  reportType: ReportType;
  reportTypeLabel: string;
  rowCount: number;
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

  // Record the import
  await db.insert(csvImports).values({
    organizationId: session.organizationId,
    reportType: parsed.type,
    fileName: file.name,
    rowCount: parsed.rowCount,
    stats: {
      importedBy: session.user.email,
      parsedAt: new Date().toISOString(),
    },
  });

  revalidatePath("/");
  revalidatePath("/upload");

  return {
    success: true,
    reportType: parsed.type,
    reportTypeLabel: reportTypeLabels[parsed.type],
    rowCount: parsed.rowCount,
  };
}
