import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import { sanitizeHTML } from "@/lib/utils/sanitize";

export async function POST(request: Request) {
  try {
    const {
      _id,
      jobTitle,
      description,
      questions,
      lastEditedBy,
      createdBy,
      screeningSetting,
      cvSecretPrompt,
      preScreeningQuestions,
      orgID,
      requireVideo,
      location,
      workSetup,
      workSetupRemarks,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      salaryCurrency,
      draftStep,
    } = await request.json();

    // For drafts, we only require orgID and at least a job title to start
    if (!orgID) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const now = new Date();
    
    // Sanitize description to prevent XSS attacks
    const sanitizedDescription = description ? sanitizeHTML(description) : "";
    
    // If _id exists, update existing draft
    if (_id) {
      const updateData = {
        jobTitle: jobTitle || "Untitled Career",
        description: sanitizedDescription,
        questions: questions || [],
        location: location || "",
        workSetup: workSetup || "",
        workSetupRemarks: workSetupRemarks || "",
        updatedAt: now,
        lastEditedBy,
        screeningSetting: screeningSetting || "",
        cvSecretPrompt: cvSecretPrompt || "",
        preScreeningQuestions: preScreeningQuestions || [],
        requireVideo: requireVideo !== undefined ? requireVideo : true,
        salaryNegotiable: salaryNegotiable !== undefined ? salaryNegotiable : false,
        minimumSalary: minimumSalary || null,
        maximumSalary: maximumSalary || null,
        salaryCurrency: salaryCurrency || "PHP",
        country: country || "",
        province: province || "",
        employmentType: employmentType || "",
        status: "draft",
        draft: true,
        draftStep: draftStep !== undefined ? draftStep : 0,
      };

      await db
        .collection("careers")
        .updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

      return NextResponse.json({
        message: "Draft updated successfully",
        careerId: _id,
        isNewDraft: false,
      });
    }

    // Create new draft
    const career = {
      id: guid(),
      jobTitle: jobTitle || "Untitled Career",
      description: sanitizedDescription,
      questions: questions || [],
      location: location || "",
      workSetup: workSetup || "",
      workSetupRemarks: workSetupRemarks || "",
      createdAt: now,
      updatedAt: now,
      lastEditedBy,
      createdBy,
      status: "draft",
      screeningSetting: screeningSetting || "",
      cvSecretPrompt: cvSecretPrompt || "",
      preScreeningQuestions: preScreeningQuestions || [],
      orgID,
      requireVideo: requireVideo !== undefined ? requireVideo : true,
      lastActivityAt: now,
      salaryNegotiable: salaryNegotiable !== undefined ? salaryNegotiable : false,
      minimumSalary: minimumSalary || null,
      maximumSalary: maximumSalary || null,
      salaryCurrency: salaryCurrency || "PHP",
      country: country || "",
      province: province || "",
      employmentType: employmentType || "",
      draft: true,
      draftStep: draftStep !== undefined ? draftStep : 0,
    };

    const result = await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Draft created successfully",
      careerId: result.insertedId.toString(),
      isNewDraft: true,
    });
  } catch (error) {
    console.error("Error saving career draft:", error);
    return NextResponse.json(
      { error: "Failed to save career draft" },
      { status: 500 }
    );
  }
}
