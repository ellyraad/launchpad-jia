import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { superAdminList } from "@/lib/SuperAdminUtils";

/**
 * Provisions super admin access by adding email to MongoDB admins collection
 * Only works for emails that are in the superAdminList
 */
export async function POST(req: Request) {
  const { email, name, image } = await req.json();

  // Validate email is in the superAdminList
  if (!superAdminList.includes(email)) {
    return NextResponse.json(
      { 
        error: "Email not in super admin whitelist",
        message: `${email} is not authorized for super admin access. Please add it to SuperAdminUtils.tsx first.`
      },
      { status: 403 }
    );
  }

  try {
    const { db } = await connectMongoDB();
    
    // Check if already exists
    const existingAdmin = await db.collection("admins").findOne({ email });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin already exists in database",
        admin: existingAdmin
      });
    }

    // Insert new admin
    const newAdmin = {
      email,
      name: name || email.split('@')[0],
      image: image || null,
      createdAt: new Date(),
      lastSeen: new Date(),
      role: "super_admin"
    };

    await db.collection("admins").insertOne(newAdmin);

    return NextResponse.json({
      success: true,
      message: "Super admin provisioned successfully",
      admin: newAdmin
    });

  } catch (error) {
    console.error("Error provisioning super admin:", error);
    return NextResponse.json(
      { 
        error: "Database error",
        message: error.message 
      },
      { status: 500 }
    );
  }
}
