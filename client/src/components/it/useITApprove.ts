import { toast } from 'sonner';

export const useITApprove = () => {
  return {
    mutate: (_requestId: number) => {
      toast.success('Access granted successfully');
    },
    isPending: false,
  };
};
