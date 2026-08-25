import { NextResponse } from "next/server";

import { getHealth } from "@/lib/health";

// Always evaluated at request time so the timestamp reflects the actual call.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getHealth());
}
