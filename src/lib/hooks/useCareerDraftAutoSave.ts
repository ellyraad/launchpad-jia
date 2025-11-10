import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { FormState } from "@/lib/definitions";
import { flattenNewCareerData } from "@/lib/CareerFormUtils";

const AUTO_SAVE_DELAY = 2000; // 2 seconds after last change

export function useCareerDraftAutoSave(
  formState: FormState,
  orgID: string | undefined,
  user: any,
  currentStep: number,
  isEnabled: boolean = true,
  initialDraftId: string | null = null
) {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const previousStateRef = useRef<string>("");

  // Update draftId if initialDraftId is provided later
  useEffect(() => {
    if (initialDraftId && !draftId) {
      setDraftId(initialDraftId);
    }
  }, [initialDraftId]);

  useEffect(() => {
    // Skip auto-save on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousStateRef.current = JSON.stringify(formState);
      return;
    }

    // Skip if auto-save is disabled or required data is missing
    if (!isEnabled || !orgID || !user) {
      return;
    }

    // Check if form state actually changed
    const currentState = JSON.stringify(formState);
    if (currentState === previousStateRef.current) {
      return;
    }
    previousStateRef.current = currentState;

    // Check if there's any meaningful data to save (at least job title should have some value)
    const hasData = formState.careerDetails.jobTitle.trim().length > 0;
    if (!hasData) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formState, orgID, user, currentStep, isEnabled]);

  const saveDraft = async () => {
    if (!orgID || !user) return;

    setIsSaving(true);

    try {
      const flattenedData = flattenNewCareerData(formState, orgID, user, true);
      
      const draftData = {
        _id: draftId,
        ...flattenedData,
        status: "draft",
        draft: true,
        draftStep: currentStep,
        salaryCurrency: formState.careerDetails.salaryCurrency,
      };

      const response = await axios.post("/api/save-career-draft", draftData);

      if (response.data.careerId) {
        // Store draft ID for subsequent updates
        if (response.data.isNewDraft) {
          setDraftId(response.data.careerId);
        }
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Error auto-saving draft:", error);
      // Silently fail - don't interrupt user experience
    } finally {
      setIsSaving(false);
    }
  };

  const clearDraft = () => {
    setDraftId(null);
    setLastSaved(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  return {
    draftId,
    isSaving,
    lastSaved,
    saveDraft: () => saveDraft(),
    clearDraft,
  };
}
