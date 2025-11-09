"use client";

import styles from "@/lib/styles/screens/careerForm.module.scss";
import SubstepContainer from "./SubstepContainer";
import AssessmentBadge from "./AssessmentBadge";
import type { FormState } from "@/lib/definitions";

interface CareerFormStep3Props {
  formState: FormState;
  collapsedSections: {
    careerDetails: boolean;
    cvScreening: boolean;
    aiInterview: boolean;
  };
  toggleSection: (section: 'careerDetails' | 'cvScreening' | 'aiInterview') => void;
}

export default function CareerFormStep3({ 
  formState, 
  collapsedSections, 
  toggleSection 
}: CareerFormStep3Props) {
  return (
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
  );
}
