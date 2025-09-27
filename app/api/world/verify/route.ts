import { NextRequest, NextResponse } from "next/server";
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { prisma } from "@/lib/prisma";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.WORLD_APP_ID as `app_${string}`;

    console.log("🔐 Backend verification request:", {
      action,
      signal,
      app_id: app_id ? `${app_id.slice(0, 10)}...` : "MISSING",
      nullifier: payload.nullifier_hash
        ? `${payload.nullifier_hash.slice(0, 10)}...`
        : "MISSING",
    });

    if (!app_id) {
      console.error("❌ WORLD_APP_ID not configured");
      return NextResponse.json(
        { error: "World App ID not configured" },
        { status: 500 }
      );
    }

    // Verify the proof with World ID
    console.log("🌐 Calling verifyCloudProof...");
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    )) as IVerifyResponse;

    console.log("🌐 verifyCloudProof result:", verifyRes);

    if (verifyRes.success) {
      console.log(
        "✅ World ID verification successful! Creating/updating user..."
      );

      // Create or update user with World ID verification
      const user = await prisma.user.upsert({
        where: { worldIdNullifier: payload.nullifier_hash },
        update: {
          worldIdVerified: true,
          verificationLevel: payload.verification_level,
          updatedAt: new Date(),
        },
        create: {
          worldIdNullifier: payload.nullifier_hash,
          worldIdVerified: true,
          verificationLevel: payload.verification_level,
        },
      });

      console.log("✅ User created/updated successfully:", {
        userId: user.id,
        verified: user.worldIdVerified,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          worldIdVerified: user.worldIdVerified,
          verificationLevel: user.verificationLevel,
        },
      });
    } else {
      // Handle verification failure (usually duplicate verification)
      console.error("❌ World ID verification failed:", verifyRes);
      return NextResponse.json(
        {
          success: false,
          error: verifyRes.detail || "Verification failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("World ID verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
