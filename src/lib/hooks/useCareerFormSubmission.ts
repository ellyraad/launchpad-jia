import { useState, useRef, createElement } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { errorToast, candidateActionToast } from "@/lib/Utils";
import { assetConstants } from "@/lib/utils/constantsV2";
import { flattenNewCareerData } from "@/lib/CareerFormUtils";
import type { FormState } from "@/lib/definitions";

export function useCareerFormSubmission(
  formState: FormState,
  orgID: string | undefined,
  user: any,
  draftId: string | null = null,
  onDraftPromoted?: () => void
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
      
      // If we have a draft, update it instead of creating a new career
      if (draftId) {
        const updateData = {
          ...flattenedData,
          _id: draftId,
          status: "active",
          draft: false,
        };
        
        const response = await axios.post("/api/update-career", updateData);
        
        if (response.data.message) {
          // Clear draft state
          if (onDraftPromoted) onDraftPromoted();
          
          candidateActionToast(
            "Career published successfully!",
            1500,
            createElement("img", { 
              alt: "check", 
              src: assetConstants.checkV5, 
              style: { width: "20px", height: "20px" } 
            })
          );
          
          setTimeout(() => {
            router.push("/recruiter-dashboard/careers");
          }, 1500);
        }
      } else {
        // Create new career if no draft exists
        const response = await axios.post("/api/add-career", flattenedData);

        if (response.data.message) {
          candidateActionToast(
            "Career published successfully!",
            1500,
            createElement("img", { 
              alt: "check", 
              src: assetConstants.checkV5, 
              style: { width: "20px", height: "20px" } 
            })
          );
          
          setTimeout(() => {
            router.push("/recruiter-dashboard/careers");
          }, 1500);
        }
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
      
      // If we have a draft, update it instead of creating a new career
      if (draftId) {
        const updateData = {
          ...flattenedData,
          _id: draftId,
          status: "inactive",
          draft: false,
        };
        
        const response = await axios.post("/api/update-career", updateData);

        if (response.data.message) {
          // Clear draft state
          if (onDraftPromoted) onDraftPromoted();
          
          candidateActionToast(
            "Career saved as unpublished!",
            1500,
            createElement("img", { 
              alt: "check", 
              src: assetConstants.checkV5, 
              style: { width: "20px", height: "20px" } 
            })
          );
          
          setTimeout(() => {
            router.push("/recruiter-dashboard/careers");
          }, 1500);
        }
      } else {
        // Create new career if no draft exists
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
            createElement("img", { 
              alt: "check", 
              src: assetConstants.checkV5, 
              style: { width: "20px", height: "20px" } 
            })
          );
          
          setTimeout(() => {
            router.push("/recruiter-dashboard/careers");
          }, 1500);
        }
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
