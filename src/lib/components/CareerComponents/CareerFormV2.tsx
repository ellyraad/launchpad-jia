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
import CareerFormStep0 from "./CareerFormStep0";
import CareerFormStep1 from "./CareerFormStep1";
import CareerFormStep2 from "./CareerFormStep2";
import CareerFormStep3 from "./CareerFormStep3";
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
    const newState = {
      ...state,
      [action.category]: {
        ...(state[action.category]),
        [action.field]: action.payload
      }
    }

    return newState;
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
    formType !== "edit", // Only enable autosave for non-edit mode
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

  // Load existing career data for editing
  useEffect(() => {
    const loadCareerData = async () => {
      if (!initialCareerId || !orgID || formType !== "edit") return;

      setIsLoadingDraft(true);
      try {
        const response = await axios.post("/api/career-data", {
          id: initialCareerId,
          orgID,
        });

        if (response.data) {
          setExistingCareerData(response.data);
          const mappedFormState = mapCareerToFormState(response.data);
          
          Object.entries(mappedFormState.careerDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "careerDetails",
              field: field as keyof FormState["careerDetails"],
              payload: value,
            });
          });

          Object.entries(mappedFormState.cvScreeningDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "cvScreeningDetails",
              field: field as keyof FormState["cvScreeningDetails"],
              payload: value,
            });
          });

          Object.entries(mappedFormState.aiScreeningDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "aiScreeningDetails",
              field: field as keyof FormState["aiScreeningDetails"],
              payload: value,
            });
          });

          Object.entries(mappedFormState.teamAccessDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "teamAccessDetails",
              field: field as keyof FormState["teamAccessDetails"],
              payload: value,
            });
          });

          // Use initialStep from URL if provided
          if (initialStep !== undefined) {
            setCurrentStep(initialStep);
          }
        }
      } catch (error) {
        console.error("Error loading career data:", error);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadCareerData();
  }, [initialCareerId, orgID, formType, initialStep]);

  // Load draft data (for new career flow)
  useEffect(() => {
    const loadDraftData = async () => {
      if (!initialDraftId || !orgID || formType === "edit") return;

      setIsLoadingDraft(true);
      try {
        const response = await axios.post("/api/career-data", {
          id: initialDraftId,
          orgID,
        });

        if (response.data) {
          const mappedFormState = mapCareerToFormState(response.data);
          
          Object.entries(mappedFormState.careerDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "careerDetails",
              field: field as keyof FormState["careerDetails"],
              payload: value,
            });
          });

          Object.entries(mappedFormState.cvScreeningDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "cvScreeningDetails",
              field: field as keyof FormState["cvScreeningDetails"],
              payload: value,
            });
          });

          Object.entries(mappedFormState.aiScreeningDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "aiScreeningDetails",
              field: field as keyof FormState["aiScreeningDetails"],
              payload: value,
            });
          });

          Object.entries(mappedFormState.teamAccessDetails).forEach(([field, value]) => {
            dispatch({
              type: "SET",
              category: "teamAccessDetails",
              field: field as keyof FormState["teamAccessDetails"],
              payload: value,
            });
          });

          // Use initialStep from URL if provided, otherwise use saved draftStep
          if (initialStep !== undefined) {
            setCurrentStep(initialStep);
          } else if (response.data.draftStep !== undefined) {
            setCurrentStep(response.data.draftStep);
          }
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadDraftData();
  }, [initialDraftId, orgID, formType, initialStep]);

  const toggleSection = (section: 'careerDetails' | 'cvScreening' | 'aiInterview') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveAndContinue = () => {
    if (currentStep === 0) {
      if (!validateCareerDetails(formState.careerDetails)) {
        dispatch({
          type: "SET",
          category: "isValid",
          field: "step1",
          payload: true
        });
        return;
      }
      dispatch({
        type: "SET",
        category: "isValid",
        field: "step1",
        payload: false
      });
    }
    
    if (currentStep === 2) {
      if (!isValidInterviewQuestionsCount(formState.aiScreeningDetails.interviewQuestions)) {
        dispatch({
          type: "SET",
          category: "isValid",
          field: "step3",
          payload: true
        });
        return;
      }
      dispatch({
        type: "SET",
        category: "isValid",
        field: "step3",
        payload: false
      });
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
        dispatch({
          type: "SET",
          category: "isValid",
          field: "step1",
          payload: false
        });
      }
      if (stepIndex === 2) {
        dispatch({
          type: "SET",
          category: "isValid",
          field: "step3",
          payload: false
        });
      }
    }
  };

  const STEP_COMPONENTS = [
    CareerFormStep0,
    CareerFormStep1,
    CareerFormStep2,
    CareerFormStep3,
  ] as const;

  const CurrentStepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className={styles.careerFormContainer}>
      {isLoadingDraft ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading draft...</span>
            </div>
            <p style={{ marginTop: "1rem", color: "#717680" }}>Loading draft...</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "35px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>
                {formType === "edit" ? (
                  <>
                    {currentStep > 0 ? (
                      formState.careerDetails.jobTitle
                    ) : <>Edit career</>}
                  </>
                ) : (
                  <>
                    {currentStep > 0 ? (
                      <>
                        <span style={{ color: "#717680" }}>[Draft]</span> {formState.careerDetails.jobTitle}
                      </>
                    ) : <>Add new career</>}
                  </>
                )}
              </h1>
              {draftId && formType !== "edit" && (
                <div style={{ fontSize: "12px", color: "#717680", marginTop: "4px" }}>
                  {isSavingDraft ? (
                    <span>Saving draft...</span>
                  ) : lastSaved ? (
                    <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
                  ) : null}
                </div>
              )}
            </div>

            <div className={styles.buttonContainer}>
              {currentStep === formSteps.length - 1 ? (
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

              {currentStep === formSteps.length - 1 ? (
                <button 
                  className={styles.actionButton} 
                  onClick={handlePublish}
                  disabled={isPublishing || isSavingUnpublished}
                >
                  {!isPublishing && <img alt="check" src="/iconsV3/checkV7.svg" style={{ width: "19px", height: "19px" }} />}
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
                gridTemplateColumns: currentStep === formSteps.length - 1 ? "86.1%" : "2fr 1fr",
                justifyContent: currentStep === formSteps.length - 1 ? "center" : "initial"
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

              {currentStep !== formSteps.length - 1 && (
                <TipsBox tips={formSteps[currentStep].tooltips} />
              )}
            </div>
          </div>

          <Tooltip
            id="cv-secret-prompt-tooltip"
            style={{ transition: 'opacity 0.2s ease-in-out', borderRadius: "8px", backgroundColor: "#181D27" }}
          />

          <Tooltip
            id="ai-int-secret-prompt-tooltip"
            style={{ transition: 'opacity 0.2s ease-in-out', borderRadius: "8px", backgroundColor: "#181D27" }}
          />
      </>
      )}
    </div>
  );
}
