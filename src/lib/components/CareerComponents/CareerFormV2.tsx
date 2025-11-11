import "@/lib/styles/commonV2/globals.scss";

import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CareerFormProps } from "./CareerForm";
import { useEffect, useReducer, useState } from "react";
import { Tooltip } from "react-tooltip";
import TipsBox from "./TipsBox";
import type { FormReducerAction, FormState } from "@/lib/definitions";
import {
  formSteps,
  screeningSettingList,
  baseAIInterviewQuestion,
  validateCareerDetails,
  isValidInterviewQuestionsCount,
  mapCareerToFormState,
} from "@/lib/CareerFormUtils";
import { useAppContext } from "@/lib/context/AppContext";
import StepIndicator from "./StepIndicator";
import { usePreScreeningQuestions } from "@/lib/hooks/usePreScreeningQuestions";
import { useCareerFormSubmission } from "@/lib/hooks/useCareerFormSubmission";
import { useCareerDraftAutoSave } from "@/lib/hooks/useCareerDraftAutoSave";
import CareerDetailsStep from "./CareerDetailsStep";
import CVScreeningStep from "./CVScreeningStep";
import AIInterviewSetupStep from "./AIInterviewSetupStep";
import ReviewStep from "./ReviewStep";
import axios from "axios";

const initFormState: FormState = {
  careerDetails: {
    jobTitle: "",

    employmentType: "Full-Time",
    workArrangement: "",

    country: "Philippines",
    state: "",
    city: "",

    isSalaryNegotiable: false,
    minSalary: "",
    maxSalary: "",
    salaryCurrency: "PHP",
    jobDescription: "",
  },

  cvScreeningDetails: {
    cvScreeningSetting: screeningSettingList[0].name,
    cvSecretPrompt: "",
    preScreeningQuestions: [],
  },

  aiScreeningDetails: {
    aiScreeningSetting: screeningSettingList[0].name,
    isVideoInterviewRequired: true,
    interviewQuestions: baseAIInterviewQuestion,
  },

  teamAccessDetails: {
    accessRole: "",
    authorizedMembers: "",
  },

  isValid: {
    step1: false,
    step3: false,
  }
}

function formReducer(state: FormState, action: FormReducerAction) {
  if (action.type === "SET") {
    return {
      ...state,
      [action.category]: {
        ...(state[action.category]),
        [action.field]: action.payload
      }
    };
  }
  return state;
}

export default function CareerFormV2({ 
  draftId: initialDraftId, 
  careerId: initialCareerId,
  formType,
  initialStep 
}: CareerFormProps) {
  const { user, orgID } = useAppContext();

  const [formState, dispatch] = useReducer(formReducer, initFormState);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [existingCareerData, setExistingCareerData] = useState<any>(null);

  const [currentStep, setCurrentStep] = useState<number>(initialStep ?? 0);

  const dispatchFormStateCategory = (
    category: keyof FormState,
    data: Record<string, any>
  ) => {
    Object.entries(data).forEach(([field, value]) => {
      dispatch({
        type: "SET",
        category,
        field,
        payload: value,
      });
    });
  };
  
  const [collapsedSections, setCollapsedSections] = useState<{
    careerDetails: boolean;
    cvScreening: boolean;
    aiInterview: boolean;
  }>({
    careerDetails: false,
    cvScreening: false,
    aiInterview: false,
  });

  const preScreeningHook = usePreScreeningQuestions(
    formState.cvScreeningDetails.preScreeningQuestions,
    (questions) => {
      dispatch({
        type: "SET",
        category: "cvScreeningDetails",
        field: "preScreeningQuestions",
        payload: questions
      });
    }
  );

  const {
    draftId,
    isSaving: isSavingDraft,
    lastSaved,
    clearDraft,
  } = useCareerDraftAutoSave(
    formState, 
    orgID, 
    user, 
    currentStep, 
    formType !== "edit",
    initialDraftId
  );

  const {
    isPublishing,
    isSavingUnpublished,
    handlePublish,
    handleSaveAsUnpublished,
  } = useCareerFormSubmission(
    formState, 
    orgID, 
    user, 
    formType === "edit" ? initialCareerId : draftId, 
    clearDraft
  );

  useEffect(() => {
    const loadFormData = async () => {
      const idToLoad = formType === "edit" ? initialCareerId : initialDraftId;
      
      if (!idToLoad || !orgID) return;

      setIsLoadingDraft(true);
      try {
        const response = await axios.post("/api/career-data", {
          id: idToLoad,
          orgID,
        });

        if (response.data) {
          if (formType === "edit") {
            setExistingCareerData(response.data);
          }

          const mappedFormState = mapCareerToFormState(response.data);
          
          dispatchFormStateCategory("careerDetails", mappedFormState.careerDetails);
          dispatchFormStateCategory("cvScreeningDetails", mappedFormState.cvScreeningDetails);
          dispatchFormStateCategory("aiScreeningDetails", mappedFormState.aiScreeningDetails);
          dispatchFormStateCategory("teamAccessDetails", mappedFormState.teamAccessDetails);

          if (initialStep !== undefined) {
            setCurrentStep(initialStep);
          } else if (formType !== "edit" && response.data.draftStep !== undefined) {
            // Only use saved draftStep for non-edit mode
            setCurrentStep(response.data.draftStep);
          }
        }
      } catch (error) {
        console.error(`Error loading ${formType === "edit" ? "career" : "draft"} data:`, error);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadFormData();
  }, [initialCareerId, initialDraftId, orgID, formType, initialStep]);

  const toggleSection = (section: 'careerDetails' | 'cvScreening' | 'aiInterview') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const setStepValidation = (step: "step1" | "step3", isInvalid: boolean) => {
    dispatch({
      type: "SET",
      category: "isValid",
      field: step,
      payload: isInvalid
    });
  };

  const handleSaveAndContinue = () => {
    if (currentStep === 0) {
      if (!validateCareerDetails(formState.careerDetails)) {
        setStepValidation("step1", true);
        return;
      }
      setStepValidation("step1", false);
    }
    
    if (currentStep === 2) {
      if (!isValidInterviewQuestionsCount(formState.aiScreeningDetails.interviewQuestions)) {
        setStepValidation("step3", true);
        return;
      }
      setStepValidation("step3", false);
    }
    
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);

      // Reset validation when navigating
      if (stepIndex === 0) {
        setStepValidation("step1", false);
      }
      if (stepIndex === 2) {
        setStepValidation("step3", false);
      }
    }
  };

  const STEP_COMPONENTS = [
    CareerDetailsStep,
    CVScreeningStep,
    AIInterviewSetupStep,
    ReviewStep,
  ] as const;

  const CurrentStepComponent = STEP_COMPONENTS[currentStep];

  const getFormTitle = () => {
    if (currentStep === 0) {
      return formType === "edit" ? "Edit career" : "Add new career";
    }
    
    if (formType === "edit") {
      return formState.careerDetails.jobTitle;
    }
    
    return (
      <>
        <span className={styles.draftLabel}>[Draft]</span> {formState.careerDetails.jobTitle}
      </>
    );
  };

  const isLastStep = currentStep === formSteps.length - 1;

  return (
    <div className={styles.careerFormContainer}>
      {isLoadingDraft ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading draft...</span>
            </div>
            <p className={styles.loadingText}>Loading draft...</p>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.headerContainer}>
            <div>
              <h1 className={styles.headerTitle}>
                {getFormTitle()}
              </h1>
              {draftId && formType !== "edit" && (
                <div className={styles.draftStatus}>
                  {isSavingDraft ? (
                    <span>Saving draft...</span>
                  ) : lastSaved ? (
                    <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
                  ) : null}
                </div>
              )}
            </div>

            <div className={styles.buttonContainer}>
              {isLastStep ? (
                <>
                  {formType === "edit" && existingCareerData?.status === "active" ? (
                    <button 
                      className={`${styles.actionButton} ${styles.secondary}`}
                      onClick={handleSaveAsUnpublished}
                      disabled={isSavingUnpublished || isPublishing}
                    >
                      {isSavingUnpublished ? "Unpublishing..." : "Unpublish"}
                    </button>
                  ) : (
                    <button 
                      className={`${styles.actionButton} ${styles.secondary}`}
                      onClick={handleSaveAsUnpublished}
                      disabled={isSavingUnpublished || isPublishing}
                    >
                      {isSavingUnpublished ? "Saving..." : "Save as Unpublished"}
                    </button>
                  )}
                </>
              ) : (
                <button className={`${styles.actionButton} ${styles.secondary} ${styles.disabled}`} disabled>
                  {formType === "edit" ? "Unpublish" : "Save as Unpublished"}
                </button>
              )}

              {isLastStep ? (
                <button 
                  className={styles.actionButton} 
                  onClick={handlePublish}
                  disabled={isPublishing || isSavingUnpublished}
                >
                  {!isPublishing && <img alt="check" src="/iconsV3/checkV7.svg" className={styles.checkIcon} />}
                  {isPublishing ? (formType === "edit" ? "Saving..." : "Publishing...") : (formType === "edit" ? "Save Changes" : "Publish")}
                </button>
              ) : (
                <button className={styles.actionButton} onClick={handleSaveAndContinue}>
                  Save and Continue
                  <img alt="arrow" src={assetConstants.arrow} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.mainContainer}>
            <StepIndicator currentStep={currentStep} formSteps={formSteps} formState={formState} handleClick={handleStepClick} />

            <div
              className={styles.subStepsContainer}
              style={{
                gridTemplateColumns: isLastStep ? "86.1%" : "2fr 1fr",
                justifyContent: isLastStep ? "center" : "initial"
              }}
            >
              <div className={styles.subStepsCol}>
                <CurrentStepComponent 
                  formState={formState} 
                  dispatch={dispatch}
                  {...(currentStep === 1 && { preScreeningHook })}
                  {...(currentStep === 3 && { 
                    collapsedSections, 
                    toggleSection, 
                    setCurrentStep, 
                    draftId: formType === "edit" ? initialCareerId : initialDraftId,
                    formType 
                  })}
                />
              </div>

              {!isLastStep && (
                <TipsBox tips={formSteps[currentStep].tooltips} />
              )}
            </div>
          </div>

          <Tooltip
            id="cv-secret-prompt-tooltip"
            className={styles.tooltipStyle}
          />

          <Tooltip
            id="ai-int-secret-prompt-tooltip"
            className={styles.tooltipStyle}
          />
      </>
      )}
    </div>
  );
}
