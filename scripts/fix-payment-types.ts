import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

/**
 * Classify an AppFolio account name / description into a payment category.
 * Mirrors the logic from src/lib/parsers/receipts.ts → classifyAccountType()
 */
function classifyAccountType(
  description: string
): "rent" | "fee" | "insurance" | "cam" | "security_deposit" | "prepayment" | "other" {
  const lower = description.toLowerCase().trim();
  if (lower === "rent") return "rent";
  if (lower.includes("management fee")) return "fee";
  if (lower.includes("tenant liability insurance") || lower.includes("renters insurance")) return "insurance";
  if (lower.startsWith("cam")) return "cam";
  if (lower.includes("prepay")) return "prepayment";
  if (lower.includes("security deposit")) return "security_deposit";
  return "other";
}

/**
 * Map a classified category to the payment type stored in the DB.
 * Mirrors the mapping from src/lib/services/csv-import.ts → categoryToPaymentType(),
 * with the special case that "cam" maps to "fee" per task requirements.
 */
function categoryToPaymentType(
  category: ReturnType<typeof classifyAccountType>
): string | null {
  switch (category) {
    case "rent":
      return "rent";
    case "fee":
      return "fee";
    case "insurance":
      return "insurance";
    case "cam":
      return "fee"; // CAM charges are fees
    case "security_deposit":
      return "security_deposit";
    case "prepayment":
      return null; // Signal to delete
    case "other":
      return "other";
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("--- Payment Type Cleanup Script ---\n");

  // 1. Query all payments with type = 'rent'
  const rentPayments = await db
    .select({
      id: schema.payments.id,
      description: schema.payments.description,
      type: schema.payments.type,
    })
    .from(schema.payments)
    .where(eq(schema.payments.type, "rent"));

  console.log(`Found ${rentPayments.length} payments with type = 'rent'\n`);

  if (rentPayments.length === 0) {
    console.log("Nothing to do. Exiting.");
    await pool.end();
    return;
  }

  // 2. Classify each payment and track changes
  const summary = {
    keptAsRent: 0,
    reclassifiedToFee: 0,
    reclassifiedToInsurance: 0,
    reclassifiedToSecurityDeposit: 0,
    reclassifiedToOther: 0,
    deletedPrepayments: 0,
  };

  for (const payment of rentPayments) {
    const description = payment.description ?? "";
    const category = classifyAccountType(description);
    const newType = categoryToPaymentType(category);

    if (newType === null) {
      // Prepayment: delete the row
      await db
        .delete(schema.payments)
        .where(eq(schema.payments.id, payment.id));
      summary.deletedPrepayments++;
      console.log(
        `  DELETED prepayment: "${description}" (id: ${payment.id})`
      );
    } else if (newType === "rent") {
      // Already correct, no update needed
      summary.keptAsRent++;
    } else {
      // Reclassify
      await db
        .update(schema.payments)
        .set({ type: newType })
        .where(eq(schema.payments.id, payment.id));

      switch (newType) {
        case "fee":
          summary.reclassifiedToFee++;
          break;
        case "insurance":
          summary.reclassifiedToInsurance++;
          break;
        case "security_deposit":
          summary.reclassifiedToSecurityDeposit++;
          break;
        case "other":
          summary.reclassifiedToOther++;
          break;
      }

      console.log(
        `  UPDATED: "${description}" → type="${newType}" (id: ${payment.id})`
      );
    }
  }

  // 3. Print summary
  console.log("\n--- Summary ---");
  console.log(`  Kept as rent:                 ${summary.keptAsRent}`);
  console.log(`  Reclassified to fee:          ${summary.reclassifiedToFee}`);
  console.log(`  Reclassified to insurance:    ${summary.reclassifiedToInsurance}`);
  console.log(`  Reclassified to security_deposit: ${summary.reclassifiedToSecurityDeposit}`);
  console.log(`  Reclassified to other:        ${summary.reclassifiedToOther}`);
  console.log(`  Deleted (prepayments):        ${summary.deletedPrepayments}`);
  console.log(
    `  Total processed:              ${rentPayments.length}`
  );

  await pool.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
