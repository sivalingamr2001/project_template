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
  onSubmit?: (
    input: {
      productName: string;
      projectCode: string;
      productNo: string;
    },
    saveAsDraft: boolean,
  ) => Promise<void>;
};

export default function CreateBudgetModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateBudgetModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    projectCode: "",
    projectNumber: "",
  });
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      await onSubmit(
        {
          productName: formData.productName,
          projectCode: formData.projectCode,
          productNo: formData.projectNumber,
        },
        saveAsDraft,
      );
    }

    setFormData({
      productName: "",
      projectCode: "",
      projectNumber: "",
    });

    if (!onSubmit) {
      onClose();
    }
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

          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted px-4 py-3">
            <input
              id="saveAsDraft"
              type="checkbox"
              checked={saveAsDraft}
              onChange={(e) => setSaveAsDraft(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="saveAsDraft" className="text-sm text-foreground">
              Create project as a draft and save later from plan entry.
            </label>
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
              {saveAsDraft ? "Create Draft" : "Create & Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
