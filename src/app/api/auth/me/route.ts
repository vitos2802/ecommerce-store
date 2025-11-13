import { NextResponse, NextRequest } from "next/server";
import { verifyUser } from "@/lib/auth/middleware";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user.userId,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
