import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { useFieldArray, type Control, type UseFormRegister, useFormContext, type UseFormSetValue } from "react-hook-form";
import { useSearchApi } from "@/core/api/useSearch";
import type { RequisitionFormData } from "./types";

interface PartTableProps {
  register: UseFormRegister<RequisitionFormData>;
  control: Control<RequisitionFormData>;
  setValue?: UseFormSetValue<RequisitionFormData>;
}

export const PartTable: React.FC<PartTableProps> = ({ register, control, setValue: setValueProp }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "parts",
  });

  let formContext: { setValue?: UseFormSetValue<RequisitionFormData> } | undefined;
  try {
    formContext = useFormContext<RequisitionFormData>();
  } catch {
    formContext = undefined;
  }

  const setValue = setValueProp ?? formContext?.setValue;

  const fetchAndPopulate = async (index: number, partNo: string) => {
    if (!partNo || !partNo.trim() || !setValue) return;
    try {
      const results = await useSearchApi.searchParts(partNo, 1, 1);
      if (results && results.length > 0) {
        const p = results[0] as any;
        if (p.partName !== undefined) setValue(`parts.${index}.partName` as any, p.partName);
        if (p.rev !== undefined) setValue(`parts.${index}.rev` as any, p.rev);
        if (p.qty !== undefined) setValue(`parts.${index}.qty` as any, p.qty);
      }
    } catch (e) {
      // silent fail — don't block user input
    }
  };

  return (
    <div className="bg-card space-y-4 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex gap-2 justify-center items-center text-foreground text-sm font-semibold tracking-wide uppercase">
          Component Breakdown List
        {/* <div className="group relative">
          <div className="bg-card border-border text-muted-foreground absolute right-0 z-50 mt-2 w-64 rounded border p-3 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            **Note on Minimum Order Quantity (MOQ):** For raw materials/components that
            carry high commercial minimum ordering margins, development tracking profiles
            remain bound to vendor availability limits.
          </div>
        </div> */}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              sNo: fields.length + 1,
              partNo: "",
              rev: "",
              partName: "",
              qty: 1,
              requiredDate: "",
              committedDate: "",
              actualCompletionDate: "",
            })
          }
        >
          + Add Row
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="max-h-[347px] overflow-y-auto">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-12 text-center text-xs">S.No</TableHead>
                  <TableHead className="w-36 text-xs">Part No</TableHead>
                  <TableHead className="w-16 text-xs">Rev</TableHead>
                  <TableHead className="text-xs">Part Name</TableHead>
                  <TableHead className="w-20 text-xs">Qty</TableHead>
                  <TableHead className="w-36 text-xs">Required Date</TableHead>
                  <TableHead className="w-36 text-xs">Committed Date</TableHead>
                  <TableHead className="w-16 text-center text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="text-center font-mono text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const partNoReg = register(`parts.${index}.partNo` as const);
                        return (
                          <Input
                            {...partNoReg}
                            className="h-8 font-mono text-xs"
                            onBlur={(e) => {
                              partNoReg.onBlur?.(e);
                              fetchAndPopulate(index, (e.target as HTMLInputElement).value);
                            }}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Input
                        {...register(`parts.${index}.rev` as const)}
                        className="h-8 text-center font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        {...register(`parts.${index}.partName` as const)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        {...register(`parts.${index}.qty` as const)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        {...register(`parts.${index}.requiredDate` as const)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        {...register(`parts.${index}.committedDate` as const)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:text-destructive/90 h-7 w-7 p-0"
                        onClick={() => remove(index)}
                      >
                        ✕
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-muted-foreground py-6 text-center text-xs"
                    >
                      No components added yet. Click Add Row to break down the requisition.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
