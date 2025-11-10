import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { db } = await connectMongoDB();
    const { interviewID, preScreeningAnswers } = await request.json();

    if (!interviewID || !preScreeningAnswers) {
      return NextResponse.json(
        { error: "Interview ID and pre-screening answers are required" },
        { status: 400 }
      );
    }

    const interviewModel = db.collection("interviews");

    // Update the interview with pre-screening answers
    const result = await interviewModel.updateOne(
      { interviewID },
      { 
        $set: { 
          preScreeningAnswers,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Pre-screening answers saved successfully" 
    });
  } catch (error) {
    console.error("Error saving pre-screening answers:", error);
    return NextResponse.json(
      { error: "Failed to save pre-screening answers" },
      { status: 500 }
    );
  }
}
