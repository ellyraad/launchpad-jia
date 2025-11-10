export default function CareerStatus({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          bgColor: "#ECFDF3",
          borderColor: "#A6F4C5",
          dotColor: "#12B76A",
          textColor: "#027948",
          label: "Published"
        };
      case "draft":
        return {
          bgColor: "#F9FAFB",
          borderColor: "#D0D5DD",
          dotColor: "#98A2B3",
          textColor: "#475467",
          label: "Draft"
        };
      default: // inactive
        return {
          bgColor: "#F5F5F5",
          borderColor: "#E9EAEB",
          dotColor: "#717680",
          textColor: "#414651",
          label: "Unpublished"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div style={{ 
      borderRadius: "60px", 
      display: "flex", 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: "5px", 
      padding: "0px 8px", 
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: config.dotColor }}></div>
      <span style={{ fontSize: "12px", fontWeight: 700, color: config.textColor }}>
        {config.label}
      </span>
    </div>
  )
}
