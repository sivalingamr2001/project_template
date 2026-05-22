import React from "react";
import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RequisitionFormData } from "./types";

interface FormMetaProps {
  register: UseFormRegister<RequisitionFormData>;
}

export const FormMeta: React.FC<FormMetaProps> = ({ register }) => {
  return (
    <div className="bg-card grid grid-cols-2 gap-4 rounded-lg border p-4 shadow-sm md:grid-cols-5">
      <div className="space-y-1.5">
        <Label
          htmlFor="recNo"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Rec. No.
        </Label>
        {/* CHANGED: Swapped disabled for readOnly */}
        <Input
          id="recNo"
          {...register("recNo")}
          className="h-9 font-mono bg-muted/40 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="date"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Date
        </Label>
        {/* FIXED: Added readOnly and moved cursor-not-allowed to className */}
        <Input
          id="date"
          type="date"
          readOnly
          {...register("date")}
          className="h-9 bg-muted/40 cursor-not-allowed"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="pageNo"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Page No.
        </Label>
        {/* CHANGED: Swapped disabled for readOnly */}
        <Input
          id="pageNo"
          {...register("pageNo")}
          className="h-9 bg-muted/40 cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="from"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          From
        </Label>
        <Input
          id="from"
          defaultValue="(D&D Team)"
          readOnly
          {...register("from")}
          className="h-9 bg-muted cursor-not-allowed"
        />
      </div>

      <div className="col-span-2 space-y-1.5 md:col-span-1">
        <Label
          htmlFor="to"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          To
        </Label>
        <Input
          id="to"
          defaultValue="(Materials-D&D)"
          readOnly
          {...register("to")}
          className="h-9 bg-muted cursor-not-allowed"
        />
      </div>
    </div>
  );
};
