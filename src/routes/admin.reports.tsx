import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AdminHeader } from "./admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSalesStats } from "@/lib/api";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

function Reports() {
  const { data = [] } = useQuery({ queryKey: ["salesStats"], queryFn: getSalesStats });
  const csv = () => {
    const body = ["Month,Orders,Items,Revenue", ...data.map((s) => `${s.id},${s.orders},${s.items},${s.revenue}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "monthly-sales.csv"; a.click();
  };
  return (
    <>
      <AdminHeader title="Sales reports"><Button variant="outline" onClick={csv} disabled={!data.length}>Download CSV</Button></AdminHeader>
      <div className="mb-6 h-72 rounded-md border bg-background p-4">
        {data.length ? (
          <ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="id" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(v: number) => formatINR(v)} /><Bar dataKey="revenue" fill="var(--color-primary)" /></BarChart></ResponsiveContainer>
        ) : <p className="text-sm text-muted-foreground">Sales figures appear here after the first paid order.</p>}
      </div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Orders</TableHead><TableHead>Items sold</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
          <TableBody>{[...data].reverse().map((s) => <TableRow key={s.id}><TableCell>{s.id}</TableCell><TableCell>{s.orders}</TableCell><TableCell>{s.items}</TableCell><TableCell>{formatINR(s.revenue)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </div>
    </>
  );
}
