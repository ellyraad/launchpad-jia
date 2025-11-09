import { ToolTip } from "@/lib/definitions";
import styles from "@/lib/styles/screens/careerForm.module.scss";

export default function TipsBox({ tips }: { tips: ToolTip[] }) {
  return (
    <div className={styles.stepFieldsContainer} style={{ height: "fit-content" }}>
      <div>
        <h2 className={styles.tipsTitle}>
          <img src="/iconsV3/lightbulbV2.svg" alt="Tips icon" style={{ width: "19px", height: "19px" }} />
          Tips
        </h2>
      </div>

      <div className={`${styles.fieldsWrapper} ${styles.tipsContent}`}>
        {tips.map(t => (
          <p key={t.highlightText}>
            <strong>{t.highlightText}</strong> {t.restOfText}
          </p>
        ))}
      </div>
    </div>
  )
}
