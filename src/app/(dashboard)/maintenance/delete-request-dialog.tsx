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
import { deleteMaintenanceRequestAction } from "@/lib/actions/maintenance";
import type { MaintenanceRequestWithRelations } from "@/lib/services/maintenance";

interface DeleteRequestDialogProps {
  request: MaintenanceRequestWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRequestDialog({
  request,
  open,
  onOpenChange,
}: DeleteRequestDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!request) return;
    setIsDeleting(true);
    try {
      const result = await deleteMaintenanceRequestAction(request.id);
      if (result.success) {
        toast.success("Maintenance request deleted successfully");
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
          <DialogTitle>Delete Maintenance Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the request &quot;{request?.title}&quot;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
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
