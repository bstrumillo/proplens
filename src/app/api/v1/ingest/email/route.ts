import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailIngestions, csvImports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseCSV, reportTypeLabels } from "@/lib/parsers";
import { importParsedData } from "@/lib/services/csv-import";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  // 1. Auth via Bearer token — fail closed if the route isn't configured.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID;
  if (!DEFAULT_ORG_ID) {
    return NextResponse.json(
      { error: "DEFAULT_ORG_ID is not configured" },
      { status: 500 }
    );
  }

  try {
    // 2. Parse multipart form data
    const formData = await request.formData();
    const gmailMessageId = formData.get("gmailMessageId") as string;
    const subject = (formData.get("subject") as string) ?? "";
    const sender = (formData.get("sender") as string) ?? "";
    const receivedAt = formData.get("receivedAt") as string | null;
    const file = formData.get("file") as File | null;

    if (!gmailMessageId || !file) {
      return NextResponse.json(
        { error: "Missing gmailMessageId or file" },
        { status: 400 }
      );
    }

    // 3. Dedup check
    const existing = await db
      .select({ id: emailIngestions.id })
      .from(emailIngestions)
      .where(eq(emailIngestions.gmailMessageId, gmailMessageId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ status: "already_processed" });
    }

    // 4. Parse CSV
    const csvText = await file.text();
    const parsed = parseCSV(csvText);

    if (parsed.type === "unknown") {
      await db.insert(emailIngestions).values({
        organizationId: DEFAULT_ORG_ID,
        gmailMessageId,
        subject,
        sender,
        attachmentName: file.name,
        status: "skipped",
        errorMessage: "Could not detect report type",
        receivedAt: receivedAt ? new Date(receivedAt) : null,
        processedAt: new Date(),
      });
      return NextResponse.json({ status: "skipped", reason: "unknown_report_type" });
    }

    // 5. Import data into domain tables
    const result = await importParsedData(DEFAULT_ORG_ID, parsed);

    // 6. Record in csv_imports (for consistency with manual uploads)
    await db.insert(csvImports).values({
      organizationId: DEFAULT_ORG_ID,
      reportType: parsed.type,
      fileName: file.name,
      rowCount: parsed.rowCount,
      stats: {
        importedBy: "email-ingestion",
        parsedAt: new Date().toISOString(),
        source: "gmail",
        gmailMessageId,
        ...result,
      },
    });

    // 7. Record in email_ingestions
    await db.insert(emailIngestions).values({
      organizationId: DEFAULT_ORG_ID,
      gmailMessageId,
      subject,
      sender,
      attachmentName: file.name,
      reportType: parsed.type,
      rowCount: parsed.rowCount,
      status: result.errors.length > 0 ? "partial" : "success",
      stats: result,
      receivedAt: receivedAt ? new Date(receivedAt) : null,
      processedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/upload");

    return NextResponse.json({
      status: "imported",
      reportType: parsed.type,
      reportTypeLabel: reportTypeLabels[parsed.type],
      rowCount: parsed.rowCount,
      result,
    });
  } catch (error) {
    console.error("Email ingestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
