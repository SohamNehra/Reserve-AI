import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = getGoogleAuthUrl(userId);
  return NextResponse.json({ url });
}
