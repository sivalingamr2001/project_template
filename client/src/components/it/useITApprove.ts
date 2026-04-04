import { toast } from 'sonner';

export const useITApprove = () => {
  return {
    mutate: (_requestId: number, options?: { accessType: string; comment?: string }) => {
      console.log('IT approve', _requestId, options);
      toast.success('Request approved by IT');
    },
    isPending: false,
  };
};
