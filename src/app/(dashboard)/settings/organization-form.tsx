"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/lib/validators/organization";
import { updateOrganizationAction } from "@/lib/actions/organization-settings";

// Zod v4 + react-hook-form resolver type workaround
const resolver = zodResolver(
  updateOrganizationSchema
) as Resolver<UpdateOrganizationInput>;

interface OrganizationFormProps {
  organization: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  canEdit: boolean;
}

export function OrganizationForm({
  organization,
  canEdit,
}: OrganizationFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateOrganizationInput>({
    resolver,
    defaultValues: {
      name: organization.name ?? "",
      email: organization.email ?? "",
      phone: organization.phone ?? "",
      address: organization.address ?? "",
    },
  });

  function onSubmit(values: UpdateOrganizationInput) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      const result = await updateOrganizationAction(formData);

      if (result.success) {
        toast.success("Organization settings updated");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={!canEdit || isPending} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Organization name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(555) 123-4567"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="123 Main St, Suite 100, City, State 12345"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" disabled={!canEdit || isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
