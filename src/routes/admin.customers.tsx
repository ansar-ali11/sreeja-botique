import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "./admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCustomers } from "@/lib/api";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

function Customers() {
  const { data = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: listCustomers });
  return (
    <>
      <AdminHeader title="Customers" />
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Total spent</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>}
            {!isLoading && !data.length && <TableRow><TableCell colSpan={4} className="text-muted-foreground">No customers yet.</TableCell></TableRow>}
            {data.map((c) => {
              const x = c as typeof c & { orderCount?: number; totalSpent?: number };
              return <TableRow key={c.id}><TableCell>{c.name || "—"}</TableCell><TableCell>{c.email}</TableCell><TableCell>{x.orderCount ?? 0}</TableCell><TableCell>₹{(x.totalSpent ?? 0).toLocaleString("en-IN")}</TableCell></TableRow>;
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
