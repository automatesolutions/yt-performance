import { notFound } from "next/navigation";
import { CreativeDetail } from "@/components/CreativeDetail";
import { FIXTURE_CAMPAIGN_SPLITS } from "@/data/fixture";
import { getCreativeByAssetId } from "@/lib/sheets";

export const dynamic = "force-dynamic";

type Params = Promise<{ assetId: string }>;

export default async function CreativeDetailPage({
  params,
}: {
  params: Params;
}) {
  const { assetId } = await params;
  const creative = await getCreativeByAssetId(decodeURIComponent(assetId));
  if (!creative) notFound();

  const campaigns = FIXTURE_CAMPAIGN_SPLITS[creative.asset_id] ?? [];

  return <CreativeDetail creative={creative} campaigns={campaigns} />;
}
