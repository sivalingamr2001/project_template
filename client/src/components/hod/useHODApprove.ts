import { toast } from 'sonner';

export const useHODApprove = () => {
  return {
    mutate: (_requestId: number, options?: { accessType: string; comment?: string }) => {
      console.log('HOD approve', _requestId, options);
      toast.success('Request approved by HOD');
    },
    isPending: false,
  };
};
