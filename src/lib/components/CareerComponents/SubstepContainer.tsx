import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CSSProperties, MouseEventHandler } from "react";

interface Props {
  stepNum?: number;
  title: string;
  optional?: boolean;
  count?: number;
  headingBtn?: React.ReactNode;
  style?: CSSProperties;
  handleHeadingClick?: MouseEventHandler;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function SubstepContainer({
  stepNum,
  title,
  optional,
  count,
  headingBtn,
  style,
  handleHeadingClick,
  isCollapsible,
  isCollapsed,
  className,
  children,
}: Props) {
  return (
    <div className={styles.stepFieldsContainer}>
      <div className={styles.subStepHeading} onClick={handleHeadingClick}>
        <h2 className={isCollapsible ? styles.subStepCollapsibleHeading : ""}>
          {isCollapsible && (
            <img
              src="/iconsV3/chevronV2.svg"
              alt="chevron"
              style={{
                width: "20px",
                height: "20px", 
                transform: isCollapsed ? "rotate(-90deg)" : "rotate(90deg)", 
                filter: "grayscale(100%) brightness(0.7) contrast(1.2)",
                transition: "transform 0.2s ease"
              }}
            />
          )}
          {stepNum && `${stepNum}. `}{title}{" "}
          {optional && (
            <span style={{ color: "#717680", fontWeight: "normal" }}>(optional)</span>
          )}{" "}
          {count >= 0 && (
            <span className={styles.countBadge}>
              {count}
            </span>
          )}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isCollapsible && (
            <div className={styles.editIconCircle}>
              <img
                src="/iconsV3/edit.svg"
                alt="edit"
                className={styles.editIcon}
              />
            </div>
          )}
          {headingBtn}
        </div>
      </div>

      {!isCollapsed && (
        <div className={`${styles.fieldsWrapper} ${className}`} style={style}>
          {children}
        </div>
      )}
    </div>
  );
}
