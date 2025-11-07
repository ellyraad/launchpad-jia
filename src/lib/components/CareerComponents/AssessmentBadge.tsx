const assessmentType = {
  "Good Fit": {
    color: "#175CD3",
    bg: "#EFF8FF",
    border: "#B2DDFF",
  },
  "Bad Fit": {
    color: "#B32318",
    bg: "#FEF3F2",
    border: "#FECDCA",
  },
  "Strong Fit": {
    color: "#027948",
    bg: "#ECFDF3",
    border: "#A6F4C5",
  },
  "Maybe Fit": {
    color: "#363F72",
    bg: "#F8F9FC",
    border: "#D5D9EB",
  },
} as const;

type Props = {
  _type: keyof typeof assessmentType;
  className?: string;
};
export default function AssessmentBadge({ _type, className }: Props) {
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
      {_type}
    </span>
  )
}
