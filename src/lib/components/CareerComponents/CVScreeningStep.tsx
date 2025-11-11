"use client";

import styles from "@/lib/styles/screens/careerForm.module.scss";
import CustomDropdownV2 from "@/lib/components/Dropdown/CustomDropdownV2";
import SalaryInput from "@/lib/components/CareerComponents/SalaryInput";
import SubstepContainer from "./SubstepContainer";
import SubstepFieldsGroup from "./SubstepFieldsGroup";
import {
  screeningSettingList,
  secretPromptTooltip,
  preScreeningQuestionTypes,
  suggestedPreScreeningQuestions,
} from "@/lib/CareerFormUtils";
import type { FormReducerAction, FormState } from "@/lib/definitions";
import { Dispatch } from "react";
import type { PreScreeningQuestionsHook } from "@/lib/hooks/usePreScreeningQuestions";

interface CareerFormStep1Props {
  formState: FormState;
  dispatch: Dispatch<FormReducerAction>;
  preScreeningHook: PreScreeningQuestionsHook;
}

export default function CVScreeningStep({ 
  formState, 
  dispatch, 
  preScreeningHook 
}: CareerFormStep1Props) {
  return (
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
          description="Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description."
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
                                value={psQuestion.preferredRange 
                                  ? String(psQuestion.preferredRange.min || "") 
                                  : ""}
                                currency={psQuestion.currency || "PHP"}
                                onValueChange={(value) => {
                                  const numValue = value ? parseFloat(value.replace(/,/g, '')) : 0;
                                  const currentRange = psQuestion.preferredRange || { min: 0, max: 0 };
                                  preScreeningHook.handleUpdateQuestion(psQuestion.id, "preferredRange", { ...currentRange, min: numValue });
                                }}
                                onCurrencyChange={(currency) => preScreeningHook.handleUpdateQuestion(psQuestion.id, "currency", currency)}
                              />
                            </div>

                            <div className={styles.field} style={{ flex: 1 }}>
                              <span className={styles.fieldLabel}>Maximum Salary</span>
                              <SalaryInput
                                value={psQuestion.preferredRange 
                                  ? String(psQuestion.preferredRange.max || "") 
                                  : ""}
                                currency={psQuestion.currency || "PHP"}
                                onValueChange={(value) => {
                                  const numValue = value ? parseFloat(value.replace(/,/g, '')) : 0;
                                  const currentRange = psQuestion.preferredRange || { min: 0, max: 0 };
                                  preScreeningHook.handleUpdateQuestion(psQuestion.id, "preferredRange", { ...currentRange, max: numValue });
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
                                  min="0"
                                  step="any"
                                  value={psQuestion.preferredRange 
                                    ? psQuestion.preferredRange.min 
                                    : ""}
                                  onChange={(e) => {
                                    const numValue = e.target.value ? parseFloat(e.target.value) : 0;
                                    const currentRange = psQuestion.preferredRange || { min: 0, max: 0 };
                                    preScreeningHook.handleUpdateQuestion(psQuestion.id, "preferredRange", { ...currentRange, min: numValue });
                                  }}
                                />
                              </div>

                              <div className={styles.field} style={{ flex: 1 }}>
                                <span className={styles.fieldLabel}>Maximum</span>
                                <input
                                  type="number"
                                  placeholder="Enter maximum value"
                                  style={{ padding: "10px 14px" }}
                                  min="0"
                                  step="any"
                                  value={psQuestion.preferredRange 
                                    ? psQuestion.preferredRange.max 
                                    : ""}
                                  onChange={(e) => {
                                    const numValue = e.target.value ? parseFloat(e.target.value) : 0;
                                    const currentRange = psQuestion.preferredRange || { min: 0, max: 0 };
                                    preScreeningHook.handleUpdateQuestion(psQuestion.id, "preferredRange", { ...currentRange, max: numValue });
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
                    color: isAdded ? "#12B76A" : "",
                    cursor: isAdded ? "not-allowed" : "pointer",
                    borderColor: isAdded ? "#A6F4C5" : ""
                  }}
                >
                  {isAdded ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
        </SubstepFieldsGroup>
      </SubstepContainer>
    </div>
  );
}
