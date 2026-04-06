import { toast } from 'sonner';

export const useHODReject = () => {
  return {
    mutate: (_requestId: number, reason: string) => {
      console.log('HOD reject', _requestId, reason);
      toast.success(reason ? 'Request rejected by HOD' : 'Request updated');
    },
    isPending: false,
  };
};
