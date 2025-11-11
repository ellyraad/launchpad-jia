"use client";

import styles from "@/lib/styles/screens/careerForm.module.scss";
import { assetConstants } from "@/lib/utils/constantsV2";
import CustomDropdownV2 from "@/lib/components/Dropdown/CustomDropdownV2";
import SalaryInput from "@/lib/components/CareerComponents/SalaryInput";
import RichTextEditor from "./RichTextEditor";
import AvatarImage from "../AvatarImage/AvatarImage";
import SubstepContainer from "./SubstepContainer";
import SubstepFieldsGroup from "./SubstepFieldsGroup";
import {
  employmentTypeOptions,
  workArrangementOptions,
  accessRolesOptions,
} from "@/lib/CareerFormUtils";
import type { FormReducerAction, FormState } from "@/lib/definitions";
import { Dispatch, useState, useMemo } from "react";
import { getCountries, getProvinces, getCitiesByProvince } from "@/lib/utils/locations";
import FieldErrorMessage from "./FieldErrorMessage";

interface CareerFormStep0Props {
  formState: FormState;
  dispatch: Dispatch<FormReducerAction>;
}

export default function CareerFormStep0({ formState, dispatch }: CareerFormStep0Props) {
  const [accessRole, setAccessRole] = useState("Job Owner");

  // Get location options
  const countries = useMemo(() => getCountries(), []);
  const provinces = useMemo(() => getProvinces(), []);
  const cities = useMemo(() => {
    if (!formState.careerDetails.state) {
      return [];
    }
    return getCitiesByProvince(formState.careerDetails.state);
  }, [formState.careerDetails.state]);

  return (
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
            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.jobTitle.trim()} />
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
            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.employmentType} />
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
            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.workArrangement} />
          </div>
        </SubstepFieldsGroup>

        <SubstepFieldsGroup title="Location">
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Country</span>
            <CustomDropdownV2
              value={formState.careerDetails.country}
              options={countries}
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
              options={provinces}
              onValueChange={(value) => {
                dispatch({
                  type: "SET",
                  category: "careerDetails",
                  field: "state",
                  payload: value
                });
                // Clear city when province changes
                dispatch({
                  type: "SET",
                  category: "careerDetails",
                  field: "city",
                  payload: ""
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

            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.state} />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>City</span>
            <CustomDropdownV2
              value={formState.careerDetails.city}
              placeholder="Choose city"
              options={cities}
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

            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.city} />
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

            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.minSalary.trim()} />
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

            <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.isSalaryNegotiable && !formState.careerDetails.maxSalary.trim()} />

            <FieldErrorMessage
              isInvalid={
                formState.isValid.step1 &&
                  !formState.careerDetails.isSalaryNegotiable &&
                  formState.careerDetails.minSalary.trim() &&
                  formState.careerDetails.maxSalary.trim() &&
                  parseFloat(formState.careerDetails.minSalary.replace(/,/g, '')) > parseFloat(formState.careerDetails.maxSalary.replace(/,/g, ''))
              }
            />
          </div>
        </SubstepFieldsGroup>
      </SubstepContainer>

      <SubstepContainer stepNum={2} title="Job Description" style={{ gap: "8px" }}>
        <RichTextEditor 
          setText={(value: string) => {
            dispatch({
              type: "SET",
              category: "careerDetails",
              field: "jobDescription",
              payload: value
            });
            dispatch({
              type: "SET",
              category: "isValid",
              field: "step1",
              payload: false
            });
          }} 
          text={formState.careerDetails.jobDescription}
          invalid={formState.isValid.step1 && !formState.careerDetails.jobDescription.trim()}
        />

        <FieldErrorMessage isInvalid={formState.isValid.step1 && !formState.careerDetails.jobDescription.trim()} />
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
  );
}
