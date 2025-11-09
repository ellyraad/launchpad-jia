"use client"

import { useEffect, useState } from "react";
import { candidateActionToast } from "../../Utils";

export default function CareerLink(props: {career: any}) {
  const { career } = props;
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    let careerRedirection = "applicant";
    if (career.orgID === "682d3fc222462d03263b0881") {
      careerRedirection = "whitecloak";
    }
    setShareLink(`https://www.hellojia.ai/${careerRedirection}/job-openings/${career._id}`);
  }, [career]);

  return (
    <div className="layered-card-middle">
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8, paddingLeft: 12, paddingRight: 12 }}>
        <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Career Link</span>
      </div>
      {shareLink && <div className="layered-card-content">
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 10 }}>
          <input
            type="text"
            value={shareLink}
            readOnly={true}
            style={{ 
              border: "1px solid #E9EAEB", 
              background: "#FFFFFF", 
              padding: "10px 14px", 
              boxShadow: "none", 
              outline: "none",
              fontSize: "16px",
              fontWeight: 500,
              color: "#181D27",
              width: "100%",
              flex: 1,
              borderRadius: "8px"
            }}
          />
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            onClick={() => {
              navigator.clipboard.writeText(shareLink);
              candidateActionToast(
                "Career Link Copied to Clipboard",
                1300,
                <i className="la la-link mr-1 text-info"></i>
              );
            }}
          >
            <i className="la la-copy" style={{ fontSize: 20, color: "#535862" }}></i>
          </div>
        </div>
      </div>}
    </div>
  )
}
