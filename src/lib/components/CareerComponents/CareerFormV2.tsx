"use client";

import "@/lib/styles/commonV2/globals.scss";

import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CareerFormProps } from "./CareerForm";
import { useReducer, useState } from "react";
import { Tooltip } from "react-tooltip";
import TipsBox from "./TipsBox";
import type { FormReducerAction, FormState } from "@/lib/definitions";
import {
  formSteps,
  screeningSettingList,
  baseAIInterviewQuestion,
  validateCareerDetails,
  isValidInterviewQuestionsCount,
} from "@/lib/CareerFormUtils";
import { useAppContext } from "@/lib/context/AppContext";
import { useRouter } from "next/navigation";
import StepIndicator from "./StepIndicator";
import { usePreScreeningQuestions } from "@/lib/hooks/usePreScreeningQuestions";
import { useCareerFormSubmission } from "@/lib/hooks/useCareerFormSubmission";
import CareerFormStep0 from "./CareerFormStep0";
import CareerFormStep1 from "./CareerFormStep1";
import CareerFormStep2 from "./CareerFormStep2";
import CareerFormStep3 from "./CareerFormStep3";

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
  career,
  formType,
  setShowEditModal,
}: CareerFormProps) {
  const { user, orgID } = useAppContext();
  const router = useRouter();

  const [formState, dispatch] = useReducer(formReducer, initFormState);

  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Collapsible sections state for Review Center (Step 3)
  const [collapsedSections, setCollapsedSections] = useState<{
    careerDetails: boolean;
    cvScreening: boolean;
    aiInterview: boolean;
  }>({
    careerDetails: false,
    cvScreening: false,
    aiInterview: false,
  });

  // Pre-screening questions hook
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

  // Form submission hook
  const {
    isPublishing,
    isSavingUnpublished,
    handlePublish,
    handleSaveAsUnpublished,
  } = useCareerFormSubmission(formState, orgID, user);

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

  return (
    <div className={styles.careerFormContainer}>
      <div style={{ marginBottom: "35px", display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>
          {currentStep > 0 ? (
            <>
              <span style={{ color: "#717680" }}>[Draft]</span> {formState.careerDetails.jobTitle}
            </>
          ) : <>Add new career</>}
        </h1>

        <div className={styles.buttonContainer}>
          {currentStep === formSteps.length - 1 ? (
            <button 
              className={`${styles.actionButton} ${styles.secondary}`}
              onClick={handleSaveAsUnpublished}
              disabled={isSavingUnpublished || isPublishing}
            >
              {isSavingUnpublished ? "Saving..." : "Save as Unpublished"}
            </button>
          ) : (
            <button className={`${styles.actionButton} ${styles.secondary} ${styles.disabled}`} disabled>
              Save as Unpublished
            </button>
          )}

          {currentStep === formSteps.length - 1 ? (
            <button 
              className={styles.actionButton} 
              onClick={handlePublish}
              disabled={isPublishing || isSavingUnpublished}
            >
              {!isPublishing && <img alt="check" src="/iconsV3/checkV7.svg" style={{ width: "19px", height: "19px" }} />}
              {isPublishing ? "Publishing..." : "Publish"}
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
            {currentStep === 0 && (
              <CareerFormStep0 formState={formState} dispatch={dispatch} />
            )}

            {currentStep === 1 && (
              <CareerFormStep1 formState={formState} dispatch={dispatch} preScreeningHook={preScreeningHook} />
            )}

            {currentStep === 2 && (
              <CareerFormStep2 formState={formState} dispatch={dispatch} />
            )}

            {currentStep === 3 && (
              <CareerFormStep3 formState={formState} collapsedSections={collapsedSections} toggleSection={toggleSection} />
            )}
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
    </div>
  );
}
