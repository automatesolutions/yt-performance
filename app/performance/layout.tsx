import { AppShell } from "@/components/AppShell";
import { getAllCreatives } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function PerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { source } = await getAllCreatives();

  return <AppShell demo={source === "fixture"}>{children}</AppShell>;
}
