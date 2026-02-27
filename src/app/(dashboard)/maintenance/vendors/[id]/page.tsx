import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Award,
  Shield,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getVendorById } from "@/lib/services/vendors";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VendorDetailActions } from "./vendor-detail-actions";

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    inactive: {
      label: "Inactive",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    suspended: {
      label: "Suspended",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "",
  };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export default async function VendorDetailPage({
  params,
}: VendorDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const vendor = await getVendorById(session.organizationId, id);

  if (!vendor) {
    notFound();
  }

  const specialties = Array.isArray(vendor.specialties)
    ? (vendor.specialties as string[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/maintenance/vendors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Link>
        </Button>
      </div>

      <PageHeader
        title={vendor.name}
        description={`Vendor since ${new Date(vendor.createdAt).toLocaleDateString()}`}
      >
        <div className="flex items-center gap-2">
          <StatusBadge status={vendor.status} />
          <VendorDetailActions vendor={vendor} />
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.companyName && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{vendor.companyName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">
                  {vendor.email ?? "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">
                  {vendor.phone ?? "Not provided"}
                </p>
              </div>
            </div>
            {vendor.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{vendor.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="text-sm font-medium">
                  {vendor.hourlyRate ? `$${vendor.hourlyRate}/hr` : "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="text-sm font-medium">
                  {vendor.licenseNumber ?? "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Insurance Expiry</p>
                <p className="text-sm font-medium">
                  {vendor.insuranceExpiry ?? "Not provided"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rating</p>
              <p className="text-sm font-medium">
                {vendor.rating ? `${vendor.rating} / 5.00` : "No rating yet"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
              <p className="text-sm font-medium">{vendor.totalJobs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {vendor.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{vendor.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
