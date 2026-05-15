import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { FormHeader } from "./FormHeader";
import { FormMeta } from "./FormMeta";
import { ProductInfo } from "./ProductInfo";
import { PartTable } from "./PartTable";
import { Signatures } from "./Signatures";
import type { RequisitionFormData } from "./types";
import { fetchMockRequisitionData } from "./utils";

export default function DocumentViewer() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, control, handleSubmit, reset } = useForm<RequisitionFormData>({
    defaultValues: {
      recNo: "",
      date: "",
      pageNo: "1 of 1",
      from: "",
      to: "",
      productNo: "",
      rev: "",
      projectNo: "",
      productName: "",
      purpose: "",
      monthlyQty: "",
      parts: [],
      moqWarningAccepted: true,
      signatures: {
        prepared: { name: "", date: "" },
        checked: { name: "", date: "" },
        approved: { name: "", date: "" },
        received: { name: "", date: "" },
      },
    },
  });

  const handleAutoPopulate = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMockRequisitionData();
      reset(data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: RequisitionFormData) => {
    console.log("Saving Form Requisition Data Payload:", data);
    alert(`Document Requisition ${data.recNo || "Draft"} saved completely!`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <Card className="border-2 shadow-lg">
        <FormHeader />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <FormMeta register={register} />
            <ProductInfo register={register} control={control} />
            <PartTable register={register} control={control} />
            <Signatures register={register} />
          </CardContent>

          <CardFooter className="bg-muted/20 flex justify-end gap-3 border-t py-4">
            <Button variant="outline" size="sm" type="button" onClick={() => reset()}>
              Reset Blank
            </Button>
            <Button type="submit" className="px-6">
              Save Requisition Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
