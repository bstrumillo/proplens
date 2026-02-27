"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { DoorOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getColumns } from "./columns";
import { UnitForm } from "./unit-form";
import { DeleteUnitDialog } from "./delete-unit-dialog";
import type { UnitWithBuilding, BuildingOption } from "@/lib/services/units";

interface UnitsClientProps {
  units: UnitWithBuilding[];
  totalCount: number;
  buildings: BuildingOption[];
}

export function UnitsClient({
  units,
  totalCount,
  buildings,
}: UnitsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUnit, setEditingUnit] = useState<UnitWithBuilding | null>(null);
  const [deleteUnit, setDeleteUnit] = useState<UnitWithBuilding | null>(null);

  function handleEdit(unit: UnitWithBuilding) {
    setEditingUnit(unit);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleDelete(unit: UnitWithBuilding) {
    setDeleteUnit(unit);
  }

  function handleCreate() {
    setEditingUnit(null);
    setFormMode("create");
    setFormOpen(true);
  }

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="Manage your rental units across all buildings"
      >
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </PageHeader>

      {units.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No units yet"
          description="Get started by adding your first unit to manage."
        >
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={units}
          totalCount={totalCount}
        />
      )}

      <UnitForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingUnit(null);
        }}
        mode={formMode}
        unit={editingUnit}
        buildings={buildings}
      />

      <DeleteUnitDialog
        unit={deleteUnit}
        open={!!deleteUnit}
        onOpenChange={(open) => {
          if (!open) setDeleteUnit(null);
        }}
      />
    </div>
  );
}
