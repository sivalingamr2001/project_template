import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { use, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

import { FormHeader } from "@/components/DocumentViewer/FormHeader";
import { FormMeta } from "@/components/DocumentViewer/FormMeta";
import { PartTable } from "@/components/DocumentViewer/PartTable";
import { ProductInfo } from "@/components/DocumentViewer/ProductInfo";
import { Signatures } from "@/components/DocumentViewer/Signatures";
import { useRequestionApi } from "@/core/api/useRequestionApi";
import type { RequisitionFormData, PartItem } from "@/components/DocumentViewer/types";
import type { RequisitionDocument } from "@/types";
import { ArrowLeft } from "lucide-react";

const steps = ["Document Details", "Product & Components", "Signatures"];

const getTodayDate = () => new Date().toISOString().split("T")[0];

export const FormDetailPage = () => {
  const { recordId } = useParams<{ recordId?: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
        prepared: { name: "", date: `${today}T09:00:00` },
        checked: { name: "", date: "" },
        approved: { name: "", date: "" },
        received: { name: "", date: "" },
      },
    }),
    [today],
  );

  const { register, control, handleSubmit, reset, setValue } = useForm<RequisitionFormData>({
    defaultValues: createFormValues,
  });

  useEffect(() => {
    const loadRequisition = async () => {
      setIsLoading(true);
      setSaveMessage(null);

      try {
        if (recordId) {
          const record = await useRequestionApi.fetchRequisition(recordId);
          reset(buildFormValues(record, today));
        } else {
          // Creation mode: Fetch next sequence number from API
          const nextRecNo = await useRequestionApi.fetchNextSequence();
          
          reset({
            ...createFormValues,
            recNo: nextRecNo, // Injects sequence number into form state
          });
        }
      } catch (error) {
        console.error("Error loading requisition:", error);
        reset(createFormValues);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRequisition();

  }, [recordId, reset, createFormValues, today]);

  const handleResetBlank = () => {
    reset(createFormValues);
    setCurrentStep(1);
    setSaveMessage(null);
  };

  const handleNext = () => setCurrentStep((step) => Math.min(step + 1, steps.length));
  const handlePrevious = () => setCurrentStep((step) => Math.max(step - 1, 1));

  const onSubmit = async (data: RequisitionFormData) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = buildSavePayload(data, today);
      const savedRecord = recordId
        ? await useRequestionApi.updateRequisition(recordId, payload)
        : await useRequestionApi.createRequisition(payload);

      reset(buildFormValues(savedRecord, today));
      setSaveMessage(
        recordId
          ? `Requisition ${savedRecord.recNo} updated successfully.`
          : `Requisition ${savedRecord.recNo} created successfully.`,
      );

      if (!recordId) {
        navigate(`/form-details/${encodeURIComponent(savedRecord.recNo)}`, { replace: true });
      }
    } catch (error) {
      console.error("Failed to save requisition:", error);
      setSaveMessage("Unable to save the requisition right now. Please verify the form data and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="mx-auto w-full max-w-[75vw] space-y-6 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="border-none" />
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
          disabled={isLoading || isSaving}
          className="h-9 px-4"
        >
          {isLoading ? "Loading..." : "Reset Blank"}
        </Button>
      </div>

      {saveMessage ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          {saveMessage}
        </div>
      ) : null}

      <Card className="border-2 shadow-lg">
        <FormHeader />

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 mb-6">
            {currentStep === 1 && (
              <>
                <FormMeta register={register} />
                <ProductInfo register={register} control={control} setValue={setValue} />
              </>
            )}
            {currentStep === 2 && (
              <>
                <PartTable register={register} control={control} setValue={setValue} />
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
                <Button type="button" onClick={handleNext} disabled={isSaving}>
                  Next
                </Button>
              )}
              {isLastStep && (
                <Button type="submit" className="px-6" disabled={isSaving}>
                  {isSaving
                    ? recordId
                      ? "Updating..."
                      : "Saving..."
                    : recordId
                      ? "Update Requisition"
                      : "Create Requisition"}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const buildFormValues = (
  record: RequisitionDocument,
  today: string,
): RequisitionFormData => {
  const mapDate = (value: string | Date | null | undefined) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const mapDateTime = (value: string | Date | null | undefined, fallback = "") => {
    if (!value) return fallback;

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 16);
  };

  return {
    recNo: record.recNo ?? "",
    date: mapDate(record.date) || today,
    pageNo: record.pageNo ?? "1 of 1",
    from: record.fromTeam ?? "",
    to: record.toTeam ?? "",
    productNo: record.productNo ?? "",
    rev: record.productRev ?? "",
    projectNo: record.projectNo ?? "",
    productName: record.productName ?? "",
    purpose: record.purpose ?? "",
    monthlyQty: record.monthlyQty?.toString() ?? "",
    parts: Array.isArray(record.parts)
      ? record.parts.map((part) => ({
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
        name: record.preparedBy ?? "",
        date: mapDateTime(record.preparedDate, `${today}T09:00`),
      },
      checked: {
        name: record.checkedBy ?? "",
        date: mapDateTime(record.checkedDate),
      },
      approved: {
        name: record.approvedBy ?? "",
        date: mapDateTime(record.approvedDate),
      },
      received: {
        name: record.receivedBy ?? "",
        date: mapDateTime(record.receivedDate),
      },
    },
  };
};

const buildSavePayload = (data: RequisitionFormData, today: string) => {
  const preparedDate = data.signatures.prepared.date || `${today}T09:00`;
  const checkedDate = data.signatures.checked.date || preparedDate;

  return {
    date: data.date,
    pageNo: data.pageNo || "1 of 1",
    fromTeam: data.from,
    toTeam: data.to,
    productNo: data.productNo,
    productRev: data.rev,
    projectNo: data.projectNo,
    productName: data.productName,
    purpose: data.purpose,
    monthlyQty: data.monthlyQty || "0",
    parts: data.parts.map((part: PartItem, index) => ({
      sNo: index + 1,
      partNo: part.partNo,
      rev: part.rev,
      partName: part.partName,
      qty: Number(part.qty) || 0,
      requiredDate: part.requiredDate || null,
      committedDate: part.committedDate || null,
      actualCompletionDate: part.actualCompletionDate || null,
    })),
    prepared: {
      name: data.signatures.prepared.name.trim(),
      date: preparedDate,
    },
    checked: {
      name: data.signatures.checked.name.trim(),
      date: checkedDate,
    },
    moqWarningAccepted: data.moqWarningAccepted,
  };
};
