import styles from "@/lib/styles/screens/careerForm.module.scss";
import { ChangeEventHandler, CSSProperties } from "react";

interface Props {
  title?: string;
  hasSwitch?: boolean;
  description?: string;
  switchLabel?: string;
  isChecked?: boolean;
  handleSwitch?: ChangeEventHandler;
  optional?: boolean;
  tooltipId?: string;
  tooltip?: string;
  containerStyle?: CSSProperties;
  style?: CSSProperties;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function SubstepFieldsGroup({
  title,
  children,
  description,
  hasSwitch,
  icon,
  optional,
  tooltipId,
  tooltip,
  switchLabel,
  isChecked,
  containerStyle,
  style,
  handleSwitch,
}: Props) {
  return (
    <div className={styles.fieldsGroup} style={containerStyle}>
      {description ? (
        <div style={{ marginBottom: "16px" }}>
          <div style={(icon) && { display: "flex", gap: "8px", alignItems: "center" }}>
            {icon}
            <div className={styles.substepFieldGroupTitle}>
              {title}{" "}
              {optional && (
                <>
                  <span style={{ color: "#717680", fontWeight: "normal" }}>
                    (optional)
                  </span>{" "}
                </>
              )}
              {tooltip && (
                <img
                  src="/icons/help-icon.svg"
                  alt="help-icon"
                  style={{ marginBottom: "3px" }}
                  data-tooltip-id={tooltipId}
                  data-tooltip-delay-show={0}
                  data-tooltip-html={tooltip}
                />
              )}
            </div>
          </div>
          <span className={styles.fieldGroupDesc}>{description}</span>
        </div>
      ) : (
          <div style={hasSwitch && { display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>{title}</h3>

            {hasSwitch && (
              <div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleSwitch}
                  />
                  <span className="slider round" />
                </label>{" "}
                <span style={{ color: "#414651" }}>{switchLabel}</span>
              </div>
            )}
          </div>
      )}


      <div style={style || { display: "flex", gap: "16px" }}>
        {children}
      </div>
    </div>
  );
}
