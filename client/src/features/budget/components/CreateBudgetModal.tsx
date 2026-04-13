import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

type CreateBudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateBudgetModal({
  isOpen,
  onClose,
}: CreateBudgetModalProps) {
  // 1. Unified state for all project inputs
  const [formData, setFormData] = useState({
    productName: "",
    projectCode: "",
    projectNumber: "",
    plannedAmount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI Flow: Log details before calling an API in the future
    console.log("Project Data Submitted:", formData);

    // Close modal and reset state
    setFormData({
      productName: "",
      projectCode: "",
      projectNumber: "",
      plannedAmount: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Project Plan Entry
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details to initialize the project budget.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-6">
          {/* Product Name */}
          <div className="grid gap-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              placeholder="e.g., Smart Control System"
              value={formData.productName}
              onChange={handleChange}
              required
              className="rounded-xl h-11"
            />
          </div>

          {/* Project Code & Number (Side-by-Side) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="projectCode">Project Code</Label>
              <Input
                id="projectCode"
                name="projectCode"
                placeholder="RD-001"
                value={formData.projectCode}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectNumber">Project Number</Label>
              <Input
                id="projectNumber"
                name="projectNumber"
                placeholder="PN-1234"
                value={formData.projectNumber}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl px-8 shadow-md">
              Submit Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
