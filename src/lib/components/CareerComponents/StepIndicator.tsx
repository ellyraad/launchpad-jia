import { validateStepStatus } from "@/lib/CareerFormUtils";
import { FormState, FormStep } from "@/lib/definitions";
import styles from "@/lib/styles/screens/careerForm.module.scss";
import { assetConstants } from "@/lib/utils/constantsV2";

interface Props {
  currentStep: number;
  formSteps: FormStep[];
  formState: FormState;
  handleClick: (stepIndex: number) => void;
}

export default function StepIndicator({
  currentStep,
  formSteps,
  formState,
  handleClick,
}: Props) {
  return (
    <div className={styles.topContainer}>
      <div className={styles.applicationStepContainer}>
        {formSteps.map((step, idx) => {
          const stepStatus = validateStepStatus(
            currentStep,
            idx,
            formState.careerDetails,
            formState.aiScreeningDetails.interviewQuestions,
            formState.isValid,
          )
          const isClickable = idx <= currentStep;

          return (
            <div className={styles.stepContainer} key={idx}>
              <div onClick={() => handleClick(idx)} style={{ cursor: isClickable ? "pointer" : "default" }}>
                <div className={styles.indicator}>
                  {stepStatus === "invalid" ? (
                    <img src={assetConstants.alertTriangle} alt="Warning" />
                  ) : (
                    <img src={stepStatus === "completed" ? assetConstants.completed : assetConstants.in_progress} alt="progress indicator" />
                  )}

                  {idx < formSteps.length - 1 && (
                    <hr className={`webView ${styles[stepStatus === "invalid" ? "in_progress" : stepStatus]}`} />
                  )}
                </div>

                <div className={styles.stepDetails}>
                  <div className={`webView ${styles.stepDescription} ${styles[stepStatus === "invalid" ? "in_progress" : stepStatus]}`}>
                    {step.title}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
