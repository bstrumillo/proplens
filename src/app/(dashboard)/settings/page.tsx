import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { getOrganization, listMembers } from "@/lib/services/organizations";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationForm } from "./organization-form";

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  viewer: "Viewer",
};

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default async function SettingsPage() {
  const session = await requireSession();

  const [organization, members] = await Promise.all([
    getOrganization(session.organizationId),
    listMembers(session.organizationId),
  ]);

  if (!organization) {
    notFound();
  }

  const canEdit = hasPermission(session.role, "admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization profile and team."
      />

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>
            {canEdit
              ? "Update your organization's contact details."
              : "Only owners and admins can update organization settings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm
            organization={{
              name: organization.name,
              email: organization.email,
              phone: organization.phone,
              address: organization.address,
            }}
            canEdit={canEdit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.userName ?? "—"}
                    </TableCell>
                    <TableCell>{member.userEmail ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "owner" ? "default" : "secondary"
                        }
                      >
                        {roleLabels[member.role] ?? member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(member.acceptedAt ?? member.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entities &amp; Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Legal entities and payout account management are coming in the
              Financial Engine phase.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Payment processing settings are coming in the Financial Engine
              phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
