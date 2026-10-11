import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "./admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { deleteCategory, listCategories, saveCategory, uploadImage } from "@/lib/api";

export const Route = createFileRoute("/admin/categories")({ component: Categories });

function Categories() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["adminCategories"], queryFn: () => listCategories(true) });
  const [name, setName] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["adminCategories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCategory({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), order: data.length, active: true });
    setName(""); toast.success("Category added"); refresh();
  };
  return (
    <>
      <AdminHeader title="Categories" />
      <form onSubmit={add} className="mb-6 flex max-w-md gap-2"><Input required placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} /><Button>Add</Button></form>
      <ul className="divide-y rounded-md border bg-background">
        {!data.length && <li className="p-4 text-sm text-muted-foreground">No categories yet. Try Bridal Wear, Sarees, Lehengas, Designer Wear.</li>}
        {data.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-4 p-4">
            <label className="h-16 w-12 shrink-0 cursor-pointer overflow-hidden bg-secondary" title="Upload image">
              {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-[10px]">Image</span>}
              <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; await saveCategory({ id: c.id, image: await uploadImage(f, "categories") }); refresh(); }} />
            </label>
            <span className="flex-1 font-medium">{c.name}</span>
            <Input type="number" aria-label="Display order" className="w-20" defaultValue={c.order} onBlur={async (e) => { await saveCategory({ id: c.id, order: Number(e.target.value) }); refresh(); }} />
            <Switch checked={c.active} aria-label="Visible" onCheckedChange={async (v) => { await saveCategory({ id: c.id, active: v }); refresh(); }} />
            <Button variant="ghost" size="sm" onClick={async () => { try { await deleteCategory(c.id); toast.success("Deleted"); refresh(); } catch (err) { toast.error((err as Error).message); } }}>Delete</Button>
          </li>
        ))}
      </ul>
    </>
  );
}
