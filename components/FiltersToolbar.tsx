"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FiltersToolbarProps = {
  clients: string[];
};

export function FiltersToolbar({ clients }: FiltersToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const client = searchParams.get("client") ?? "all";
  const sort = searchParams.get("sort") ?? "spend_30d";
  const minSpend = searchParams.get("minSpend") ?? "0";
  const q = searchParams.get("q") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const clear =
        !value ||
        value === "all" ||
        (key === "minSpend" && value === "0") ||
        (key === "sort" && value === "spend_30d") ||
        (key === "q" && value === "");

      if (clear) {
        if (key === "client" && (value === "all" || !value)) params.delete("client");
        else if (key === "minSpend" && (value === "0" || value === ""))
          params.delete("minSpend");
        else if (key === "sort" && value === "spend_30d") params.delete("sort");
        else if (key === "q" && !value) params.delete("q");
        else params.set(key, value);
      } else {
        params.set(key, value);
      }

      startTransition(() => {
        router.push(`/performance?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <div
      className={`flex flex-wrap items-center gap-2 transition-opacity ${pending ? "opacity-55" : "opacity-100"}`}
    >
      <div className="relative min-w-[220px] flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          ⌕
        </span>
        <Input
          type="search"
          placeholder="Search creative or client…"
          defaultValue={q}
          className="h-10 rounded-full border-[var(--border)] bg-white pl-8"
          onBlur={(e) => update("q", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
          aria-label="Search creatives"
        />
      </div>

      <select
        className="control h-10"
        value={client}
        onChange={(e) => update("client", e.target.value)}
        aria-label="Filter by client"
      >
        <option value="all">All clients</option>
        {clients.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="control h-10"
        value={sort}
        onChange={(e) => update("sort", e.target.value)}
        aria-label="Sort by"
      >
        <option value="spend_30d">Sort: Spend 30d</option>
        <option value="roas">Sort: ROAS</option>
        <option value="conversions">Sort: Conversions</option>
      </select>

      <Input
        type="number"
        min={0}
        step={1000}
        placeholder="Min $"
        defaultValue={minSpend === "0" ? "" : minSpend}
        className="h-10 w-28 rounded-full border-[var(--border)] bg-white text-center"
        onBlur={(e) => update("minSpend", e.target.value || "0")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            update("minSpend", (e.target as HTMLInputElement).value || "0");
          }
        }}
        aria-label="Minimum spend"
      />

      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full"
        onClick={() => {
          startTransition(() => {
            router.push("/performance");
          });
        }}
      >
        Reset
      </Button>
    </div>
  );
}
