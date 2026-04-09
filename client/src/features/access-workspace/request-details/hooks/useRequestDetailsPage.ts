import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import type { AccessRequestFormPayload } from "@/lib/access-request-api"

import type { AccessRequestDetails } from "../../types"
import { buildResubmitPayload } from "../report/utils/requestReport"
import { findInitialItemId } from "../utils/requestDetails"
import { getDefaultRoute } from "../../utils/accessSelectors"
import {
  reviewAccessRequestByHod,
  reviewAccessRequestByIt,
} from "../../utils/requestApi"

type Role = "Hod" | "ItTeam" | "User"

export function useRequestDetailsPage(
  details: AccessRequestDetails | null,
  reviewerEmployeeId: number,
  role: Role,
  refetch: () => Promise<void>
) {
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null
  )
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isResubmitOpen, setIsResubmitOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(0)
  const canRevoke =
    details &&
    ["Approved", "Granted"].includes(details.status) &&
    role === "Hod"
  const canReviewAsHod = role === "Hod" && details?.status === "Pending HOD"
  const canReviewAsIt = role === "ItTeam" && details?.status === "Pending IT"
  const canResubmit =
    role === "User" &&
    details?.empId === reviewerEmployeeId &&
    ["Rejected HOD", "Rejected IT", "Revoked"].includes(details?.status || "")

  useEffect(() => {
    if (!details) return
    setSelectedItemId((current) => current || findInitialItemId(details.items))
  }, [details])

  const selectedItem =
    details?.items.find((item) => item.accessItemId === selectedItemId) ??
    details?.items[0] ??
    null
  const resubmitPayload = details ? buildResubmitPayload(details) : undefined
  const handleBack = () => navigate(-1)
  const handleResubmitSuccess = () => navigate(getDefaultRoute("User"))
  const handleReviewOpen = (actionType: "approve" | "reject") => {
    setReviewAction(actionType)
    setIsReviewOpen(true)
  }
  const handleReviewClose = () => setIsReviewOpen(false)

  const handleReview = async (
    comments: string,
    confirmAccessType: number = 1
  ) => {
    if (!details) return
    setIsPending(true)
    try {
      const approved = reviewAction === "approve"
      if (canReviewAsHod)
        await reviewAccessRequestByHod(
          details.accessReqId,
          reviewerEmployeeId,
          approved,
          comments,
          confirmAccessType
        )
      if (canReviewAsIt)
        await reviewAccessRequestByIt(
          details.accessReqId,
          reviewerEmployeeId,
          approved,
          comments,
          details.itsrNo || "",
          confirmAccessType
        )
      await refetch()
      setIsReviewOpen(false)
      setReviewAction(null)
    } finally {
      setIsPending(false)
    }
  }

  return {
    canResubmit,
    canRevoke,
    canReviewAsHod,
    canReviewAsIt,
    handleBack,
    handleResubmitOpen: () => setIsResubmitOpen(true),
    handleResubmitClose: () => setIsResubmitOpen(false),
    handleResubmitSuccess,
    handleReview,
    handleReviewClose,
    handleReviewOpen,
    isPending,
    isResubmitOpen,
    isReviewOpen,
    resubmitPayload: resubmitPayload as AccessRequestFormPayload | undefined,
    reviewAction,
    selectedItem,
    selectedItemId,
    setSelectedItemId,
  }
}
