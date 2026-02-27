import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { organizationMembers } from "./users";
import { properties, buildings } from "./properties";
import { units } from "./units";
import { tenants } from "./tenants";
import { leases, leaseDocuments } from "./leases";
import { payments, paymentMethods } from "./payments";
import {
  maintenanceRequests,
  maintenancePhotos,
  workOrders,
} from "./maintenance";
import { vendors, vendorContracts } from "./vendors";
import { communications, communicationTemplates } from "./communications";
import {
  financialCategories,
  financialTransactions,
  bankConnections,
} from "./financials";
import { apiKeys } from "./api-keys";
import { auditLog } from "./audit-log";

// ── Organization Relations ───────────────────────────────────────────
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  properties: many(properties),
  buildings: many(buildings),
  units: many(units),
  tenants: many(tenants),
  leases: many(leases),
  leaseDocuments: many(leaseDocuments),
  payments: many(payments),
  paymentMethods: many(paymentMethods),
  maintenanceRequests: many(maintenanceRequests),
  maintenancePhotos: many(maintenancePhotos),
  workOrders: many(workOrders),
  vendors: many(vendors),
  vendorContracts: many(vendorContracts),
  communications: many(communications),
  communicationTemplates: many(communicationTemplates),
  financialCategories: many(financialCategories),
  financialTransactions: many(financialTransactions),
  bankConnections: many(bankConnections),
  apiKeys: many(apiKeys),
  auditLog: many(auditLog),
}));

// ── Organization Members Relations ───────────────────────────────────
export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
  })
);

// ── Property Relations ───────────────────────────────────────────────
export const propertiesRelations = relations(
  properties,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [properties.organizationId],
      references: [organizations.id],
    }),
    buildings: many(buildings),
    financialTransactions: many(financialTransactions),
  })
);

// ── Building Relations ───────────────────────────────────────────────
export const buildingsRelations = relations(
  buildings,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [buildings.organizationId],
      references: [organizations.id],
    }),
    property: one(properties, {
      fields: [buildings.propertyId],
      references: [properties.id],
    }),
    units: many(units),
  })
);

// ── Unit Relations ───────────────────────────────────────────────────
export const unitsRelations = relations(units, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [units.organizationId],
    references: [organizations.id],
  }),
  building: one(buildings, {
    fields: [units.buildingId],
    references: [buildings.id],
  }),
  leases: many(leases),
  maintenanceRequests: many(maintenanceRequests),
}));

// ── Tenant Relations ─────────────────────────────────────────────────
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tenants.organizationId],
    references: [organizations.id],
  }),
  leases: many(leases),
  payments: many(payments),
  paymentMethods: many(paymentMethods),
  maintenanceRequests: many(maintenanceRequests),
}));

// ── Lease Relations ──────────────────────────────────────────────────
export const leasesRelations = relations(leases, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leases.organizationId],
    references: [organizations.id],
  }),
  unit: one(units, {
    fields: [leases.unitId],
    references: [units.id],
  }),
  tenant: one(tenants, {
    fields: [leases.tenantId],
    references: [tenants.id],
  }),
  documents: many(leaseDocuments),
  payments: many(payments),
}));

export const leaseDocumentsRelations = relations(
  leaseDocuments,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [leaseDocuments.organizationId],
      references: [organizations.id],
    }),
    lease: one(leases, {
      fields: [leaseDocuments.leaseId],
      references: [leases.id],
    }),
  })
);

// ── Payment Relations ────────────────────────────────────────────────
export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organizations, {
    fields: [payments.organizationId],
    references: [organizations.id],
  }),
  lease: one(leases, {
    fields: [payments.leaseId],
    references: [leases.id],
  }),
  tenant: one(tenants, {
    fields: [payments.tenantId],
    references: [tenants.id],
  }),
}));

export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [paymentMethods.organizationId],
      references: [organizations.id],
    }),
    tenant: one(tenants, {
      fields: [paymentMethods.tenantId],
      references: [tenants.id],
    }),
  })
);

// ── Maintenance Relations ────────────────────────────────────────────
export const maintenanceRequestsRelations = relations(
  maintenanceRequests,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [maintenanceRequests.organizationId],
      references: [organizations.id],
    }),
    unit: one(units, {
      fields: [maintenanceRequests.unitId],
      references: [units.id],
    }),
    tenant: one(tenants, {
      fields: [maintenanceRequests.tenantId],
      references: [tenants.id],
    }),
    photos: many(maintenancePhotos),
    workOrders: many(workOrders),
  })
);

export const maintenancePhotosRelations = relations(
  maintenancePhotos,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [maintenancePhotos.organizationId],
      references: [organizations.id],
    }),
    request: one(maintenanceRequests, {
      fields: [maintenancePhotos.requestId],
      references: [maintenanceRequests.id],
    }),
  })
);

export const workOrdersRelations = relations(workOrders, ({ one }) => ({
  organization: one(organizations, {
    fields: [workOrders.organizationId],
    references: [organizations.id],
  }),
  request: one(maintenanceRequests, {
    fields: [workOrders.requestId],
    references: [maintenanceRequests.id],
  }),
}));

// ── Vendor Relations ─────────────────────────────────────────────────
export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vendors.organizationId],
    references: [organizations.id],
  }),
  contracts: many(vendorContracts),
}));

export const vendorContractsRelations = relations(
  vendorContracts,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [vendorContracts.organizationId],
      references: [organizations.id],
    }),
    vendor: one(vendors, {
      fields: [vendorContracts.vendorId],
      references: [vendors.id],
    }),
  })
);

// ── Communication Relations ──────────────────────────────────────────
export const communicationsRelations = relations(
  communications,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [communications.organizationId],
      references: [organizations.id],
    }),
  })
);

export const communicationTemplatesRelations = relations(
  communicationTemplates,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [communicationTemplates.organizationId],
      references: [organizations.id],
    }),
  })
);

// ── Financial Relations ──────────────────────────────────────────────
export const financialCategoriesRelations = relations(
  financialCategories,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [financialCategories.organizationId],
      references: [organizations.id],
    }),
    parent: one(financialCategories, {
      fields: [financialCategories.parentId],
      references: [financialCategories.id],
      relationName: "categoryParent",
    }),
    children: many(financialCategories, {
      relationName: "categoryParent",
    }),
    transactions: many(financialTransactions),
  })
);

export const financialTransactionsRelations = relations(
  financialTransactions,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [financialTransactions.organizationId],
      references: [organizations.id],
    }),
    property: one(properties, {
      fields: [financialTransactions.propertyId],
      references: [properties.id],
    }),
    category: one(financialCategories, {
      fields: [financialTransactions.categoryId],
      references: [financialCategories.id],
    }),
  })
);

export const bankConnectionsRelations = relations(
  bankConnections,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [bankConnections.organizationId],
      references: [organizations.id],
    }),
  })
);

// ── API Key Relations ────────────────────────────────────────────────
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiKeys.organizationId],
    references: [organizations.id],
  }),
}));

// ── Audit Log Relations ──────────────────────────────────────────────
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLog.organizationId],
    references: [organizations.id],
  }),
}));
