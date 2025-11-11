"use client";

import styles from "@/lib/styles/screens/careerForm.module.scss";
import CustomDropdownV2 from "@/lib/components/Dropdown/CustomDropdownV2";
import SubstepContainer from "./SubstepContainer";
import SubstepFieldsGroup from "./SubstepFieldsGroup";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import { screeningSettingList, secretPromptTooltip } from "@/lib/CareerFormUtils";
import type { FormReducerAction, FormState } from "@/lib/definitions";
import { Dispatch } from "react";

interface CareerFormStep2Props {
  formState: FormState;
  dispatch: Dispatch<FormReducerAction>;
}

export default function AIInterviewSetupStep({ formState, dispatch }: CareerFormStep2Props) {
  return (
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

            <span className={styles.fieldGroupDesc}>Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.</span>
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
  );
}
