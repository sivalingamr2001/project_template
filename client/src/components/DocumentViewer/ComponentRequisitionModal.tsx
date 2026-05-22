import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"
import { ComponentRequisitionForm } from "./ComponentRequisitionForm"

interface ComponentRequisitionModalProps {
  triggerVariant?: "outline" | "default" | "ghost"
}

export function ComponentRequisitionModal({ triggerVariant = "outline" }: ComponentRequisitionModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <FileText className="h-3.5 w-3.5" />
          View Form
        </Button>
      </DialogTrigger>
      
      {/* 
        CRITICAL FIX: 
        Changed max-w-5xl to sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[1200px] 
        to ensure it forces past the default shadcn max-w-lg style rule.
      */}
      <DialogContent className="p-0 overflow-hidden flex flex-col w-[95vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[1200px] max-h-[95vh]">
        <DialogHeader className="p-6 pb-4 border-b bg-slate-50">
          <DialogTitle className="text-base font-semibold">Component Requisition Viewer</DialogTitle>
          <DialogDescription className="text-xs">
            Review or update the development requisition document details below.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scroll area padding wrapper to allow internal grid tables to expand smoothly */}
        <ScrollArea className="flex-1 p-6 overflow-y-auto bg-slate-100/40">
          <div className="pb-4 mx-auto w-full">
            <ComponentRequisitionForm />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
