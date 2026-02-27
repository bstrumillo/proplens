import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  FileText,
  CreditCard,
  Wrench,
} from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getTenantById } from "@/lib/services/tenants";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { TenantDetailActions } from "./tenant-detail-actions";

interface TenantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const tenant = await getTenantById(session.organizationId, id);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tenants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${tenant.firstName} ${tenant.lastName}`}
        description={`Tenant since ${new Date(tenant.createdAt).toLocaleDateString()}`}
      >
        <TenantDetailActions tenant={tenant} />
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{tenant.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">
                  {tenant.phone ?? "Not provided"}
                </p>
              </div>
            </div>
            {tenant.dateOfBirth && (
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="text-sm font-medium">{tenant.dateOfBirth}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Employer</p>
                <p className="text-sm font-medium">
                  {tenant.employer ?? "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenant.emergencyName ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{tenant.emergencyName}</p>
                </div>
                {tenant.emergencyPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">
                      {tenant.emergencyPhone}
                    </p>
                  </div>
                )}
                {tenant.emergencyRelation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <Badge variant="secondary">{tenant.emergencyRelation}</Badge>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No emergency contact provided.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {tenant.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{tenant.notes}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="leases">
        <TabsList>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="leases" className="mt-4">
          <EmptyState
            icon={FileText}
            title="No leases found"
            description="This tenant has no active or past leases."
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="This tenant has no payment records."
          />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <EmptyState
            icon={Wrench}
            title="No maintenance requests"
            description="This tenant has not submitted any maintenance requests."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
