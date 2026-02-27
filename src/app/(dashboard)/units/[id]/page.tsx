import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, DoorOpen, User, FileText } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getUnitById } from "@/lib/services/units";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusLabels: Record<string, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  maintenance: "Maintenance",
  reserved: "Reserved",
  not_rentable: "Not Rentable",
};

const statusBadgeClasses: Record<string, string> = {
  vacant: "bg-green-100 text-green-800 hover:bg-green-100",
  occupied: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  reserved: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  not_rentable: "bg-red-100 text-red-800 hover:bg-red-100",
};

const unitTypeLabels: Record<string, string> = {
  apartment: "Apartment",
  studio: "Studio",
  townhouse: "Townhouse",
  condo: "Condo",
  commercial: "Commercial",
  storage: "Storage",
};

function formatCurrency(value: string | null): string {
  if (!value) return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

interface UnitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;

  const unit = await getUnitById(session.organizationId, id);
  if (!unit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/units">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Unit {unit.unitNumber}
            </h1>
            <Badge
              variant="outline"
              className={statusBadgeClasses[unit.status] ?? ""}
            >
              {statusLabels[unit.status] ?? unit.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {unit.buildingName}
            {unit.buildingAddress ? ` - ${unit.buildingAddress}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Unit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Unit Details
            </CardTitle>
            <CardDescription>
              Physical details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">
                  {unitTypeLabels[unit.type] ?? unit.type}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Floor</dt>
                <dd className="font-medium">
                  {unit.floor !== null ? unit.floor : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Bedrooms</dt>
                <dd className="font-medium">
                  {unit.bedrooms !== null ? unit.bedrooms : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Bathrooms</dt>
                <dd className="font-medium">
                  {unit.bathrooms !== null ? unit.bathrooms : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Square Feet</dt>
                <dd className="font-medium">
                  {unit.sqft ? `${unit.sqft} sq ft` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Furnished</dt>
                <dd className="font-medium">
                  {unit.isFurnished ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Corporate</dt>
                <dd className="font-medium">
                  {unit.isCorporate ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Financial Details
            </CardTitle>
            <CardDescription>Rent and deposit information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Market Rent</dt>
                <dd className="font-medium text-lg">
                  {formatCurrency(unit.marketRent)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Current Rent</dt>
                <dd className="font-medium text-lg">
                  {formatCurrency(unit.currentRent)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Deposit Amount</dt>
                <dd className="font-medium">
                  {formatCurrency(unit.depositAmount)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Current Tenant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Tenant
            </CardTitle>
            <CardDescription>
              Tenant currently assigned to this unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unit.currentTenantId ? (
              <div className="text-sm">
                <Link
                  href={`/tenants/${unit.currentTenantId}`}
                  className="font-medium text-primary hover:underline"
                >
                  View Tenant Details
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tenant currently assigned to this unit.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Current Lease */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Current Lease
            </CardTitle>
            <CardDescription>
              Active lease for this unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unit.currentLeaseId ? (
              <div className="text-sm">
                <p className="font-medium">
                  Lease ID: {unit.currentLeaseId}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active lease for this unit.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {unit.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {unit.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
