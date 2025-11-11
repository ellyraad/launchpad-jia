import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CSSProperties } from "react";

export default function FieldErrorMessage({
  isInvalid,
  message = "This is a required field.",
  className,
  style,
}: { isInvalid: boolean, message?: string, className?: string, style?: CSSProperties }) {
  if (!isInvalid) return null;

  return (
    <span style={style} className={`${className} ${styles.fieldError}`}>
      {message}
    </span>
  )
}
