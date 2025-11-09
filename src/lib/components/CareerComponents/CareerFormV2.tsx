"use client";

import "@/lib/styles/commonV2/globals.scss";

import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CareerFormProps } from "./CareerForm";
import { useReducer, useState, useRef } from "react";
import { Tooltip } from "react-tooltip";
import CustomDropdownV2 from "@/lib/components/Dropdown/CustomDropdownV2";
import SalaryInput from "@/lib/components/CareerComponents/SalaryInput";
import RichTextEditor from "./RichTextEditor";
import AvatarImage from "../AvatarImage/AvatarImage";
import AssessmentBadge from "./AssessmentBadge";
import TipsBox from "./TipsBox";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import type { FormReducerAction, FormState } from "@/lib/definitions";
import {
  formSteps,
  screeningSettingList,
  employmentTypeOptions,
  workArrangementOptions,
  baseAIInterviewQuestion,
  secretPromptTooltip,
  accessRolesOptions,
  validateCareerDetails,
  isValidInterviewQuestionsCount,
  flattenNewCareerData,
  preScreeningQuestionTypes,
  suggestedPreScreeningQuestions,
} from "@/lib/CareerFormUtils";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast, candidateActionToast } from "@/lib/Utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import StepIndicator from "./StepIndicator";
import SubstepContainer from "./SubstepContainer";
import SubstepFieldsGroup from "./SubstepFieldsGroup";
import { usePreScreeningQuestions } from "@/lib/hooks/usePreScreeningQuestions";
import { useCareerFormSubmission } from "@/lib/hooks/useCareerFormSubmission";

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
  const [accessRole, setAccessRole] = useState<string>();
  
  // Collapsible sections state for Review Center
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
              <div className={styles.subSteps}>
                <SubstepContainer stepNum={1} title="Career Information">
                  <SubstepFieldsGroup title="Basic Information">
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Job Title</span>
                      <input
                        type="text"
                        value={formState.careerDetails.jobTitle}
                        placeholder="Enter job title"
                        style={{ padding: "10px 14px" }}
                        onChange={(e) => dispatch({
                          type: "SET",
                          category: "careerDetails",
                          field: "jobTitle",
                          payload: e.target.value
                        })}
                        onFocus={() => dispatch({
                          type: "SET",
                          category: "isValid",
                          field: "step1",
                          payload: false
                        })}
                        className={formState.isValid.step1 && !formState.careerDetails.jobTitle.trim() ? styles.invalid : ""}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.jobTitle.trim() && (
                        <span style={{ color: "#F04438", fontSize: "14px", marginTop: "2px" }}>
                          Job title is required
                        </span>
                      )}
                    </div>
                  </SubstepFieldsGroup>

                  <SubstepFieldsGroup title="Work Setting">
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Employment Type</span>
                      <CustomDropdownV2
                        value={formState.careerDetails.employmentType}
                        placeholder="Choose employment type"
                        options={employmentTypeOptions}
                        onValueChange={(value) => {
                          dispatch({
                            type: "SET",
                            category: "careerDetails",
                            field: "employmentType",
                            payload: value
                          });
                          dispatch({
                            type: "SET",
                            category: "isValid",
                            field: "step1",
                            payload: false
                          });
                        }}
                        invalid={formState.isValid.step1 && !formState.careerDetails.employmentType}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.employmentType && (
                        <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                          Employment type is required
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Arrangement</span>
                      <CustomDropdownV2
                        value={formState.careerDetails.workArrangement}
                        placeholder="Choose work arrangement"
                        options={workArrangementOptions}
                        onValueChange={(value) => {
                          dispatch({
                            type: "SET",
                            category: "careerDetails",
                            field: "workArrangement",
                            payload: value
                          });
                          dispatch({
                            type: "SET",
                            category: "isValid",
                            field: "step1",
                            payload: false
                          });
                        }}
                        invalid={formState.isValid.step1 && !formState.careerDetails.workArrangement}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.workArrangement && (
                        <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                          Work arrangement is required
                        </span>
                      )}
                    </div>
                  </SubstepFieldsGroup>

                  <SubstepFieldsGroup title="Location">
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Country</span>
                      <CustomDropdownV2
                        value={formState.careerDetails.country}
                        options={[{ name: "Philippines" }]} // FIXME
                        onValueChange={(value) => dispatch({
                          type: "SET",
                          category: "careerDetails",
                          field: "country",
                          payload: value
                        })}
                      />
                    </div>

                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>State / Province</span>
                      <CustomDropdownV2
                        value={formState.careerDetails.state}
                        placeholder="Choose state / province"
                        options={[{ name: "Metro Manila" }]} // FIXME
                        onValueChange={(value) => {
                          dispatch({
                            type: "SET",
                            category: "careerDetails",
                            field: "state",
                            payload: value
                          });
                          dispatch({
                            type: "SET",
                            category: "isValid",
                            field: "step1",
                            payload: false
                          });
                        }}
                        invalid={formState.isValid.step1 && !formState.careerDetails.state}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.state && (
                        <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                          State / Province is required
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>City</span>
                      <CustomDropdownV2
                        value={formState.careerDetails.city}
                        placeholder="Choose city"
                        options={[{ name: "Quezon City" }]} // FIXME
                        onValueChange={(value) => {
                          dispatch({
                            type: "SET",
                            category: "careerDetails",
                            field: "city",
                            payload: value
                          });
                          dispatch({
                            type: "SET",
                            category: "isValid",
                            field: "step1",
                            payload: false
                          });
                        }}
                        invalid={formState.isValid.step1 && !formState.careerDetails.city}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.city && (
                        <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                          City is required
                        </span>
                      )}
                    </div>
                  </SubstepFieldsGroup>

                  <SubstepFieldsGroup
                    title="Salary"
                    hasSwitch={true}
                    switchLabel="Negotiable"
                    isChecked={formState.careerDetails.isSalaryNegotiable}
                    handleSwitch={() => dispatch({
                      type: "SET",
                      category: "careerDetails",
                      field: "isSalaryNegotiable",
                      payload: !formState.careerDetails.isSalaryNegotiable
                    })}
                  >
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Minimum Salary</span>
                      <SalaryInput
                        disabled={formState.careerDetails.isSalaryNegotiable}
                        value={formState.careerDetails.minSalary}
                        currency={formState.careerDetails.salaryCurrency}
                        onValueChange={(value) => {
                          dispatch({
                            type: "SET",
                            category: "careerDetails",
                            field: "minSalary",
                            payload: value
                          });
                          dispatch({
                            type: "SET",
                            category: "isValid",
                            field: "step1",
                            payload: false
                          });
                        }}
                        onCurrencyChange={(value) => dispatch({
                          type: "SET",
                          category: "careerDetails",
                          field: "salaryCurrency",
                          payload: value
                        })}
                        invalid={formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.minSalary.trim()}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.minSalary.trim() && (
                        <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                          Minimum salary is required
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Maximum Salary</span>
                      <SalaryInput
                        disabled={formState.careerDetails.isSalaryNegotiable}
                        value={formState.careerDetails.maxSalary}
                        currency={formState.careerDetails.salaryCurrency}
                        onValueChange={(value) => {
                          dispatch({
                            type: "SET",
                            category: "careerDetails",
                            field: "maxSalary",
                            payload: value
                          });
                          dispatch({
                            type: "SET",
                            category: "isValid",
                            field: "step1",
                            payload: false
                          });
                        }}
                        onCurrencyChange={(value) => dispatch({
                          type: "SET",
                          category: "careerDetails",
                          field: "salaryCurrency",
                          payload: value
                        })}
                        invalid={formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.maxSalary.trim()}
                      />
                      {formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.maxSalary.trim() && (
                        <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                          Maximum salary is required
                        </span>
                      )}
                      {formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && formState.careerDetails.minSalary.trim() && formState.careerDetails.maxSalary.trim() && 
                        parseFloat(formState.careerDetails.minSalary.replace(/,/g, '')) > parseFloat(formState.careerDetails.maxSalary.replace(/,/g, '')) && (
                          <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                            Maximum salary must be greater than minimum salary
                          </span>
                        )}
                    </div>
                  </SubstepFieldsGroup>
                </SubstepContainer>

                <SubstepContainer stepNum={2} title="Job Description">
                  <RichTextEditor 
                    setText={(value: string) => dispatch({
                      type: "SET",
                      category: "careerDetails",
                      field: "jobDescription",
                      payload: value
                    })} 
                    text={formState.careerDetails.jobDescription} 
                  />
                  {formState.isValid.step1 && !formState.careerDetails.jobDescription.trim() && (
                    <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                      Job description is required
                    </span>
                  )}
                </SubstepContainer>

                <SubstepContainer stepNum={3} title="Team Access">
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div className={styles.fieldGroupRow}>
                      <div>
                        <div className={styles.fieldGroupTitle}>Add more members</div>
                        <span className={styles.fieldLabel}>You can add other members to collaborate on this career.</span>
                      </div>

                      <div>
                        <CustomDropdownV2
                          value={formState.teamAccessDetails.authorizedMembers}
                          placeholder="Add member"
                          options={[{ name:"John Doe" }]}
                          onValueChange={(value) => dispatch({
                            type: "SET",
                            category: "teamAccessDetails",
                            field: "authorizedMembers",
                            payload: value
                          })}
                        />
                      </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* TODO: added members list */}
                    <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
                      {/* TODO: should provide an error if there's no at least one job owner */}

                      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <AvatarImage src="https://ui-avatars.com/api/?name=TechCorp+Solutions&size=200&background=4F46E5&color=fff" alt="User avatar" />

                          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                            <div className={styles.fieldGroupTitle}>John Doe <span>(You)</span></div>
                            <span className={styles.fieldLabel}>sample@email.com</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <CustomDropdownV2
                            value={accessRole} // FIXME: should only be the default for the currently logged-in (super)admin
                            options={accessRolesOptions}
                            onValueChange={setAccessRole}
                          />

                          <button
                            disabled={true}
                            className={styles.deleteButton}
                            onClick={() => {
                              // FIXME: handle delete action when enabled
                              console.log("Delete clicked");
                            }}
                          >
                            <img 
                              alt="Delete" 
                              src={assetConstants.trashV2} 
                            />
                          </button>
                        </div>
                      </div>
                    </div>


                    <div style={{ fontSize: "12px", color: "#717680", marginTop: "10px" }}>
                      *Admins can view all careers regardless of specific access settings.
                    </div>
                  </div>
                </SubstepContainer>
              </div>
            )}

            {currentStep === 1 && (
              <div className={styles.subSteps}>
                <SubstepContainer stepNum={1} title="CV Review & Pre-screening">
                  <SubstepFieldsGroup
                    title="CV Screening"
                    description="Jia automatically endorses candidates who meet the chosen criteria"
                    containerStyle={{ gap: "16px" }}
                  >
                    <CustomDropdownV2
                      value={formState.cvScreeningDetails.cvScreeningSetting}
                      options={screeningSettingList}
                      onValueChange={(value) => dispatch({
                        type: "SET",
                        category: "cvScreeningDetails",
                        field: "cvScreeningSetting",
                        payload: value
                      })}
                      fullWidth={false}
                    />
                  </SubstepFieldsGroup>

                  <hr className={styles.divider} />

                  <SubstepFieldsGroup
                    title="CV Secret Prompt"
                    description="Secret Prompts give you extra control over Jia’s evaluation style, complementing her accurate assessment of requirements from the job description."
                    optional={true}
                    icon={(
                      <img src="/icons/spark.svg" alt="Tips icon" style={{ width: "19px", height: "19px", marginBottom: "5px" }} />
                    )}
                    containerStyle={{ gap: "12px" }}
                    tooltipId="cv-secret-prompt-tooltip"
                    tooltip={secretPromptTooltip}
                  >
                    <textarea
                      onChange={(e) => dispatch({
                        type: "SET",
                        category: "cvScreeningDetails",
                        field: "cvSecretPrompt",
                        payload: e.target.value
                      })}
                      value={formState.cvScreeningDetails.cvSecretPrompt}
                      placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)">
                    </textarea>
                  </SubstepFieldsGroup>
                </SubstepContainer>

                <SubstepContainer
                  stepNum={2}
                  title="Pre-screening Options"
                  optional={true}
                  style={{ gap: "12px" }}
                  count={formState.cvScreeningDetails.preScreeningQuestions.length}
                  headingBtn={(
                    <button type="button" onClick={preScreeningHook.handleAddCustomQuestion} className={styles.psAddCustomBtn}>
                      <img src="/icons/plus.svg" alt="Plus Icon" />
                      Add Custom
                    </button>
                  )}
                >
                  <SubstepFieldsGroup
                    containerStyle={{ gap: "12px" }}
                    description={formState.cvScreeningDetails.preScreeningQuestions.length === 0 && "No pre-screening questions added yet."}
                  />

                  {formState.cvScreeningDetails.preScreeningQuestions.length > 0 && (
                    <div className={styles.psQuestions}>
                      {formState.cvScreeningDetails.preScreeningQuestions.map((psQuestion) => (
                        <div 
                          className={styles.psQuestionItemWrapper} 
                          key={psQuestion.id}
                          draggable={true}
                          onDragStart={(e) => preScreeningHook.handleDragStart(e, psQuestion.id)}
                          onDragOver={preScreeningHook.handleDragOver}
                          onDragLeave={preScreeningHook.handleDragLeave}
                          onDrop={(e) => preScreeningHook.handleDrop(e, psQuestion.id)}
                        >
                          <div className={styles.grip}>
                            <img src="/icons/dragIcon.svg" alt="Grip Icon" style={{ width: "14px", height: "14px", margin: "0 7px" }} />
                          </div>

                          <div className={styles.psQuestionItem}>
                            <div className={`${styles.questionHeader}`}>
                              {psQuestion.id.startsWith("custom-") ? (
                                <input
                                  type="text"
                                  placeholder="Write your question..."
                                  value={psQuestion.question}
                                  onChange={(e) => preScreeningHook.handleUpdateQuestion(psQuestion.id, "question", e.target.value)}
                                  style={{ padding: "10px 14px", flex: 1 }}
                                />
                              ) : (
                                  <span>{psQuestion.question}</span>
                                )}

                              <CustomDropdownV2
                                value={psQuestion.questionType === "dropdown" ? "Dropdown" : psQuestion.questionType === "range" ? "Range" : psQuestion.questionType === "shorttext" ? "Short Answer" : "Long Answer"}
                                options={preScreeningQuestionTypes}
                                onValueChange={(value) => {
                                  const typeMap: Record<string, typeof psQuestion.questionType> = {
                                    "Dropdown": "dropdown",
                                    "Range": "range",
                                    "Short Answer": "shorttext",
                                    "Long Answer": "longtext"
                                  };
                                  preScreeningHook.handleUpdateQuestion(psQuestion.id, "questionType", typeMap[value]);
                                }}
                                fullWidth={false}
                              />
                            </div>

                            <div className={styles.choicesWrapper}>
                              {psQuestion.questionType === "dropdown" && (
                                <>
                                  {psQuestion.options?.map((option, idx) => (
                                    <div className={styles.dropdownItem} key={idx}>
                                      <div className={styles.dropdownValue}>
                                        <div className={styles.number}>{idx + 1}</div>
                                        <input
                                          type="text"
                                          className={styles.value}
                                          value={option.name}
                                          onChange={(e) => preScreeningHook.handleUpdateOption(psQuestion.id, idx, e.target.value)}
                                          placeholder={`Option ${idx + 1}`}
                                          style={{ border: "none", outline: "none", background: "transparent", flex: 1 }}
                                        />
                                      </div>

                                      <img 
                                        src="/icons/circle-xV2.svg" 
                                        alt="X Icon" 
                                        style={{ cursor: "pointer" }}
                                        onClick={() => preScreeningHook.handleDeleteOption(psQuestion.id, idx)}
                                      />
                                    </div>
                                  ))}

                                  <div 
                                    className={styles.addOptionBtn}
                                    onClick={() => preScreeningHook.handleAddOption(psQuestion.id)}
                                  >
                                    <i className="la la-plus" /> Add Option
                                  </div>
                                </>
                              )}

                              {psQuestion.questionType === "range" && (
                                <>
                                  {psQuestion.id.includes("suggested-asking-salary") ? (
                                    <div style={{ display: "flex", gap: "16px" }}>
                                      <div className={styles.field} style={{ flex: 1 }}>
                                        <span className={styles.fieldLabel}>Minimum Salary</span>
                                        <SalaryInput
                                          value={psQuestion.answer && typeof psQuestion.answer === "object" && "min" in psQuestion.answer 
                                            ? String(psQuestion.answer.min || "") 
                                            : ""}
                                          currency={psQuestion.currency || "PHP"}
                                          onValueChange={(value) => {
                                            const numValue = value ? parseFloat(value.replace(/,/g, '')) : 0;
                                            const currentAnswer = psQuestion.answer && typeof psQuestion.answer === "object" && "min" in psQuestion.answer
                                              ? psQuestion.answer
                                              : { min: 0, max: 0 };
                                            preScreeningHook.handleUpdateQuestion(psQuestion.id, "answer", { ...currentAnswer, min: numValue });
                                          }}
                                          onCurrencyChange={(currency) => preScreeningHook.handleUpdateQuestion(psQuestion.id, "currency", currency)}
                                        />
                                      </div>

                                      <div className={styles.field} style={{ flex: 1 }}>
                                        <span className={styles.fieldLabel}>Maximum Salary</span>
                                        <SalaryInput
                                          value={psQuestion.answer && typeof psQuestion.answer === "object" && "max" in psQuestion.answer 
                                            ? String(psQuestion.answer.max || "") 
                                            : ""}
                                          currency={psQuestion.currency || "PHP"}
                                          onValueChange={(value) => {
                                            const numValue = value ? parseFloat(value.replace(/,/g, '')) : 0;
                                            const currentAnswer = psQuestion.answer && typeof psQuestion.answer === "object" && "max" in psQuestion.answer
                                              ? psQuestion.answer
                                              : { min: 0, max: 0 };
                                            preScreeningHook.handleUpdateQuestion(psQuestion.id, "answer", { ...currentAnswer, max: numValue });
                                          }}
                                          onCurrencyChange={(currency) => preScreeningHook.handleUpdateQuestion(psQuestion.id, "currency", currency)}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                      <div style={{ display: "flex", gap: "16px" }}>
                                        <div className={styles.field} style={{ flex: 1 }}>
                                          <span className={styles.fieldLabel}>Minimum</span>
                                          <input
                                            type="number"
                                            placeholder="Enter minimum value"
                                            style={{ padding: "10px 14px" }}
                                            value={psQuestion.answer && typeof psQuestion.answer === "object" && "min" in psQuestion.answer 
                                              ? psQuestion.answer.min 
                                              : ""}
                                            onChange={(e) => {
                                              const numValue = e.target.value ? parseFloat(e.target.value) : 0;
                                              const currentAnswer = psQuestion.answer && typeof psQuestion.answer === "object" && "min" in psQuestion.answer
                                                ? psQuestion.answer
                                                : { min: 0, max: 0 };
                                              preScreeningHook.handleUpdateQuestion(psQuestion.id, "answer", { ...currentAnswer, min: numValue });
                                            }}
                                          />
                                        </div>

                                        <div className={styles.field} style={{ flex: 1 }}>
                                          <span className={styles.fieldLabel}>Maximum</span>
                                          <input
                                            type="number"
                                            placeholder="Enter maximum value"
                                            style={{ padding: "10px 14px" }}
                                            value={psQuestion.answer && typeof psQuestion.answer === "object" && "max" in psQuestion.answer 
                                              ? psQuestion.answer.max 
                                              : ""}
                                            onChange={(e) => {
                                              const numValue = e.target.value ? parseFloat(e.target.value) : 0;
                                              const currentAnswer = psQuestion.answer && typeof psQuestion.answer === "object" && "max" in psQuestion.answer
                                                ? psQuestion.answer
                                                : { min: 0, max: 0 };
                                              preScreeningHook.handleUpdateQuestion(psQuestion.id, "answer", { ...currentAnswer, max: numValue });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                </>
                              )}

                              {(psQuestion.questionType === "dropdown" || psQuestion.questionType === "range") && (
                                <hr className={styles.divider} />
                              )}

                              <div style={{ display: "flex", justifyContent: "end" }}>
                                <button 
                                  className={styles.deleteChoiceBtn}
                                  onClick={() => preScreeningHook.handleDeleteQuestion(psQuestion.id)}
                                >
                                  <i className="la la-trash" /> Delete Question
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                  <hr className={styles.divider} />

                  <SubstepFieldsGroup
                    containerStyle={{ gap: "12px" }}
                    style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                    title="Suggested Pre-screening Questions:"
                  >
                    {suggestedPreScreeningQuestions.map(q => {
                      const isAdded = formState.cvScreeningDetails.preScreeningQuestions.some(
                        psq => psq.id.includes(q.id)
                      );

                      return (
                        <div 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between",
                            opacity: isAdded ? 0.5 : 1,
                            pointerEvents: isAdded ? "none" : "auto"
                          }} 
                          key={q.title}
                        >
                          <div>
                            <div style={{ color: isAdded ? "#D5D7DA" : "#414651", fontWeight: "bold" }}>{q.title}</div>
                            <div style={{ color: isAdded ? "#D5D7DA" : "#717680", fontWeight: "500" }}>{q.question}</div>
                          </div>

                          <button 
                            type="button" 
                            className={`${styles.actionButton} ${styles.secondary}`}
                            onClick={() => preScreeningHook.handleAddSuggestedQuestion(q)}
                            disabled={isAdded}
                            style={{
                              color: isAdded ? "#D5D7DA" : "",
                              cursor: isAdded ? "not-allowed" : "pointer"
                            }}
                          >
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </SubstepFieldsGroup>
                </SubstepContainer>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.subSteps}>
                <SubstepContainer stepNum={1} title="AI Interview Screening" style={{ gap: "12px" }}>
                  <SubstepFieldsGroup
                    style={{ gap: "16px" }}
                    title="AI Interview Screening"
                    description="Jia automatically endorses candidates who meet the chosen criteria."
                  >
                    <CustomDropdownV2
                      value={formState.aiScreeningDetails.aiScreeningSetting}
                      options={screeningSettingList}
                      onValueChange={(value) => dispatch({
                        type: "SET",
                        category: "aiScreeningDetails",
                        field: "aiScreeningSetting",
                        payload: value
                      })}
                      fullWidth={false}
                    />
                  </SubstepFieldsGroup>

                  <hr className={styles.divider} />

                  <SubstepFieldsGroup
                    title="Require Video on Interview"
                    description="Require candidates to keep their camera on. Recordings will appear on their analysis page."
                  >
                    <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <img src="/icons/videocam.svg" alt="" />
                        <span style={{ fontSize: "16px", color: "#717680" }}>
                          Require Video Interview
                        </span>
                      </div>

                      <div style={{ fontSize: "16px", color: "#717680" }}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={formState.aiScreeningDetails.isVideoInterviewRequired}
                            onChange={() => dispatch({
                              type: "SET",
                              category: "aiScreeningDetails",
                              field: "isVideoInterviewRequired",
                              payload: !formState.aiScreeningDetails.isVideoInterviewRequired
                            })}
                          />
                          <span className="slider round"></span>
                        </label>{" "}
                        <span>Yes</span>
                      </div>
                    </div>
                  </SubstepFieldsGroup>

                  <hr className={styles.divider} />

                  <div className={styles.fieldGroup} style={{ gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <img src="/icons/spark.svg" alt="Tips icon" style={{ width: "19px", height: "19px", marginBottom: "5px" }} />
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#181d27", marginBottom: "4px" }}>
                          AI Interview Secret Prompt{" "}
                          <span style={{ color: "#717680", fontWeight: "normal" }}>(optional)</span>{" "}
                          <img
                            alt="help-icon"
                            src="/icons/help-icon.svg"
                            style={{ marginBottom: "3px" }}
                            data-tooltip-id="ai-int-secret-prompt-tooltip"
                            data-tooltip-delay-show={0}
                            data-tooltip-html={secretPromptTooltip}
                          />

                        </div>
                      </div>

                      <span className={styles.fieldGroupDesc}>Secret Prompts give you extra control over Jia’s evaluation style, complementing her accurate assessment of requirements from the job description.</span>
                    </div>

                    <textarea placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)">
                    </textarea>
                  </div>
                </SubstepContainer>

                <InterviewQuestionGeneratorV2 
                  questions={formState.aiScreeningDetails.interviewQuestions} 
                  setQuestions={(questions) => {
                    dispatch({
                      type: "SET",
                      category: "aiScreeningDetails",
                      field: "interviewQuestions",
                      payload: questions
                    })

                    dispatch({
                      type: "SET",
                      category: "isValid",
                      field: "step3",
                      payload: false
                    });
                  }} 
                  jobTitle={formState.careerDetails.jobTitle} 
                  description={formState.careerDetails.jobDescription}
                  showValidation={formState.isValid.step3}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.subSteps}>
                <SubstepContainer
                  title="Career Details & Team Access"
                  className={styles.reviewFieldsGroup}
                  isCollapsible={true}
                  handleHeadingClick={() => toggleSection("careerDetails")}
                  isCollapsed={collapsedSections.careerDetails}
                >
                  <div className={styles.reviewField}>
                    <div className={styles.fieldLabel}>Job Title</div>
                    <div className={styles.fieldValue}>{formState.careerDetails.jobTitle}</div>
                  </div>

                  <hr className={styles.groupDivider} />

                  <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr 1fr", width: "100%" }}>
                    <div className={styles.reviewField} style={{ flex: "1" }}>
                      <div className={styles.fieldLabel}>Country</div>
                      <div className={styles.fieldValue}>{formState.careerDetails.country}</div>
                    </div>

                    <div className={styles.reviewField} style={{ flex: "1" }}>
                      <div className={styles.fieldLabel}>State / Province</div>
                      <div className={styles.fieldValue}>{formState.careerDetails.state}</div>
                    </div>

                    <div className={styles.reviewField} style={{ flex: "1" }}>
                      <div className={styles.fieldLabel}>City</div>
                      <div className={styles.fieldValue}>{formState.careerDetails.city}</div>
                    </div>
                  </div>

                  <hr className={styles.groupDivider} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%" }}>
                    <div className={styles.reviewField}>
                      <div className={styles.fieldLabel}>Minimum Salary</div>
                      <div className={styles.fieldValue}>
                        {formState.careerDetails.isSalaryNegotiable 
                          ? "Negotiable" 
                          : `${formState.careerDetails.salaryCurrency} ${formState.careerDetails.minSalary}`}
                      </div>
                    </div>

                    <div className={styles.reviewField} style={{ gridColumn: "span 2" }}>
                      <div className={styles.fieldLabel}>Maximum Salary</div>
                      <div className={styles.fieldValue}>
                        {formState.careerDetails.isSalaryNegotiable 
                          ? "Negotiable" 
                          : `${formState.careerDetails.salaryCurrency} ${formState.careerDetails.maxSalary}`}
                      </div>
                    </div>
                  </div>

                  <hr className={styles.groupDivider} />

                  <div className={styles.reviewField}>
                    <div className={styles.fieldLabel} style={{ marginBottom: "8px" }}>Job Description</div>
                    <div 
                      className={styles.fieldValue}
                      dangerouslySetInnerHTML={{ __html: formState.careerDetails.jobDescription }}
                    />
                  </div>
                </SubstepContainer>

                <SubstepContainer
                  title="CV Review & Pre-Screening Questions"
                  className={styles.reviewFieldsGroup}
                  isCollapsible={true}
                  handleHeadingClick={() => toggleSection("cvScreening")}
                  isCollapsed={collapsedSections.cvScreening}
                >
                  <div className={styles.reviewField}>
                    <div className={styles.fieldLabel}>CV Screening</div>
                    <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={formState.cvScreeningDetails.cvScreeningSetting} /> and above</div>
                  </div>

                  {formState.cvScreeningDetails.cvSecretPrompt && (
                    <>
                      <hr className={styles.groupDivider} />

                      <div className={styles.reviewField}>
                        <div className={styles.fieldLabel} style={{ marginBottom: "8px" }}>
                          <img src="/icons/spark.svg" alt="Tips icon" style={{ width: "19px", height: "19px", marginBottom: "5px" }} />
                          <span style={{ marginLeft: "7px" }}>
                            CV Secret Prompt
                          </span>
                        </div>


                        <div className={styles.fieldValue}>
                          {formState.cvScreeningDetails.cvSecretPrompt}
                        </div>
                      </div>
                    </>
                  )}

                  {formState.cvScreeningDetails.preScreeningQuestions.length > 0 && (
                    <>
                      <hr className={styles.groupDivider} />

                      <div className={`${styles.reviewField} `}>
                        <div className={styles.fieldLabel}>
                          Pre-Screening Questions <span className={styles.countBadge}>
                            {formState.cvScreeningDetails.preScreeningQuestions.length}
                          </span>
                        </div>

                        <ol className={`${styles.questionList} ${styles.psQuestion}`} style={{ marginTop: "8px" }}>
                          {formState.cvScreeningDetails.preScreeningQuestions.map((question) => (
                            <li key={question.id} style={{ marginBottom: "8px" }}>
                              {question.question}

                              {/* Display dropdown options as nested unordered list */}
                              {question.questionType === "dropdown" && question.options && question.options.length > 0 && (
                                <ul>
                                  {question.options.filter(opt => opt.name.trim()).map((option, optIdx) => (
                                    <li key={optIdx}>{option.name}</li>
                                  ))}
                                </ul>
                              )}

                              {/* Display salary range as nested unordered list */}
                              {question.questionType === "range" && question.answer && typeof question.answer === "object" && "min" in question.answer && (
                                <ul>
                                  <li>
                                    Preferred: {formState.careerDetails.salaryCurrency} {question.answer.min.toLocaleString()} - {formState.careerDetails.salaryCurrency} {question.answer.max.toLocaleString()}
                                  </li>
                                </ul>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </SubstepContainer>

                <SubstepContainer
                  title="AI Interview Setup"
                  className={styles.reviewFieldsGroup}
                  isCollapsible={true}
                  handleHeadingClick={() => toggleSection("aiInterview")}
                  isCollapsed={collapsedSections.aiInterview}
                >
                  <div className={styles.reviewField}>
                    <div className={styles.fieldLabel}>AI Interview Screening</div>
                    <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={formState.aiScreeningDetails.aiScreeningSetting} /> and above</div>
                  </div>

                  <hr className={styles.groupDivider} />

                  <div className={styles.reviewField} style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                    <div className={styles.fieldLabel}>Require Video on Interview</div>
                    <div className={styles.fieldValue} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {formState.aiScreeningDetails.isVideoInterviewRequired ? "Yes" : "No"}
                      <img 
                        src={formState.aiScreeningDetails.isVideoInterviewRequired ? "/icons/checkV3-green.svg" : "/icons/circle-x.svg"} 
                        alt={formState.aiScreeningDetails.isVideoInterviewRequired ? "check" : "x"} 
                        style={{ width: "18px", height: "18px" }} 
                      />
                    </div>
                  </div>

                  <hr className={styles.groupDivider} />

                  <div className={styles.reviewField}>
                    <div className={styles.fieldLabel}>
                      Interview Questions <span className={styles.countBadge}>
                        {formState.aiScreeningDetails.interviewQuestions.reduce((acc, group) => acc + group.questions.length, 0)}
                      </span>
                    </div>

                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {(() => {
                        let cumulativeCount = 0;
                        return formState.aiScreeningDetails.interviewQuestions
                          .filter((categ) => categ.questions.length > 0)
                          .map((categ) => {
                            const startNumber = cumulativeCount + 1;
                            cumulativeCount += categ.questions.length;

                            return (
                              <div key={categ.id}>
                                <div className={styles.questionCateg}>{categ.category}</div>

                                <ol className={styles.questionList} start={startNumber}>
                                  {categ.questions.map(q => (
                                    <li key={q.id}>{q.question}</li>
                                  ))}
                                </ol>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>
                </SubstepContainer>
              </div>
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
