import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    let requestData = await request.json();
    const { _id, orgID, status, draft } = requestData;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { error: "Job Object ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Check if we're promoting a draft to published (status: active and draft: false)
    if (status === "active" && draft === false) {
      // Get the current career to check if it's a draft
      const currentCareer = await db.collection("careers").findOne({ _id: new ObjectId(_id) });
      
      // Only check job limits if converting from draft to published
      if (currentCareer?.draft === true) {
        // Check organization job limits
        const orgDetails = await db.collection("organizations").aggregate([
          {
            $match: {
              _id: new ObjectId(orgID)
            }
          },
          {
            $lookup: {
              from: "organization-plans",
              let: { planId: "$planId" },
              pipeline: [
                {
                  $addFields: {
                    _id: { $toString: "$_id" }
                  }
                },
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$planId"] }
                  }
                }
              ],
              as: "plan"
            }
          },
          {
            $unwind: "$plan"
          },
        ]).toArray();

        if (!orgDetails || orgDetails.length === 0) {
          return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const totalActiveCareers = await db.collection("careers").countDocuments({ 
          orgID, 
          status: "active",
          $or: [
            { draft: { $exists: false } },
            { draft: false }
          ]
        });

        if (totalActiveCareers >= (orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0))) {
          return NextResponse.json({ 
            error: "You have reached the maximum number of jobs for your plan. Please upgrade your plan to publish this career." 
          }, { status: 400 });
        }
      }
    }

    let dataUpdates = { ...requestData };

    delete dataUpdates._id;

    const career = {
      ...dataUpdates,
      updatedAt: new Date(),
    };

    await db
      .collection("careers")
      .updateOne({ _id: new ObjectId(_id) }, { $set: career });

    return NextResponse.json({
      message: "Career updated successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
