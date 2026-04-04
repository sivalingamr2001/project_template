import { toast } from 'sonner';

export const useHODReject = () => {
  return {
    mutate: ({ reason }: { requestId: number; reason: string }) => {
      toast.success(reason ? 'Request rejected' : 'Request updated');
    },
    isPending: false,
  };
};
