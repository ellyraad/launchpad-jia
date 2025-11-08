"use client";

import "@/lib/styles/commonV2/globals.scss";

import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CareerFormProps } from "./CareerForm";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import CustomDropdownV2 from "@/lib/components/Dropdown/CustomDropdownV2";
import SalaryInput from "@/lib/components/CareerComponents/SalaryInput";
import RichTextEditor from "./RichTextEditor";
import AvatarImage from "../AvatarImage/AvatarImage";
import AssessmentBadge from "./AssessmentBadge";
import TipsBox from "./TipsBox";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";

export default function CareerFormV2({
  career,
  formType,
  setShowEditModal,
}: CareerFormProps) {
  const formSteps: { title: string; content?: React.ReactNode }[] = [
    {
      title: "Career Details & Team Access",
      content: (
        <>
          <p>
            <strong>Use clear, standard job titles</strong> for better searchability{" "}
            (e.g., “Software Engineer” instead of “Code Ninja” or “Tech Rockstar”).
          </p>
          <p>
            <strong>Avoid abbreviations</strong> or internal role codes that applicants may not{" "}
            understand (e.g., use “QA Engineer” instead of “QE II” or “QA-TL”).
          </p>
          <p>
            <strong>Keep it concise</strong> – job titles should be no more than a few words (2–4 max),{" "}
            avoiding fluff or marketing terms.
          </p>
        </>
      )
    },

    {
      title: "CV Review & Pre-screening",
      content: (
        <>
          <p>
            <strong>Add a secret prompt</strong> to fine-tune how Jia scores and evaluates submitted CV.
          </p>
          <p>
            <strong>Add pre-screening questions</strong> to collect key details such as notice period, work{" "}
            setup, or salary expectations to guide your review and candidate discussions.
          </p>
        </>
      )
    },

    {
      title: "AI Interview Setup",
      content: (
        <>
          <p>
            <strong>Add a secret prompt</strong> to fine-tune how Jia scores and evaluates the interview responses.
          </p>
          <p>
            <strong>Use &ldquo;Generate Questions&rdquo;</strong>to quickly create tailored interview questions,{" "}
            then refine or mix them with your own for balanced results. 
          </p>
        </>
      )
    },

    {
      title: "Review Center"
    }
  ];

  const screeningSettingList = [
    { name: "Good Fit and above", icon: "la la-check" },
    { name: "Only Strong Fit", icon: "la la-check-double" },
    { name: "No Automatic Promotion", icon: "la la-times" },
  ];

  const employmentTypeOptions = [
    { name: "Full-Time" },
    { name: "Part-Time" },
  ];

  const workArrangementOptions = [
    { name: "Fully Remote" },
    { name: "Onsite" },
    { name: "Hybrid" },
  ];

  const accessRolesOptions = [
    { name: "Job Owner" },
    { name: "Reviewer" },
    { name: "Contributor" },
  ];

  const [questions, setQuestions] = useState([
    {
      id: 1,
      category: "CV Validation / Experience",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 2,
      category: "Technical",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 3,
      category: "Behavioral",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 4,
      category: "Analytical",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 5,
      category: "Others",
      questionCountToAsk: null,
      questions: [],
    },
  ]);

  const secretPromptTooltip = "These prompts remain hidden from candidates and the public job portal.<br>Additionally, only Admins and the Job Owner can view the secret prompt.";

  const [currentStep, setCurrentStep] = useState<number>(0);

  // FIXME: should use the provided geo data
  const [country, setCountry] = useState<string>("Philippines"); // FIXME
  const [province, setProvince] = useState<string>(""); 
  const [city, setCity] = useState<string>("");

  const [jobTitle, setJobTitle] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("Full-Time");
  const [workArrangement, setWorkArrangement] = useState<string>("");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [salaryCurrency, setSalaryCurrency] = useState<string>("PHP");
  const [description, setDescription] = useState<string>("");
  const [accessRole, setAccessRole] = useState<string>();
  const [cvScreeningSetting, setCVScreeningSetting] = useState<string>(screeningSettingList[0].name);
  const [aiScreeningSetting, setAIScreeningSetting] = useState<string>(screeningSettingList[0].name);
  const [authorizedMember, setAuthorizedMember] = useState<string>("");

  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState<boolean>(false);
  const [isVideoInterviewRequired, setIsVideoInterviewRequired] = useState<boolean>(true);
  const [showStep1Validation, setShowStep1Validation] = useState<boolean>(false);
  const [showStep2Validation, setShowStep2Validation] = useState<boolean>(false);

  const validateStep1 = (): boolean => {
    const requiredFields = [
      jobTitle.trim(),
      employmentType,
      workArrangement,
      province,
      city,
      description.trim(),
    ];
    
    // Check all required fields are filled
    if (requiredFields.some(field => !field)) return false;
    
    // Check salary fields only if not negotiable
    if (!isSalaryNegotiable) {
      if (!minSalary.trim() || !maxSalary.trim()) return false;
      
      // Validate that min salary is not greater than max salary
      const min = parseFloat(minSalary.replace(/,/g, ''));
      const max = parseFloat(maxSalary.replace(/,/g, ''));
      if (!isNaN(min) && !isNaN(max) && min > max) return false;
    }
    
    return true;
  };

  const validateStep2 = (): boolean => {
    const totalQuestions = questions.reduce((acc, group) => acc + group.questions.length, 0);
    return totalQuestions >= 5;
  };

  const isStepValid = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      return validateStep1();
    }
    if (stepIndex === 2) {
      return validateStep2();
    }

    return true;
  };

  const getStepStatus = (stepIndex: number): "completed" | "in_progress" | "pending" | "invalid" => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) {
      if (stepIndex === 0 && showStep1Validation && !isStepValid(stepIndex)) return "invalid";
      if (stepIndex === 2 && showStep2Validation && !isStepValid(stepIndex)) return "invalid";
      return "in_progress";
    }
    return "pending";
  };

  const handleSaveAndContinue = () => {
    if (currentStep === 0) {
      if (!validateStep1()) {
        setShowStep1Validation(true);
        return;
      }
      setShowStep1Validation(false);
    }
    
    if (currentStep === 2) {
      if (!validateStep2()) {
        setShowStep2Validation(true);
        return;
      }
      setShowStep2Validation(false);
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
        setShowStep1Validation(false);
      }
      if (stepIndex === 2) {
        setShowStep2Validation(false);
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "35px", display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>
          {currentStep > 0 ? (
            <>
              <span style={{ color: "#717680" }}>[Draft]</span> {jobTitle}
            </>
          ) : <>Add new career</>}
        </h1>

        <div className={styles.buttonContainer}>
          <button className={`${styles.actionButton} ${styles.secondary} ${styles.disabled}`} disabled>
            Save as Unpublished
          </button>

          <button className={styles.actionButton} onClick={handleSaveAndContinue}>
            Save and Continue
            <img alt="arrow" src={assetConstants.arrow} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className={styles.topContainer}>
          <div className={styles.applicationStepContainer}>
            {formSteps.map((step, index) => {
              const stepStatus = getStepStatus(index);
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
                          value={jobTitle}
                          placeholder="Enter job title"
                          style={{ padding: "10px 14px" }}
                          onChange={(e) => setJobTitle(e.target.value)}
                          onFocus={() => setShowStep1Validation(false)}
                          className={showStep1Validation && !jobTitle.trim() ? styles.invalid : ""}
                        />
                        {showStep1Validation && !jobTitle.trim() && (
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
                            value={employmentType}
                            placeholder="Choose employment type"
                            options={employmentTypeOptions}
                            onValueChange={(value) => {
                              setEmploymentType(value);
                              setShowStep1Validation(false);
                            }}
                            invalid={showStep1Validation && !employmentType}
                          />
                          {showStep1Validation && !employmentType && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              Employment type is required
                            </span>
                          )}
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Arrangement</span>
                          <CustomDropdownV2
                            value={workArrangement}
                            placeholder="Choose work arrangement"
                            options={workArrangementOptions}
                            onValueChange={(value) => {
                              setWorkArrangement(value);
                              setShowStep1Validation(false);
                            }}
                            invalid={showStep1Validation && !workArrangement}
                          />
                          {showStep1Validation && !workArrangement && (
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
                            value={country}
                            options={[{ name: "Philippines" }]} // FIXME
                            onValueChange={setCountry}
                          />
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>State / Province</span>
                          <CustomDropdownV2
                            value={province}
                            placeholder="Choose state / province"
                            options={[{ name: "Metro Manila" }]} // FIXME
                            onValueChange={(value) => {
                              setProvince(value);
                              setShowStep1Validation(false);
                            }}
                            invalid={showStep1Validation && !province}
                          />
                          {showStep1Validation && !province && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              State / Province is required
                            </span>
                          )}
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>City</span>
                          <CustomDropdownV2
                            value={city}
                            placeholder="Choose city"
                            options={[{ name: "Quezon City" }]} // FIXME
                            onValueChange={(value) => {
                              setCity(value);
                              setShowStep1Validation(false);
                            }}
                            invalid={showStep1Validation && !city}
                          />
                          {showStep1Validation && !city && (
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
                              checked={isSalaryNegotiable}
                              onChange={() => setIsSalaryNegotiable(!isSalaryNegotiable)}
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
                            disabled={isSalaryNegotiable}
                            value={minSalary}
                            currency={salaryCurrency}
                            onValueChange={(value) => {
                              setMinSalary(value);
                              setShowStep1Validation(false);
                            }}
                            onCurrencyChange={setSalaryCurrency}
                            invalid={showStep1Validation && !isSalaryNegotiable && !minSalary.trim()}
                          />
                          {showStep1Validation && !isSalaryNegotiable && !minSalary.trim() && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              Minimum salary is required
                            </span>
                          )}
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Maximum Salary</span>
                          <SalaryInput
                            disabled={isSalaryNegotiable}
                            value={maxSalary}
                            currency={salaryCurrency}
                            onValueChange={(value) => {
                              setMaxSalary(value);
                              setShowStep1Validation(false);
                            }}
                            onCurrencyChange={setSalaryCurrency}
                            invalid={showStep1Validation && !isSalaryNegotiable && !maxSalary.trim()}
                          />
                          {showStep1Validation && !isSalaryNegotiable && !maxSalary.trim() && (
                            <span style={{ color: "#F04438", fontSize: "12px", marginTop: "4px" }}>
                              Maximum salary is required
                            </span>
                          )}
                          {showStep1Validation && !isSalaryNegotiable && minSalary.trim() && maxSalary.trim() && 
                           parseFloat(minSalary.replace(/,/g, '')) > parseFloat(maxSalary.replace(/,/g, '')) && (
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
                      setText={setDescription} 
                      text={description} 
                    />
                    {showStep1Validation && !description.trim() && (
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
                            value={authorizedMember}
                            placeholder="Add member"
                            options={[{ name:"John Doe" }]}
                            onValueChange={setAuthorizedMember}
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
                        value={cvScreeningSetting}
                        options={screeningSettingList}
                        onValueChange={setCVScreeningSetting}
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

                      <textarea placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)">
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
                        value={aiScreeningSetting}
                        options={screeningSettingList}
                        onValueChange={setAIScreeningSetting}
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
                              checked={isVideoInterviewRequired}
                              onChange={() => setIsVideoInterviewRequired(!isVideoInterviewRequired)}
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
                  questions={questions} 
                  setQuestions={(questions) => {
                    setQuestions(questions);
                    setShowStep2Validation(false);
                  }} 
                  jobTitle={jobTitle} 
                  description={description}
                  showValidation={showStep2Validation}
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
                      <div className={styles.fieldValue}>Software Engineer - Java</div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr 1fr", width: "100%" }}>
                      <div className={styles.reviewField} style={{ flex: "1" }}>
                        <div className={styles.fieldLabel}>Country</div>
                        <div className={styles.fieldValue}>Philippines</div>
                      </div>

                      <div className={styles.reviewField} style={{ flex: "1" }}>
                        <div className={styles.fieldLabel}>State / Province</div>
                        <div className={styles.fieldValue}>Metro Manila</div>
                      </div>

                      <div className={styles.reviewField} style={{ flex: "1" }}>
                        <div className={styles.fieldLabel}>City</div>
                        <div className={styles.fieldValue}>Pasig City</div>
                      </div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%" }}>
                      <div className={styles.reviewField}>
                        <div className={styles.fieldLabel}>Minimum Salary</div>
                        <div className={styles.fieldValue}>Negotiable</div>
                      </div>

                      <div className={styles.reviewField} style={{ gridColumn: "span 2" }}>
                        <div className={styles.fieldLabel}>Maximum Salary</div>
                        <div className={styles.fieldValue}>Negotiable</div>
                      </div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div className={styles.reviewField}>
                      <div className={styles.fieldLabel}>Job Description</div>
                      <div className={styles.fieldValue}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam error,
                        quasi deserunt rerum repellat impedit asperiores placeat temporibus excepturi
                        repellendus nam ullam saepe, tempore rem quis. Amet molestiae nisi atque.
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
                      <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={cvScreeningSetting} /> and above</div>
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
                      <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={aiScreeningSetting} /> and above</div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div className={styles.reviewField} style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                      <div className={styles.fieldLabel}>Require Video on Interview</div>
                      <div className={styles.fieldValue}>Yes</div>
                    </div>

                    <hr className={styles.groupDivider} />

                    <div className={styles.reviewField}>
                      <div className={styles.fieldLabel}>
                        Interview Questions <span className={styles.countBadge}>3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentStep !== formSteps.length - 1 && (
            <TipsBox>
              {formSteps[currentStep].content}
            </TipsBox>
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
