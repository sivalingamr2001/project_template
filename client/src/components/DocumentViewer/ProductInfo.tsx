import React from "react";
import { type UseFormRegister, type Control, Controller, useFormContext, type UseFormSetValue } from "react-hook-form";
import { useSearchApi } from "@/core/api/useSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RequisitionFormData } from "./types";

interface ProductInfoProps {
  register: UseFormRegister<RequisitionFormData>;
  control: Control<RequisitionFormData>;
  setValue?: UseFormSetValue<RequisitionFormData>;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ register, control, setValue: setValueProp }) => {
  let formContext: { setValue?: UseFormSetValue<RequisitionFormData> } | undefined;
  try {
    formContext = useFormContext<RequisitionFormData>();
  } catch {
    formContext = undefined;
  }

  const setValue = setValueProp ?? formContext?.setValue;

  const fetchAndPopulate = async (query: string) => {
    if (!query || !query.trim() || !setValue) return;
    try {
      const results = await useSearchApi.searchProjects(query, 1, 1);
      if (results && results.length > 0) {
        const r = results[0];
        if (r.productNo !== undefined) setValue("productNo" as any, r.productNo);
        if (r.revision !== undefined) setValue("rev" as any, r.revision);
        if (r.projectNumber !== undefined) setValue("projectNo" as any, r.projectNumber);
        if (r.projectName !== undefined) setValue("productName" as any, r.projectName);
      }
    } catch (e) {
      // ignore
    }
  };
  return (
    <div className="bg-card grid grid-cols-1 gap-6 rounded-lg border p-5 shadow-sm md:grid-cols-3">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="productNo"
            className="text-muted-foreground text-xs font-semibold uppercase"
          >
            Product No.
          </Label>
          {(() => {
            const reg = register("productNo");
            return (
              <Input
                id="productNo"
                {...reg}
                className="h-9"
                onBlur={(e) => {
                  reg.onBlur?.(e);
                  fetchAndPopulate((e.target as HTMLInputElement).value);
                }}
              />
            );
          })()}
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="rev"
            className="text-muted-foreground text-xs font-semibold uppercase"
          >
            Revision
          </Label>
          <Input id="rev" {...register("rev")} className="h-9 font-mono" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="projectNo"
            className="text-muted-foreground text-xs font-semibold uppercase"
          >
            Project No.
          </Label>
          {(() => {
            const reg = register("projectNo");
            return (
              <Input
                id="projectNo"
                {...reg}
                className="h-9"
                onBlur={(e) => {
                  reg.onBlur?.(e);
                  fetchAndPopulate((e.target as HTMLInputElement).value);
                }}
              />
            );
          })()}
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="productName"
            className="text-muted-foreground text-xs font-semibold uppercase"
          >
            Product Name
          </Label>
          <Input id="productName" {...register("productName")} className="h-9" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="purpose"
            className="text-muted-foreground text-xs font-semibold uppercase"
          >
            Purpose
          </Label>
          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New product validation">
                    New product validation
                  </SelectItem>
                  <SelectItem value="Sales Requirement">Sales Requirement</SelectItem>
                  <SelectItem value="Design Optimization">Design Optimization</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="monthlyQty"
            className="text-muted-foreground text-xs font-semibold uppercase"
          >
            Est. Monthly Quantity
          </Label>
          <Input
            id="monthlyQty"
            {...register("monthlyQty")}
            className="h-9"
            placeholder="As per new product req."
          />
        </div>
      </div>
    </div>
  );
};
