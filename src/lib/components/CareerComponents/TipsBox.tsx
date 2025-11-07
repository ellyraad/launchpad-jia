import styles from "@/lib/styles/screens/careerForm.module.scss";

export default function TipsBox({ children }: { children?: React.ReactNode }) {
  return (
    <div className={styles.stepFieldsContainer} style={{ height: "fit-content" }}>
      <div>
        <h2 className={styles.tipsTitle}>
          <img src="/iconsV3/lightbulbV2.svg" alt="Tips icon" style={{ width: "19px", height: "19px" }} />
          Tips
        </h2>
      </div>

      <div className={`${styles.fieldsWrapper} ${styles.tipsContent}`}>
        {children}
      </div>
    </div>
  )
}
