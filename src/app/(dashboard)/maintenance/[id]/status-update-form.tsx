"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMaintenanceRequestAction } from "@/lib/actions/maintenance";
import { STATUSES } from "@/lib/validators/maintenance";

interface StatusUpdateFormProps {
  requestId: string;
  currentStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function StatusUpdateForm({ requestId, currentStatus }: StatusUpdateFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStatusUpdate() {
    if (status === currentStatus) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("status", status);

      const result = await updateMaintenanceRequestAction(requestId, formData);
      if (result.success) {
        toast.success("Status updated successfully");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="w-full"
        onClick={handleStatusUpdate}
        disabled={isSubmitting || status === currentStatus}
      >
        {isSubmitting ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}
