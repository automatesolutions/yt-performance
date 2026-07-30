import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAuthConfigured } from "@/lib/auth";
import { filterAndSortCreatives, uniqueClients } from "@/lib/format";
import { getAllCreatives } from "@/lib/sheets";
import type { SortKey } from "@/lib/types";

export async function GET(request: Request) {
  if (isAuthConfigured()) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const client = searchParams.get("client") ?? "all";
  const minSpend = Number(searchParams.get("minSpend") ?? "0");
  const sort = (searchParams.get("sort") as SortKey) || "spend_30d";

  const { rows, source } = await getAllCreatives();
  const filtered = filterAndSortCreatives(rows, {
    client,
    minSpend: Number.isFinite(minSpend) ? minSpend : 0,
    sort,
  });

  return NextResponse.json({
    source,
    clients: uniqueClients(rows),
    rows: filtered,
  });
}
