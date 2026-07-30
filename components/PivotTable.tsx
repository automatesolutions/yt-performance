"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  clientInitials,
  formatCurrency,
  formatNumber,
  formatRoas,
} from "@/lib/format";
import type { PivotClientRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PivotTableProps = {
  rows: PivotClientRow[];
};

export function PivotTable({ rows }: PivotTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--muted)]">
        No pivot data available.
      </p>
    );
  }

  return (
    <div>
      <Table className="data-table">
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="num-col">Creatives</TableHead>
            <TableHead className="num-col">Spend 30d</TableHead>
            <TableHead className="num-col">Conversions</TableHead>
            <TableHead className="num-col">Conv value</TableHead>
            <TableHead className="num-col">ROAS*</TableHead>
            <TableHead className="num-col">Views</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const open = expanded[row.client_name];
            return (
              <Fragment key={row.client_name}>
                <TableRow>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto px-0 py-1 text-left hover:bg-transparent"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [row.client_name]: !prev[row.client_name],
                        }))
                      }
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
                        {clientInitials(row.client_name)}
                      </span>
                      <span>
                        <span className="block font-semibold text-[var(--text)]">
                          <span className="mr-1.5 text-[var(--muted)]">
                            {open ? "▾" : "▸"}
                          </span>
                          {row.client_name}
                        </span>
                      </span>
                    </Button>
                  </TableCell>
                  <TableCell className="num num-col">{row.creatives}</TableCell>
                  <TableCell className="num num-col font-medium">
                    {formatCurrency(row.spend_30d)}
                  </TableCell>
                  <TableCell className="num num-col">
                    {formatNumber(row.conversions)}
                  </TableCell>
                  <TableCell className="num num-col">
                    {formatCurrency(row.conv_value)}
                  </TableCell>
                  <TableCell className="num-col">
                    <Badge
                      className={`roas-pill ${row.roas >= 1 ? "good" : "weak"}`}
                    >
                      {formatRoas(row.roas)}
                    </Badge>
                  </TableCell>
                  <TableCell className="num num-col text-[var(--muted)]">
                    {formatNumber(row.views)}
                  </TableCell>
                </TableRow>
                {open &&
                  row.children.map((child) => (
                    <TableRow key={`${row.client_name}-${child.asset_id}`}>
                      <TableCell colSpan={2} className="pl-14">
                        <Button
                          variant="link"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/performance/${encodeURIComponent(child.asset_id)}`}
                            />
                          }
                          className="h-auto p-0 font-semibold text-[var(--accent)]"
                        >
                          {child.ad_name}
                        </Button>
                      </TableCell>
                      <TableCell className="num num-col">
                        {formatCurrency(child.spend_30d)}
                      </TableCell>
                      <TableCell className="num num-col">
                        {formatNumber(child.conversions)}
                      </TableCell>
                      <TableCell className="num-col text-[var(--muted)]">
                        —
                      </TableCell>
                      <TableCell className="num-col">
                        <Badge
                          className={`roas-pill ${child.roas >= 1 ? "good" : "weak"}`}
                        >
                          {formatRoas(child.roas)}
                        </Badge>
                      </TableCell>
                      <TableCell className="num-col text-[var(--muted)]">
                        —
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      <p className="px-4 pb-4 text-xs text-[var(--muted)]">
        *ROAS = total conv value ÷ total spend
      </p>
    </div>
  );
}
