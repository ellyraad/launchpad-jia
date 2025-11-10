"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CareerForm from "@/lib/components/CareerComponents/CareerForm"; // FIXME: delete after completing V2
import CareerFormV2 from "@/lib/components/CareerComponents/CareerFormV2";

export default function NewCareerPage() {
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draftId");

    return (
        <>
        <HeaderBar activeLink="Careers" currentPage="Add new career" icon="la la-suitcase" />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
          <div className="row">
            <CareerFormV2 formType="add" draftId={draftId} />
            {/*<CareerForm formType="add" />*/}
          </div>
        </div>
      </>
    )
}
