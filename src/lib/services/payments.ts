import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, leases, units } from "@/lib/db/schema";
import type { Payment } from "@/types";

// Read-side payment queries. Grows into the full payments/ledger service in
// Phase B (recordManualPayment, createCharge, getLeaseLedger, ...).

export type PaymentWithContext = Payment & {
  unitNumber: string | null;
};

export async function listPaymentsByTenant(
  organizationId: string,
  tenantId: string
): Promise<PaymentWithContext[]> {
  const rows = await db
    .select({
      payment: payments,
      unitNumber: units.unitNumber,
    })
    .from(payments)
    .leftJoin(leases, eq(payments.leaseId, leases.id))
    .leftJoin(units, eq(leases.unitId, units.id))
    .where(
      and(
        eq(payments.organizationId, organizationId),
        eq(payments.tenantId, tenantId)
      )
    )
    .orderBy(desc(payments.paidAt), desc(payments.createdAt));

  return rows.map((row) => ({
    ...row.payment,
    unitNumber: row.unitNumber,
  }));
}
