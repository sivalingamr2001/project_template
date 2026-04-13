import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useState } from "react";

export function CreateBudgetModal({}: { onOpenPlanEntry: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleCreateRecord() {
    // const record = createRecord({
    //   productName: projectCodeQuery.trim(),
    //   productNo: productNoQuery.trim(),
    //   projectCode: projectCodeQuery.trim(),
    // });

    // toast.success(
    //   `New budget record ${record.projectHeader.projectCode} created.`,
    // );

    setIsModalOpen(false);
  }
  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Plan Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Form for goes here...</p>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleCreateRecord()}>Submit</Button>
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudgetModal;
