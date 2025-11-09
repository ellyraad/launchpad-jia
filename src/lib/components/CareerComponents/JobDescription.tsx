"use client";
import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { useAppContext } from "../../context/AppContext";
import DirectInterviewLinkV2 from "./DirectInterviewLinkV2";
import CareerLink from "./CareerLink";
import styles from "../../styles/screens/careerForm.module.scss";
import AssessmentBadge from "./AssessmentBadge";

interface Props {
  formData: any,
  setFormData(formData: any): void;
}

export default function JobDescription({ formData, setFormData }: Props) {
  const { user } = useAppContext();

  async function deleteCareer() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Deleting career...",
            text: "Please wait while we delete the career...",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
          });

          try {
            const response = await axios.post("/api/delete-career", {
              id: formData._id,
            });

            if (response.data.success) {
              Swal.fire({
                title: "Deleted!",
                text: "The career has been deleted.",
                icon: "success",
                allowOutsideClick: false,
              }).then(() => {
                  window.location.href = "/recruiter-dashboard/careers";
                });
            } else {
              Swal.fire({
                title: "Error!",
                text: response.data.error || "Failed to delete the career",
                icon: "error",
              });
            }
          } catch (error) {
            console.error("Error deleting career:", error);
            Swal.fire({
              title: "Error!",
              text: "An error occurred while deleting the career",
              icon: "error",
            });
          }
        }
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
      <div className="thread-set">
        <div className="left-thread">
          <div className={styles.stepFieldsContainer}>
            <div className={styles.subStepHeading}>
              <h2 className={styles.subStepCollapsibleHeading}>
                <img
                  src="/iconsV3/chevronV2.svg"
                  alt="chevron"
                  style={{
                    width: "20px",
                    height: "20px", 
                    transform: "rotate(90deg)", 
                    filter: "grayscale(100%) brightness(0.7) contrast(1.2)",
                    transition: "transform 0.2s ease"
                  }}
                />
                Career Information
              </h2>
            </div>

            <div className={`${styles.fieldsWrapper} ${styles.reviewFieldsGroup}`}>
              <div className={styles.reviewField}>
                <div className={styles.fieldLabel}>Job Title</div>
                <div className={styles.fieldValue}>{formData.jobTitle}</div>
              </div>

              <hr className={styles.groupDivider} />

              <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr 1fr", width: "100%" }}>
                <div className={styles.reviewField} style={{ flex: "1" }}>
                  <div className={styles.fieldLabel}>Country</div>
                  <div className={styles.fieldValue}>Philippines</div>
                </div>

                <div className={styles.reviewField} style={{ flex: "1" }}>
                  <div className={styles.fieldLabel}>State / Province</div>
                  <div className={styles.fieldValue}>{formData.province || "-"}</div>
                </div>

                <div className={styles.reviewField} style={{ flex: "1" }}>
                  <div className={styles.fieldLabel}>City</div>
                  <div className={styles.fieldValue}>{formData.location || "-"}</div>
                </div>
              </div>

              <hr className={styles.groupDivider} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%" }}>
                <div className={styles.reviewField}>
                  <div className={styles.fieldLabel}>Minimum Salary</div>
                  <div className={styles.fieldValue}>
                    {formData.salaryNegotiable 
                      ? "Negotiable" 
                      : (formData.minimumSalary || "-")}
                  </div>
                </div>

                <div className={styles.reviewField} style={{ gridColumn: "span 2" }}>
                  <div className={styles.fieldLabel}>Maximum Salary</div>
                  <div className={styles.fieldValue}>
                    {formData.salaryNegotiable 
                      ? "Negotiable" 
                      : (formData.maximumSalary || "-")}
                  </div>
                </div>
              </div>

              <hr className={styles.groupDivider} />

              <div className={styles.reviewField}>
                <div className={styles.fieldLabel} style={{ marginBottom: "8px" }}>Job Description</div>
                <div 
                  className={styles.fieldValue}
                  dangerouslySetInnerHTML={{ __html: formData.description }}
                />
              </div>
            </div>
          </div>

          <div className={styles.stepFieldsContainer}>
            <div className={styles.subStepHeading}>
              <h2 className={styles.subStepCollapsibleHeading}>
                <img
                  src="/iconsV3/chevronV2.svg"
                  alt="chevron"
                  style={{
                    width: "20px",
                    height: "20px", 
                    transform: "rotate(90deg)", 
                    filter: "grayscale(100%) brightness(0.7) contrast(1.2)",
                    transition: "transform 0.2s ease"
                  }}
                />
                CV Review & Pre-Screening Questions
              </h2>
            </div>

            <div className={`${styles.fieldsWrapper} ${styles.reviewFieldsGroup}`}>
              <div className={styles.reviewField}>
                <div className={styles.fieldLabel}>CV Screening</div>
                <div className={styles.fieldValue}>Automatically endorse candidates who are <AssessmentBadge _type={formData.screeningSetting} /> and above</div>
              </div>

              {formData.cvSecretPrompt && (
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
                      {formData.cvSecretPrompt}
                    </div>
                  </div>
                </>
              )}

              {formData.preScreeningQuestions && formData.preScreeningQuestions.length > 0 && (
                <>
                  <hr className={styles.groupDivider} />

                  <div className={`${styles.reviewField} `}>
                    <div className={styles.fieldLabel}>
                      Pre-Screening Questions <span className={styles.countBadge}>
                        {formData.preScreeningQuestions.length}
                      </span>
                    </div>

                    <ol className={`${styles.questionList} ${styles.psQuestion}`} style={{ marginTop: "8px" }}>
                      {formData.preScreeningQuestions.map((question, idx) => (
                        <li key={question.id || idx} style={{ marginBottom: "8px" }}>
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
                          {question.questionType === "range" && question.preferredRange && (
                            <ul>
                              <li>
                                Preferred: {question.currency || formData.salaryCurrency} {question.preferredRange.min.toLocaleString()} - {question.currency || formData.salaryCurrency} {question.preferredRange.max.toLocaleString()}
                              </li>
                            </ul>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.stepFieldsContainer}>
            <div className={styles.subStepHeading}>
              <h2 className={styles.subStepCollapsibleHeading}>
                <img
                  src="/iconsV3/chevronV2.svg"
                  alt="chevron"
                  style={{
                    width: "20px",
                    height: "20px", 
                    transform: "rotate(90deg)", 
                    filter: "grayscale(100%) brightness(0.7) contrast(1.2)",
                    transition: "transform 0.2s ease"
                  }}
                />
                AI Interview Setup
              </h2>
            </div>

            <div className={`${styles.fieldsWrapper} ${styles.reviewFieldsGroup}`}>
              <div className={styles.reviewField}>
                <div className={styles.fieldLabel}>AI Interview Screening</div>
                <div className={styles.fieldValue}>
                  Automatically endorse candidates who are <AssessmentBadge _type={formData.screeningSetting} /> and above
                </div>
              </div>

              <hr className={styles.groupDivider} />

              <div className={styles.reviewField} style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                <div className={styles.fieldLabel}>Require Video on Interview</div>
                <div className={styles.fieldValue} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {formData.requireVideo ? "Yes" : "No"}
                  <img 
                    src={formData.requireVideo ? "/icons/checkV3-green.svg" : "/icons/circle-x.svg"} 
                    alt={formData.requireVideo ? "check" : "x"} 
                    style={{ width: "18px", height: "18px" }} 
                  />
                </div>
              </div>

              <hr className={styles.groupDivider} />

              <div className={styles.reviewField}>
                <div className={styles.fieldLabel}>
                  Interview Questions <span className={styles.countBadge}>
                    {formData.questions.reduce((acc, group) => acc + group.questions.length, 0)}
                  </span>
                </div>

                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(() => {
                    let cumulativeCount = 0;
                    return formData.questions
                      .filter((categ: any) => categ.questions.length > 0)
                      .map((categ: any) => {
                        const startNumber = cumulativeCount + 1;
                        cumulativeCount += categ.questions.length;

                        return (
                          <div key={categ.id || categ.category}>
                            <div className={styles.questionCateg}>{categ.category}</div>

                            <ol className={styles.questionList} start={startNumber}>
                              {categ.questions.map((q: any) => (
                                <li key={q.id || q.question}>{q.question}</li>
                              ))}
                            </ol>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-thread">
          <CareerLink career={formData} />
          {/* Card for direct interview link */}
          <DirectInterviewLinkV2 formData={formData} setFormData={setFormData} />
          <div className="layered-card-middle">
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8, paddingLeft: 12, paddingRight: 12 }}>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Advanced Settings</span>
            </div>
            <div className="layered-card-content">
              <button 
                onClick={() => {
                  deleteCareer();
                }}
                style={{ color: "#B32318", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FEF3F2", border: "1px solid #FEF3F2", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 }}>
                <i className="la la-trash" style={{ color: "#B32318", fontSize: 16 }}></i>
                <span>Delete this career</span>
              </button>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#717680", textAlign: "center" }}>Be careful, this action cannot be undone.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreeningSettingButton(props) {
  const { onSelectSetting, screeningSetting } = props;

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Setting List icons
  const settingList = [
    {
      name: "Good Fit and above",
      icon: "la la-check",
    },
    {
      name: "Only Strong Fit",
      icon: "la la-check-double",
    },
    {
      name: "No Automatic Promotion",
      icon: "la la-times",
    },
  ];

  return (
    <div className="dropdown w-100">
      <button
        className="dropdown-btn fade-in-bottom"
        style={{ width: "100%" }}
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
      >
        <span>
          <i
            className={
              settingList.find(
                (setting) => setting.name === screeningSetting
              )?.icon
            }
          ></i>{" "}
          {screeningSetting}
        </span>
        <i className="la la-angle-down ml-10"></i>
      </button>

      <div
        className={`dropdown-menu w-100 mt-1 org-dropdown-anim${dropdownOpen ? " show" : ""}`}
        style={{ padding: "10px" }}
      >
        {settingList.map((setting, index) => (
          <div style={{ borderBottom: "1px solid #ddd" }} key={index}>
            <button
              className={`dropdown-item d-flex align-items-center${screeningSetting === setting.name ? " bg-primary text-white active-org" : ""}`}
              style={{
                minWidth: 220,
                borderRadius: screeningSetting === setting.name ? 0 : 10,
                overflow: "hidden",
                paddingBottom: 10,
                paddingTop: 10,
              }}
              onClick={() => {
                onSelectSetting(setting.name);
                setDropdownOpen(false);
              }}
            >
              <i className={setting.icon}></i> {setting.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
