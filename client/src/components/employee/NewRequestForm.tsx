import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CreateRequestPayload {
  folderName: string;
  accessType: string;
  reason: string;
  durationDays: number;
}

const accessOptions = ['Read', 'Write', 'Full'];

export function NewRequestForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: CreateRequestPayload) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<CreateRequestPayload>({
    folderName: '',
    accessType: '',
    reason: '',
    durationDays: 30,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateRequestPayload, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="folderName">Folder Name</Label>
        <Input
          id="folderName"
          value={formData.folderName}
          onChange={(e) => handleChange('folderName', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessType">Access Type</Label>
        <Select
          value={formData.accessType}
          onValueChange={(value) => handleChange('accessType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select access type" />
          </SelectTrigger>
          <SelectContent>
            {accessOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationDays">Duration (days)</Label>
        <Input
          id="durationDays"
          type="number"
          min={1}
          max={365}
          value={formData.durationDays}
          onChange={(e) => handleChange('durationDays', parseInt(e.target.value) || 30)}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  );
}