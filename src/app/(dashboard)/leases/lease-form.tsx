"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createLeaseSchema,
  leaseTypeValues,
  type CreateLeaseInput,
} from "@/lib/validators/leases";
import { createLeaseAction, updateLeaseAction } from "@/lib/actions/leases";
import type { LeaseWithDetails } from "@/lib/services/leases";
import type { UnitOption, TenantOption } from "@/lib/services/leases";

const leaseTypeLabels: Record<string, string> = {
  fixed: "Fixed",
  month_to_month: "Month-to-Month",
  corporate: "Corporate",
  student: "Student",
  section8: "Section 8",
};

// Zod v4 + react-hook-form resolver type workaround
const resolver = zodResolver(createLeaseSchema) as Resolver<CreateLeaseInput>;

interface LeaseFormProps {
  mode: "create" | "edit";
  lease?: LeaseWithDetails | null;
  units: UnitOption[];
  tenants: TenantOption[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LeaseForm({
  mode,
  lease,
  units,
  tenants,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LeaseFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateLeaseInput>({
    resolver,
    defaultValues: {
      unitId: lease?.unitId ?? "",
      tenantId: lease?.tenantId ?? "",
      type: lease?.type ?? "fixed",
      startDate: lease?.startDate ?? "",
      endDate: lease?.endDate ?? "",
      monthlyRent: lease?.monthlyRent ?? "",
      securityDeposit: lease?.securityDeposit ?? "",
      petDeposit: lease?.petDeposit ?? "",
      furnishedPremium: lease?.furnishedPremium ?? "",
      rentDueDay: lease?.rentDueDay ?? 1,
      lateFeeAmount: lease?.lateFeeAmount ?? "",
      lateFeeGraceDays: lease?.lateFeeGraceDays ?? 5,
      autoRenew: lease?.autoRenew ?? false,
      notes: lease?.notes ?? "",
    },
  });

  async function onSubmit(data: CreateLeaseInput) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const result =
        mode === "create"
          ? await createLeaseAction(formData)
          : await updateLeaseAction(lease!.id, formData);

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Lease created successfully"
            : "Lease updated successfully"
        );
        onOpenChange(false);
        form.reset();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Lease" : "Edit Lease"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new lease agreement."
              : "Update lease details."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Unit & Tenant */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.unitNumber} ({unit.buildingName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a tenant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type & Dates */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaseTypeValues.map((type) => (
                          <SelectItem key={type} value={type}>
                            {leaseTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Financial Terms</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1500.00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="securityDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1500.00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="petDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Deposit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="500.00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="furnishedPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Furnished Premium</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="200.00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Payment Terms */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Payment Terms</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rentDueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Due Day (1-28)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={28}
                          {...field}
                          value={field.value ?? 1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lateFeeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late Fee Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="50.00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lateFeeGraceDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grace Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? 5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Auto-Renew */}
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Auto-renew lease
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this lease..."
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create Lease"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
