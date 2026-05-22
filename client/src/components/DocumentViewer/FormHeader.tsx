import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "../ui/button";

export const FormHeader = () => {
  return (
    <CardHeader className="border-b pb-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <CardTitle className="text-primary text-xl font-bold tracking-tight">
            JANATICS - REQUISITION FOR COMPONENT DEVELOPMENT
          </CardTitle>
          <CardDescription className="mt-1 font-mono text-xs">
            Form No: F/D&D/21 | Issue No: 4.2
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-emerald-500 text-white border-">Approve</Button>
          <Button variant="destructive">Reject</Button>
        </div>
      </div>
    </CardHeader>
  );
};
