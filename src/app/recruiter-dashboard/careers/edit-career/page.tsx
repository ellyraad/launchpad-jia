"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CareerFormV2 from "@/lib/components/CareerComponents/CareerFormV2";

export default function EditCareerPage() {
    const searchParams = useSearchParams();
    const careerId = searchParams.get("careerId");
    const step = searchParams.get("step");

    return (
        <>
        <HeaderBar activeLink="Careers" currentPage="Edit career" icon="la la-suitcase" />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
          <div className="row">
            <CareerFormV2 formType="edit" careerId={careerId} initialStep={step ? parseInt(step) : undefined} />
          </div>
        </div>
      </>
    )
}
