import React from "react";
import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RequisitionFormData } from "./types";

interface SignaturesProps {
  register: UseFormRegister<RequisitionFormData>;
}

export const Signatures: React.FC<SignaturesProps> = ({ register }) => {
  const roles = [
    { key: "prepared", label: "Prepared By" },
    { key: "checked", label: "Checked By" },
    { key: "approved", label: "Approved By" },
    { key: "received", label: "Received By (Materials)" },
  ] as const;

  return (
    <div className="bg-muted/20 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 md:grid-cols-4">
      {roles.map((role) => (
        <div key={role.key} className="bg-card space-y-2 rounded border p-3 shadow-sm">
          <Label className="text-foreground/80 text-xs font-bold uppercase">
            {role.label}
          </Label>
          <div className="space-y-1">
            <Input
              {...register(`signatures.${role.key}.name` as const)}
              placeholder="Name"
              className="h-8 text-xs font-medium"
            />
            <Input
              {...register(`signatures.${role.key}.date` as const)}
              placeholder="Signature Date"
              className="text-muted-foreground h-8 font-mono text-[11px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
