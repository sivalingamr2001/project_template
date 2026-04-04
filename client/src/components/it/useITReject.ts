import { toast } from 'sonner';

export const useITReject = () => {
  return {
    mutate: ({ reason }: { requestId: number; reason: string }) => {
      toast.success(reason ? 'Request rejected successfully' : 'Request updated');
    },
    isPending: false,
  };
};
