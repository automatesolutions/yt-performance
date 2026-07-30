import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { FIXTURE_CAMPAIGN_SPLITS } from "@/data/fixture";
import { authOptions, isAuthConfigured } from "@/lib/auth";
import { getCreativeByAssetId } from "@/lib/sheets";

type Params = { params: Promise<{ assetId: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (isAuthConfigured()) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { assetId } = await params;
  const creative = await getCreativeByAssetId(assetId);
  if (!creative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    creative,
    campaigns: FIXTURE_CAMPAIGN_SPLITS[assetId] ?? [],
  });
}
