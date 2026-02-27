"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { BuildingForm } from "./building-form";
import { deleteBuildingAction } from "@/lib/actions/buildings";
import type { Building as BuildingType } from "@/types";

interface BuildingsTableProps {
  propertyId: string;
  buildings: BuildingType[];
}

export function BuildingsTable({
  propertyId,
  buildings,
}: BuildingsTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingBuilding, setEditingBuilding] = useState<BuildingType | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setEditingBuilding(null);
    setFormMode("create");
    setFormOpen(true);
  }

  function handleEdit(building: BuildingType) {
    setEditingBuilding(building);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleDelete(building: BuildingType) {
    if (
      !confirm(
        `Are you sure you want to delete "${building.name}"? This will also delete all units within it.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBuildingAction(building.id);
      if (result.success) {
        toast.success("Building deleted successfully");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Buildings</CardTitle>
            <CardDescription>
              {buildings.length} building{buildings.length !== 1 ? "s" : ""} in
              this property
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Building
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {buildings.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No buildings yet"
            description="Add buildings to organize the units within this property."
          >
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Button>
          </EmptyState>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Floors</TableHead>
                  <TableHead className="w-[70px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.map((building) => (
                  <TableRow key={building.id}>
                    <TableCell className="font-medium">
                      {building.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {building.addressLine1 ?? "-"}
                    </TableCell>
                    <TableCell>{building.totalUnits}</TableCell>
                    <TableCell>{building.floors ?? "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(building)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(building)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <BuildingForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingBuilding(null);
        }}
        mode={formMode}
        propertyId={propertyId}
        building={editingBuilding}
      />
    </Card>
  );
}
