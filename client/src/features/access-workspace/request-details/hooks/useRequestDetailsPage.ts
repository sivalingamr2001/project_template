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
export type ItemReviewDraft = {
  approved: boolean
  comments: string
  confirmAccessType: number
  isValidated: boolean
}

function mapAccessTypeToValue(value: string) {
  if (value === "Read & Write") return 2
  if (value === "Read Only") return 1
  return 0
}

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
  const [itemReviews, setItemReviews] = useState<Record<number, ItemReviewDraft>>(
    {}
  )
  const [isValidationConfirmed, setIsValidationConfirmed] = useState(false)
  const canReviewAsHod = role === "Hod" && details?.status === "Pending HOD"
  const canReviewAsIt = role === "ItTeam" && details?.status === "Pending IT"
  const canResubmit =
    ((role === "User" &&
      details?.empId === reviewerEmployeeId &&
      ["Rejected HOD", "Revoked"].includes(details?.status || "")) ||
      (role === "Hod" && details?.status === "Rejected IT"))

  useEffect(() => {
    if (!details) return
    setSelectedItemId((current) => current || findInitialItemId(details.items))
    setItemReviews(
      details.items.reduce<Record<number, ItemReviewDraft>>((accumulator, item) => {
        accumulator[item.accessItemId] = {
          approved: item.hodValidationStatus !== "Rejected",
          comments: item.hodValidationComments,
          confirmAccessType: mapAccessTypeToValue(
            item.confirmAccessType === "Not Applicable"
              ? item.accessType
              : item.confirmAccessType
          ),
          isValidated: item.isHodValidated,
        }
        return accumulator
      }, {})
    )
    setIsValidationConfirmed(false)
  }, [details])

  const selectedItem =
    details?.items.find((item) => item.accessItemId === selectedItemId) ??
    details?.items[0] ??
    null
  const resubmitPayload = details ? buildResubmitPayload(details) : undefined
  const handleBack = () => navigate(-1)
  const handleResubmitSuccess = () => navigate(getDefaultRoute(role))
  const handleReviewOpen = (actionType: "approve" | "reject") => {
    setReviewAction(actionType)
    setIsReviewOpen(true)
  }
  const handleReviewClose = () => setIsReviewOpen(false)

  const handleItemReviewSave = ({
    accessItemId,
    approved,
    comments,
    confirmAccessType,
  }: ItemReviewDraft & { accessItemId: number }) => {
    setItemReviews((current) => ({
      ...current,
      [accessItemId]: {
        approved,
        comments,
        confirmAccessType,
        isValidated: true,
      },
    }))
    setIsReviewOpen(false)
    setReviewAction(null)
  }

  const allItemsValidated =
    details?.items.every((item) => itemReviews[item.accessItemId]?.isValidated) ??
    false

  const handleHodSubmit = async () => {
    if (!details || !allItemsValidated || !isValidationConfirmed) return
    setIsPending(true)
    try {
      if (canReviewAsHod) {
        await reviewAccessRequestByHod(
          details.accessReqId,
          reviewerEmployeeId,
          details.items.map((item) => ({
            accessItemId: item.accessItemId,
            approved: itemReviews[item.accessItemId]?.approved ?? false,
            comments: itemReviews[item.accessItemId]?.comments ?? "",
            confirmAccessType:
              itemReviews[item.accessItemId]?.confirmAccessType ?? 1,
            isValidated: itemReviews[item.accessItemId]?.isValidated ?? false,
          }))
        )
      }
      await refetch()
    } finally {
      setIsPending(false)
    }
  }

  const handleItReview = async (
    comments: string,
    confirmAccessType: number = 1
  ) => {
    if (!details) return
    setIsPending(true)
    try {
      const approved = reviewAction === "approve"
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

  const selectedItemReview = selectedItemId ? itemReviews[selectedItemId] : null

  return {
    allItemsValidated,
    canResubmit,
    canReviewAsHod,
    canReviewAsIt,
    handleBack,
    handleHodSubmit,
    handleItemReviewSave,
    handleItReview,
    handleResubmitOpen: () => setIsResubmitOpen(true),
    handleResubmitClose: () => setIsResubmitOpen(false),
    handleResubmitSuccess,
    handleReviewClose,
    handleReviewOpen,
    isValidationConfirmed,
    isPending,
    isResubmitOpen,
    isReviewOpen,
    itemReviews,
    resubmitPayload: resubmitPayload as AccessRequestFormPayload | undefined,
    reviewAction,
    selectedItem,
    selectedItemId,
    selectedItemReview,
    setIsValidationConfirmed,
    setSelectedItemId,
  }
}
