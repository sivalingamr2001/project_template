import React from "react";
import { type UseFormRegister, type Control, Controller } from "react-hook-form";
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
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ register, control }) => {
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
          <Input id="productNo" {...register("productNo")} className="h-9" />
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
          <Input id="projectNo" {...register("projectNo")} className="h-9" />
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
