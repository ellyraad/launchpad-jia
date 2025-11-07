const assessmentType = {
  "Good Fit and above": {
    shortname: "Good Fit",
    color: "#175CD3",
    bg: "#EFF8FF",
    border: "#B2DDFF",
  },
  "No Automatic Promotion": {
    shortname: "Bad Fit",
    color: "#B32318",
    bg: "#FEF3F2",
    border: "#FECDCA",
  },
  "Only Strong Fit": {
    shortname: "Strong Fit",
    color: "#027948",
    bg: "#ECFDF3",
    border: "#A6F4C5",
  },
} as const;

export type AssessmentBadgeProps = {
  _type: keyof typeof assessmentType | string;
  className?: string;
};
export default function AssessmentBadge({ _type, className }: AssessmentBadgeProps) {
  return (
    <span className={`${className}`} style={{
      padding: "2px 10px",
      width: "fit-content",
      fontSize: "14px",
      fontWeight: "bold",
      color: assessmentType[_type].color,
      backgroundColor: assessmentType[_type].bg,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: assessmentType[_type].border,
      borderRadius: "16px"
    }}>
      {assessmentType[_type].shortname}
    </span>
  )
}
