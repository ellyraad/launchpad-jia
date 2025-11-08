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
  validateStepStatus,
  flattenNewCareerData,
} from "@/lib/CareerFormUtils";
import { useAppContext } from "@/lib/context/AppContext";
import { successToast, errorToast, candidateActionToast } from "@/lib/Utils";
import axios from "axios";
import { useRouter } from "next/navigation";

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

  validationErrors: {
    step1: true,
    step3: true,
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
  const [isSavingCareer, setIsSavingCareer] = useState<boolean>(false);
  const savingCareerRef = useRef<boolean>(false);

  const handleSaveAndContinue = () => {
    if (currentStep === 0) {
      if (!validateCareerDetails(formState.careerDetails)) {
        dispatch({
          type: "SET",
          category: "validationErrors",
          field: "step1",
          payload: false
        });
        return;
      }
      dispatch({
        type: "SET",
        category: "validationErrors",
        field: "step1",
        payload: true
      });
    }
    
    if (currentStep === 2) {
      if (!isValidInterviewQuestionsCount(formState.aiScreeningDetails.interviewQuestions)) {
        dispatch({
          type: "SET",
          category: "validationErrors",
          field: "step3",
          payload: false
        });
        return;
      }
      dispatch({
        type: "SET",
        category: "validationErrors",
        field: "step3",
        payload: true
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
          category: "validationErrors",
          field: "step1",
          payload: true
        });
      }
      if (stepIndex === 2) {
        dispatch({
          type: "SET",
          category: "validationErrors",
          field: "step3",
          payload: true
        });
      }
    }
  };

  const handlePublish = async () => {
    // Prevent duplicate submissions
    if (savingCareerRef.current) return;
    
    savingCareerRef.current = true;
    setIsSavingCareer(true);

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
      setIsSavingCareer(false);
    }
  };

  const handleSaveAsUnpublished = async () => {
    // Prevent duplicate submissions
    if (savingCareerRef.current) return;
    
    savingCareerRef.current = true;
    setIsSavingCareer(true);

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
      setIsSavingCareer(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
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
              disabled={isSavingCareer}
            >
              {isSavingCareer ? "Saving..." : "Save as Unpublished"}
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
              disabled={isSavingCareer}
            >
              {isSavingCareer ? "Publishing..." : "Publish"}
              {!isSavingCareer && <img alt="arrow" src={assetConstants.arrow} />}
            </button>
          ) : (
            <button className={styles.actionButton} onClick={handleSaveAndContinue}>
              Save and Continue
              <img alt="arrow" src={assetConstants.arrow} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className={styles.topContainer}>
          <div className={styles.applicationStepContainer}>
            {formSteps.map((step, index) => {
              const stepStatus = validateStepStatus(
                currentStep,
                index,
                formState.careerDetails,
                formState.aiScreeningDetails.interviewQuestions,
                formState.validationErrors,
              );
              const isClickable = index <= currentStep;
              
              return (
                <div className={styles.stepContainer} key={index}>
                  <div 
                    className={styles.indicator}
                    onClick={() => handleStepClick(index)}
                    style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  >
                    {stepStatus === "invalid" ? (
                      <img alt="warning" src={assetConstants.alertTriangle} />
                    ) : (
                      <img alt="in progress icon" src={stepStatus === "completed" ? assetConstants.completed : assetConstants.in_progress} />
                    )}
                    {index < formSteps.length - 1 && (
                      <hr className={`webView ${styles[stepStatus === "invalid" ? "in_progress" : stepStatus]}`} />
                    )}
                  </div>

                  <div 
                    className={styles.stepDetails}
                    onClick={() => handleStepClick(index)}
                    style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  >
                    <div className={`webView ${styles.stepDescription} ${styles[stepStatus === "invalid" ? "in_progress" : stepStatus]}`}>{step.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: currentStep === formSteps.length - 1 ? "86.1%" : "2fr 1fr", gap: "24px", width: "100%", paddingBottom: "40px", justifyContent: currentStep === formSteps.length - 1 ? "center" : "initial" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {currentStep === 0 && (
              <>
                <div className={styles.stepFieldsContainer}>
                  <h2>1. Career Information</h2>

                  <div className={styles.fieldsWrapper}>
                    <div className={styles.fieldGroup}>
                      <h3>Basic Information</h3>
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
                            category: "validationErrors",
                            field: "step1",
                            payload: true
                          })}
                          className={!formState.validationErrors.step1 && !formState.careerDetails.jobTitle.trim() ? styles.invalid : ""}
                        />
                        {!formState.validationErrors.step1 && !formState.careerDetails.jobTitle.trim() && (
                          <span style={{ color: "#F04438", fontSize: "14px", marginTop: "2px" }}>
                            Job title is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <h3>Work Setting</h3>
                      <div style={{ display: "flex", gap: "16px" }}>
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
                                category: "validationErrors",
                                field: "step1",
                                payload: true
                              });
                            }}
                            invalid={!formState.validationErrors.step1 && !formState.careerDetails.employmentType}
                          />
                          {!formState.validationErrors.step1 && !formState.careerDetails.employmentType && (
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
                                category: "validationErrors",
                                field: "step1",
                                payload: true
                              });
                            }}
                            invalid={!formState.validationErrors.step1 && !formState.careerDetails.workArrangement}
                          />
                          {!formState.validationErrors.step1 && !formState.careerDetails.workArrangement && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              Work arrangement is required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <h3>Location</h3>

                      <div style={{ display: "flex", gap: "16px" }}>
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
                                category: "validationErrors",
                                field: "step1",
                                payload: true
                              });
                            }}
                            invalid={!formState.validationErrors.step1 && !formState.careerDetails.state}
                          />
                          {!formState.validationErrors.step1 && !formState.careerDetails.state && (
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
                                category: "validationErrors",
                                field: "step1",
                                payload: true
                              });
                            }}
                            invalid={!formState.validationErrors.step1 && !formState.careerDetails.city}
                          />
                          {!formState.validationErrors.step1 && !formState.careerDetails.city && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              City is required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>Salary</h3>

                        <div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={formState.careerDetails.isSalaryNegotiable}
                              onChange={() => dispatch({
                                type: "SET",
                                category: "careerDetails",
                                field: "isSalaryNegotiable",
                                payload: !formState.careerDetails.isSalaryNegotiable
                              })}
                            />
                            <span className="slider round"></span>
                          </label>{" "}
                          <span style={{ color: "#414651" }}>Negotiable</span>
                        </div>
                      </div>


                      <div style={{ display: "flex", gap: "16px" }}>
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
                                category: "validationErrors",
                                field: "step1",
                                payload: true
                              });
                            }}
                            onCurrencyChange={(value) => dispatch({
                              type: "SET",
                              category: "careerDetails",
                              field: "salaryCurrency",
                              payload: value
                            })}
                            invalid={!formState.validationErrors.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.minSalary.trim()}
                          />
                          {!formState.validationErrors.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.minSalary.trim() && (
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
                                category: "validationErrors",
                                field: "step1",
                                payload: true
                              });
                            }}
                            onCurrencyChange={(value) => dispatch({
                              type: "SET",
                              category: "careerDetails",
                              field: "salaryCurrency",
                              payload: value
                            })}
                            invalid={!formState.validationErrors.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.maxSalary.trim()}
                          />
                          {!formState.validationErrors.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.maxSalary.trim() && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              Maximum salary is required
                            </span>
                          )}
                          {!formState.validationErrors.step1 && !formState.careerDetails.isSalaryNegotiable && formState.careerDetails.minSalary.trim() && formState.careerDetails.maxSalary.trim() && 
                           parseFloat(formState.careerDetails.minSalary.replace(/,/g, '')) > parseFloat(formState.careerDetails.maxSalary.replace(/,/g, '')) && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              Maximum salary must be greater than minimum salary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.stepFieldsContainer}>
                  <h2>2. Job Description</h2>

                  <div className={styles.fieldsWrapper}>
                    <RichTextEditor 
                      setText={(value: string) => dispatch({
                        type: "SET",
                        category: "careerDetails",
                        field: "jobDescription",
                        payload: value
                      })} 
                      text={formState.careerDetails.jobDescription} 
                    />
                    {!formState.validationErrors.step1 && !formState.careerDetails.jobDescription.trim() && (
                      <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                        Job description is required
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.stepFieldsContainer}>
                  <h2>3. Team Access</h2>

                  <div className={styles.fieldsWrapper}>
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
                  </div>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
                <div className={styles.stepFieldsContainer}>
                  <h2>1. CV Review &amp; Pre-screening</h2>

                  <div className={styles.fieldsWrapper} style={{ gap: "12px" }}>
                    <div className={styles.fieldGroup} style={{ gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#181d27", marginBottom: "4px" }}>CV Screening</div>
                        <span className={styles.fieldGroupDesc}>Jia automatically endorses candidates who meet the chosen criteria</span>
                      </div>

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
                    </div>

                    <hr className={styles.divider} />

                    <div className={styles.fieldGroup} style={{ gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <img src="/icons/spark.svg" alt="Tips icon" style={{ width: "19px", height: "19px", marginBottom: "5px" }} />
                          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#181d27", marginBottom: "4px" }}>
                            CV Secret Prompt{" "}
                            <span style={{ color: "#717680", fontWeight: "normal" }}>(optional)</span>{" "}
                            <img
                              alt="help-icon"
                              src="/icons/help-icon.svg"
                              style={{ marginBottom: "3px" }}
                              data-tooltip-id="cv-secret-prompt-tooltip"
                              data-tooltip-delay-show={0}
                              data-tooltip-html={secretPromptTooltip}
                            />
                          </div>
                        </div>

                        <span className={styles.fieldGroupDesc}>Secret Prompts give you extra control over Jia’s evaluation style, complementing her accurate assessment of requirements from the job description.</span>
                      </div>

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
                    </div>
                  </div>
                </div>

                {/* TODO: Pre-screening questions */}
                {/* <div className={styles.stepFieldsContainer}> */}
                {/* </div> */}
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
                <div className={styles.stepFieldsContainer}>
                  <h2>1. AI Interview Screening</h2>

                  <div className={styles.fieldsWrapper} style={{ gap: "12px" }}>
                    <div className={styles.fieldGroup} style={{ gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#181d27", marginBottom: "4px" }}>AI Interview Screening</div>
                        <span className={styles.fieldGroupDesc}>Jia automatically endorses candidates who meet the chosen criteria.</span>
                      </div>

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
                    </div>

                    <hr className={styles.divider} />

                     <div className={styles.fieldGroup} style={{ gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#181d27", marginBottom: "4px" }}>
                          Require Video on Interview
                        </div>
                        <span className={styles.fieldGroupDesc}>
                          Require candidates to keep their camera on. Recordings will appear on their analysis page.
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <img src="/icons/videocam.svg" alt="" />
                          <span className={styles.fieldGroupDesc} style={{ fontSize: "16px" }}>
                            Require Video Interview
                          </span>
                        </div>

                        <div className={styles.fieldGroupDesc} style={{ fontSize: "16px" }}>
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
                    </div>

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

                  </div>

                </div>

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
                      category: "validationErrors",
                      field: "step3",
                      payload: true
                    });
                  }} 
                  jobTitle={formState.careerDetails.jobTitle} 
                  description={formState.careerDetails.jobDescription}
                  showValidation={!formState.validationErrors.step3}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
                <div className={styles.stepFieldsContainer}>
                  <h2 style={{ padding: "4px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/iconsV3/chevronV2.svg" alt="chevron" style={{ width: "20px", height: "20px", transform: "rotate(90deg)", filter: "grayscale(100%) brightness(0.7) contrast(1.2)" }} />
                    Career Details &amp; Team Access
                  </h2>

                  <div className={`${styles.fieldsWrapper} ${styles.reviewFieldsGroup}`}>
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
                      <div className={styles.fieldLabel}>Job Description</div>
                      <div className={styles.fieldValue}>
                        {formState.careerDetails.jobDescription}
                      </div>
                    </div>

                    {/* TODO: Team access */}
                  </div>
                </div>

                <div className={styles.stepFieldsContainer}>
                  <h2 style={{ padding: "4px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/iconsV3/chevronV2.svg" alt="chevron" style={{ width: "20px", height: "20px", transform: "rotate(90deg)", filter: "grayscale(100%) brightness(0.7) contrast(1.2)" }} />
                    CV Review &amp; Pre-Screening Questions
                  </h2>
                  <div className={`${styles.fieldsWrapper} ${styles.reviewFieldsGroup}`}>
                    <div className={styles.reviewField}>
                      <div className={styles.fieldLabel}>CV Screening</div>
                      <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={formState.cvScreeningDetails.cvScreeningSetting} /> and above</div>
                    </div>
                  </div>
                </div>

                <div className={styles.stepFieldsContainer}>
                  <h2 style={{ padding: "4px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/iconsV3/chevronV2.svg" alt="chevron" style={{ width: "20px", height: "20px", transform: "rotate(90deg)", filter: "grayscale(100%) brightness(0.7) contrast(1.2)" }} />
                    AI Interview Setup
                  </h2>

                  <div className={`${styles.fieldsWrapper} ${styles.reviewFieldsGroup}`}>
                    <div className={styles.reviewField}>
                      <div className={styles.fieldLabel}>AI Interview Screening</div>
                      <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={formState.aiScreeningDetails.aiScreeningSetting} /> and above</div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div className={styles.reviewField} style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                      <div className={styles.fieldLabel}>Require Video on Interview</div>
                      <div className={styles.fieldValue}>{formState.aiScreeningDetails.isVideoInterviewRequired ? "Yes" : "No"}</div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div className={styles.reviewField}>
                      <div className={styles.fieldLabel}>
                        Interview Questions <span className={styles.countBadge}>
                          {formState.aiScreeningDetails.interviewQuestions.reduce((acc, group) => acc + group.questions.length, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
