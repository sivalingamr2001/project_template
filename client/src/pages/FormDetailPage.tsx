import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

import { useAuthStore, selectUser } from "@/core/store/authStore";
import { FormHeader } from "@/components/DocumentViewer/FormHeader";
import { FormMeta } from "@/components/DocumentViewer/FormMeta";
import { PartTable } from "@/components/DocumentViewer/PartTable";
import { ProductInfo } from "@/components/DocumentViewer/ProductInfo";
import { Signatures } from "@/components/DocumentViewer/Signatures";
import { useRequestionApi } from "@/core/api/useRequestionApi";
import type { RequisitionFormData, PartItem } from "@/components/DocumentViewer/types";

const steps = ["Document Details", "Product & Components", "Signatures"];

const getTodayDate = () => new Date().toISOString().split("T")[0];

export const FormDetailPage = () => {
  const { recordId } = useParams<{ recordId?: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore(selectUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const today = useMemo(getTodayDate, []);

  const createFormValues = useMemo<RequisitionFormData>(
    () => ({
      recNo: "",
      date: today,
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
        prepared: { name: currentUser?.name ?? "", date: `${today} 09:00 AM` },
        checked: { name: "", date: "" },
        approved: { name: "", date: "" },
        received: { name: "", date: "" },
      },
    }),
    [currentUser?.name, today],
  );

  const { register, control, handleSubmit, reset } = useForm<RequisitionFormData>({
    defaultValues: createFormValues,
  });

  useEffect(() => {
    const buildFormValues = (record: any): RequisitionFormData => {
      const mapDate = (value: string | Date | null | undefined) => {
        if (!value) return "";
        const date = value instanceof Date ? value : new Date(value);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      };

      return {
        recNo: record.recNo ?? "",
        date: mapDate(record.date) || today,
        pageNo: record.pageNo ?? "1 of 1",
        from: record.fromTeam ?? record.from ?? "",
        to: record.toTeam ?? record.to ?? "",
        productNo: record.productNo ?? "",
        rev: record.productRev ?? record.rev ?? "",
        projectNo: record.projectNo ?? "",
        productName: record.productName ?? "",
        purpose: record.purpose ?? "",
        monthlyQty: record.monthlyQty?.toString() ?? "",
        parts: Array.isArray(record.parts)
          ? record.parts.map((part: any) => ({
              sNo: part.sNo,
              partNo: part.partNo,
              rev: part.rev,
              partName: part.partName,
              qty: part.qty,
              requiredDate: mapDate(part.requiredDate),
              committedDate: mapDate(part.committedDate),
              actualCompletionDate: mapDate(part.actualCompletionDate),
            }))
          : [],
        moqWarningAccepted: true,
        signatures: {
          prepared: {
            name: record.preparedBy ?? record.prepared?.name ?? currentUser?.name ?? "",
            date: mapDate(record.preparedDate ?? record.prepared?.date) || `${today} 09:00 AM`,
          },
          checked: {
            name: record.checkedBy ?? record.checked?.name ?? "",
            date: mapDate(record.checkedDate ?? record.checked?.date),
          },
          approved: {
            name: record.approvedBy ?? record.approved?.name ?? "",
            date: mapDate(record.approvedDate ?? record.approved?.date),
          },
          received: {
            name: record.receivedBy ?? record.received?.name ?? "",
            date: mapDate(record.receivedDate ?? record.received?.date),
          },
        },
      };
    };

    const loadRequisition = async () => {
      setIsLoading(true);

      try {
        if (recordId) {
          const record = await useRequestionApi.fetchRequisition(recordId);
          reset(buildFormValues(record));
        } else {
          reset(createFormValues);
        }
      } catch (error) {
        console.error("Error loading requisition:", error);
        reset(createFormValues);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRequisition();
  }, [recordId, reset, createFormValues, currentUser?.name, today]);

  const handleResetBlank = () => {
    reset(createFormValues);
    setCurrentStep(1);
  };

  const handleNext = () => setCurrentStep((step) => Math.min(step + 1, steps.length));
  const handlePrevious = () => setCurrentStep((step) => Math.max(step - 1, 1));

  const onSubmit = (data: RequisitionFormData) => {
    console.log("Saving Form Requisition Data Payload:", data);
    alert(`Document Requisition ${data.recNo || "Draft"} saved completely!`);
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>

        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`rounded-lg border p-2 ${currentStep === index + 1 ? "border-primary bg-primary/10" : "border-border bg-card"}`}
              >
                <p
                  className={`font-semibold ${currentStep === index + 1 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {index + 1}. {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleResetBlank}
          disabled={isLoading}
          className="h-9 px-4"
        >
          {isLoading ? "Loading..." : "Reset Blank"}
        </Button>
      </div>

      <Card className="border-2 shadow-lg">
        <FormHeader />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 mb-6">
            {currentStep === 1 && (
              <>
                <FormMeta register={register} />
                <ProductInfo register={register} control={control} />
              </>
            )}
            {currentStep === 2 && (
              <>
                <PartTable register={register} control={control} />
              </>
            )}
            {currentStep === 3 && <Signatures register={register} />}
          </CardContent>

          <CardFooter className="bg-muted/20 flex flex-col items-start justify-between gap-3 border-t md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {currentStep > 1 && (
                <Button variant="outline" type="button" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {!isLastStep && (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              )}
              {isLastStep && (
                <Button type="submit" className="px-6">
                  Submit Requisition
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
