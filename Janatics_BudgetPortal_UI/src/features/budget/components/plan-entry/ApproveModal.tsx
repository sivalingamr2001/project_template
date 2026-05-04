import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

interface ApproveModalProps {
    isOpen: boolean;
    onClose: () => void;
    budgetId: number;
    onSuccess: () => void;
}

export default function ApproveModal({
    isOpen,
    onClose,
    budgetId,
    onSuccess,
}: ApproveModalProps) {
    const [isApproved, setIsApproved] = useState<boolean>(true);
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth()

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const payload = {
            budgetId: budgetId,
            approverId: user?.employeeId,
            isApproved: isApproved,
            comments: comments.trim(),
        };

        try {
            const response = await fetch(
                `https://localhost:5000/api/budgets/${budgetId}/approval`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to process approval");

            toast.success(isApproved ? "Budget Approved" : "Budget Rejected");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Budget Approval Decision</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Decision Selection */}
                    <div className="space-y-3">
                        <Label>Decision</Label>
                        <RadioGroup
                            defaultValue="approve"
                            onValueChange={(val) => setIsApproved(val === "approve")}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="approve" id="approve" />
                                <Label htmlFor="approve" className="text-green-600 font-bold">Approve</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="reject" id="reject" />
                                <Label htmlFor="reject" className="text-red-600 font-bold">Reject</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Comments Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Textarea
                            id="comments"
                            placeholder="Provide a reason for your decision..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            maxLength={500}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        variant={isApproved ? "default" : "destructive"}
                    >
                        {isSubmitting ? "Processing..." : "Submit Decision"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
