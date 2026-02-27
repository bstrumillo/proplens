import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, KeyRound, User, Home } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getMaintenanceRequestById } from "@/lib/services/maintenance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge, StatusBadge } from "../columns";
import { StatusUpdateForm } from "./status-update-form";

interface MaintenanceRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MaintenanceRequestDetailPage({
  params,
}: MaintenanceRequestDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const request = await getMaintenanceRequestById(session.organizationId, id);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/maintenance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{request.title}</h1>
          <p className="text-muted-foreground mt-1">
            Created on{" "}
            {new Date(request.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.description ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{request.description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No description provided.</p>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Unit</p>
                    <p className="text-sm text-muted-foreground">
                      {request.unitNumber ?? "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tenant</p>
                    <p className="text-sm text-muted-foreground">
                      {request.tenantName ?? "Not assigned"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {request.category ?? "Not specified"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Entry Permission</p>
                    <p className="text-sm text-muted-foreground">
                      {request.entryPermission ? "Permitted" : "Not permitted"}
                    </p>
                  </div>
                </div>
              </div>

              {request.assignedTo && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">
                      {request.assignedTo}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-2xl font-bold">
                    {request.estimatedCost
                      ? `$${Number(request.estimatedCost).toFixed(2)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Actual Cost</p>
                  <p className="text-2xl font-bold">
                    {request.actualCost
                      ? `$${Number(request.actualCost).toFixed(2)}`
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the request status</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusUpdateForm requestId={request.id} currentStatus={request.status} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>
                    {new Date(request.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>
                    {new Date(request.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {request.resolvedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolved</span>
                    <span>
                      {new Date(request.resolvedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
