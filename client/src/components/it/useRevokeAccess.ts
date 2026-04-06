import { useData } from "../../context/DataContext"
import { toast } from "sonner"

export const useRevokeAccess = () => {
  const { revokeItem } = useData()

  const mutate = async (requestId: number, itemId: number) => {
    if (!requestId) {
      toast.error('Request ID is missing');
      return;
    }
    try {
      await revokeItem(requestId, itemId, "Revoked by IT")
      toast.success("Access revoked successfully")
    } catch (error) {
      console.error("Failed to revoke access", error)
      toast.error("Failed to revoke access")
    }
  }

  return {
    mutate,
    isPending: false,
  }
}
