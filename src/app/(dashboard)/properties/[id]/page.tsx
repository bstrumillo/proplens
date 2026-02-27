import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Ruler, DollarSign } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getPropertyById } from "@/lib/services/properties";
import { getBuildings } from "@/lib/services/buildings";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BuildingsTable } from "./buildings-table";

const propertyTypeLabels: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  industrial: "Industrial",
};

const propertyTypeBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  residential: "default",
  commercial: "secondary",
  mixed_use: "outline",
  industrial: "destructive",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  under_renovation: "Under Renovation",
  for_sale: "For Sale",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  under_renovation: "outline",
  for_sale: "outline",
};

function formatCurrency(value: string | null): string {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatNumber(value: string | null): string {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const property = await getPropertyById(session.organizationId, id);
  if (!property) {
    notFound();
  }

  const propertyBuildings = await getBuildings(session.organizationId, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>
      </div>

      <PageHeader title={property.name}>
        <div className="flex items-center gap-2">
          <Badge variant={propertyTypeBadgeVariant[property.type] ?? "default"}>
            {propertyTypeLabels[property.type] ?? property.type}
          </Badge>
          <Badge variant={statusBadgeVariant[property.status] ?? "secondary"}>
            {statusLabels[property.status] ?? property.status}
          </Badge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Address</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>{property.addressLine1}</p>
              {property.addressLine2 && <p>{property.addressLine2}</p>}
              <p>
                {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year Built</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {property.yearBuilt ?? "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sq Ft</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(property.totalSqft)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(property.purchasePrice)}
            </div>
          </CardContent>
        </Card>
      </div>

      {property.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {property.description}
            </p>
          </CardContent>
        </Card>
      )}

      <BuildingsTable
        propertyId={property.id}
        buildings={propertyBuildings}
      />
    </div>
  );
}
