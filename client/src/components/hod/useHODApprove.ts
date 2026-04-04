import { toast } from 'sonner';

export const useHODApprove = () => {
  return {
    mutate: (_requestId: number) => {
      toast.success('Request approved');
    },
    isPending: false,
  };
};
