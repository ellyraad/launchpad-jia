import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { errorToast, candidateActionToast } from "@/lib/Utils";
import { assetConstants } from "@/lib/utils/constantsV2";
import { flattenNewCareerData } from "@/lib/CareerFormUtils";
import type { FormState } from "@/lib/definitions";

export function useCareerFormSubmission(
  formState: FormState,
  orgID: string | undefined,
  user: any
) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isSavingUnpublished, setIsSavingUnpublished] = useState<boolean>(false);
  const savingCareerRef = useRef<boolean>(false);

  const handlePublish = async () => {
    // Prevent duplicate submissions
    if (savingCareerRef.current) return;
    
    savingCareerRef.current = true;
    setIsPublishing(true);

    try {
      const flattenedData = flattenNewCareerData(formState, orgID, user, false);
      
      const response = await axios.post("/api/add-career", flattenedData);

      if (response.data.message) {
        candidateActionToast(
          "Career published successfully!",
          1500,
          <img alt="check" src={assetConstants.checkV5} style={{ width: "20px", height: "20px" }} />
        );
        
        setTimeout(() => {
          router.push("/recruiter-dashboard/careers");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error saving career:", error);
      errorToast(
        error.response?.data?.error || "Failed to publish career. Please try again.",
        3000
      );
      savingCareerRef.current = false;
      setIsPublishing(false);
    }
  };

  const handleSaveAsUnpublished = async () => {
    // Prevent duplicate submissions
    if (savingCareerRef.current) return;
    
    savingCareerRef.current = true;
    setIsSavingUnpublished(true);

    try {
      const flattenedData = flattenNewCareerData(formState, orgID, user, false);
      
      // Override status to inactive for unpublished careers
      const unpublishedData = {
        ...flattenedData,
        status: "inactive"
      };
      
      const response = await axios.post("/api/add-career", unpublishedData);

      if (response.data.message) {
        candidateActionToast(
          "Career saved as unpublished!",
          1500,
          <img alt="check" src={assetConstants.checkV5} style={{ width: "20px", height: "20px" }} />
        );
        
        setTimeout(() => {
          router.push("/recruiter-dashboard/careers");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error saving career:", error);
      errorToast(
        error.response?.data?.error || "Failed to save career. Please try again.",
        3000
      );
      savingCareerRef.current = false;
      setIsSavingUnpublished(false);
    }
  };

  return {
    isPublishing,
    isSavingUnpublished,
    handlePublish,
    handleSaveAsUnpublished,
  };
}
