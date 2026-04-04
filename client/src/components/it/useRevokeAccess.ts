import { toast } from 'sonner';

export const useRevokeAccess = () => {
  return {
    mutate: (_requestId: number) => {
      toast.success('Access revoked');
    },
    isPending: false,
  };
};
