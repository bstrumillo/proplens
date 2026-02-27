"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getColumns } from "./columns";
import { PropertyForm } from "./property-form";
import { deletePropertyAction } from "@/lib/actions/properties";
import type { PropertyWithBuildingCount } from "@/lib/services/properties";

interface PropertiesClientProps {
  properties: PropertyWithBuildingCount[];
  totalCount: number;
}

export function PropertiesClient({
  properties,
  totalCount,
}: PropertiesClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProperty, setEditingProperty] =
    useState<PropertyWithBuildingCount | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEdit(property: PropertyWithBuildingCount) {
    setEditingProperty(property);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleDelete(property: PropertyWithBuildingCount) {
    if (!confirm(`Are you sure you want to delete "${property.name}"? This will also delete all buildings and units within it.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deletePropertyAction(property.id);
      if (result.success) {
        toast.success("Property deleted successfully");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCreate() {
    setEditingProperty(null);
    setFormMode("create");
    setFormOpen(true);
  }

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your property portfolio"
      >
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </PageHeader>

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Get started by adding your first property to manage."
        >
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={properties}
          totalCount={totalCount}
        />
      )}

      <PropertyForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProperty(null);
        }}
        mode={formMode}
        property={editingProperty}
      />
    </div>
  );
}
