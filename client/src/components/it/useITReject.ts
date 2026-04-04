import { toast } from 'sonner';

export const useITReject = () => {
  return {
    mutate: (_requestId: number, reason: string) => {
      console.log('IT reject', _requestId, reason);
      toast.success(reason ? 'Request rejected by IT' : 'Request updated');
    },
    isPending: false,
  };
};
