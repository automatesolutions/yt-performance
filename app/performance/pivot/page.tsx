import { PivotTable } from "@/components/PivotTable";
import { buildPivot } from "@/lib/format";
import { getAllCreatives } from "@/lib/sheets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PivotPage() {
  const { rows, source } = await getAllCreatives();
  const pivot = buildPivot(rows);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-[1.75rem] font-bold tracking-tight">
            Pivot
          </h1>
          <p className="mt-1 mb-0 text-sm text-[var(--muted)]">
            Client rollups — expand a row to see creatives.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs text-[var(--muted)]">
          {source === "fixture" ? "Demo data" : "Live Sheet"} · last synced 2h
          ago
        </Badge>
      </div>

      <Card className="surface-card overflow-hidden py-0">
        <CardContent className="px-0">
          <PivotTable rows={pivot} />
        </CardContent>
      </Card>
    </>
  );
}
