"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUnitAction } from "@/lib/actions/units";
import type { UnitWithBuilding } from "@/lib/services/units";

interface DeleteUnitDialogProps {
  unit: UnitWithBuilding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUnitDialog({
  unit,
  open,
  onOpenChange,
}: DeleteUnitDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!unit) return;
    setIsDeleting(true);
    try {
      const result = await deleteUnitAction(unit.id);
      if (result.success) {
        toast.success("Unit deleted successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Unit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete unit{" "}
            <span className="font-medium">
              {unit?.unitNumber}
            </span>
            {unit?.buildingName ? (
              <>
                {" "}in{" "}
                <span className="font-medium">{unit.buildingName}</span>
              </>
            ) : null}
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
