import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  organizations,
  organizationMembers,
  properties,
  buildings,
  units,
  tenants,
  leases,
  leaseDocuments,
  payments,
  paymentMethods,
  maintenanceRequests,
  maintenancePhotos,
  workOrders,
  vendors,
  vendorContracts,
  communications,
  communicationTemplates,
  financialTransactions,
  financialCategories,
  bankConnections,
  apiKeys,
  auditLog,
} from "@/lib/db/schema";

// Select types (read from DB)
export type Organization = InferSelectModel<typeof organizations>;
export type OrganizationMember = InferSelectModel<typeof organizationMembers>;
export type Property = InferSelectModel<typeof properties>;
export type Building = InferSelectModel<typeof buildings>;
export type Unit = InferSelectModel<typeof units>;
export type Tenant = InferSelectModel<typeof tenants>;
export type Lease = InferSelectModel<typeof leases>;
export type LeaseDocument = InferSelectModel<typeof leaseDocuments>;
export type Payment = InferSelectModel<typeof payments>;
export type PaymentMethod = InferSelectModel<typeof paymentMethods>;
export type MaintenanceRequest = InferSelectModel<typeof maintenanceRequests>;
export type MaintenancePhoto = InferSelectModel<typeof maintenancePhotos>;
export type WorkOrder = InferSelectModel<typeof workOrders>;
export type Vendor = InferSelectModel<typeof vendors>;
export type VendorContract = InferSelectModel<typeof vendorContracts>;
export type Communication = InferSelectModel<typeof communications>;
export type CommunicationTemplate = InferSelectModel<typeof communicationTemplates>;
export type FinancialTransaction = InferSelectModel<typeof financialTransactions>;
export type FinancialCategory = InferSelectModel<typeof financialCategories>;
export type BankConnection = InferSelectModel<typeof bankConnections>;
export type ApiKey = InferSelectModel<typeof apiKeys>;
export type AuditLogEntry = InferSelectModel<typeof auditLog>;

// Insert types (write to DB)
export type NewOrganization = InferInsertModel<typeof organizations>;
export type NewOrganizationMember = InferInsertModel<typeof organizationMembers>;
export type NewProperty = InferInsertModel<typeof properties>;
export type NewBuilding = InferInsertModel<typeof buildings>;
export type NewUnit = InferInsertModel<typeof units>;
export type NewTenant = InferInsertModel<typeof tenants>;
export type NewLease = InferInsertModel<typeof leases>;
export type NewLeaseDocument = InferInsertModel<typeof leaseDocuments>;
export type NewPayment = InferInsertModel<typeof payments>;
export type NewPaymentMethod = InferInsertModel<typeof paymentMethods>;
export type NewMaintenanceRequest = InferInsertModel<typeof maintenanceRequests>;
export type NewMaintenancePhoto = InferInsertModel<typeof maintenancePhotos>;
export type NewWorkOrder = InferInsertModel<typeof workOrders>;
export type NewVendor = InferInsertModel<typeof vendors>;
export type NewVendorContract = InferInsertModel<typeof vendorContracts>;
export type NewCommunication = InferInsertModel<typeof communications>;
export type NewCommunicationTemplate = InferInsertModel<typeof communicationTemplates>;
export type NewFinancialTransaction = InferInsertModel<typeof financialTransactions>;
export type NewFinancialCategory = InferInsertModel<typeof financialCategories>;
export type NewBankConnection = InferInsertModel<typeof bankConnections>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;
export type NewAuditLogEntry = InferInsertModel<typeof auditLog>;
