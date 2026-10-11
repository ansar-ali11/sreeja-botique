import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "./admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings } from "@/lib/api";
import { DEFAULT_SETTINGS, type StoreSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const FIELDS: [keyof StoreSettings, string, "text" | "number"][] = [
  ["storeName", "Store name", "text"], ["phone", "Phone", "text"], ["whatsapp", "WhatsApp number (with 91, digits only)", "text"],
  ["email", "Email", "text"], ["address", "Address", "text"], ["instagramUrl", "Instagram link", "text"], ["announcement", "Announcement bar text", "text"],
  ["defaultShippingFee", "Shipping fee (₹)", "number"], ["freeShippingThreshold", "Free shipping above (₹)", "number"],
  ["taxPercent", "Tax % (0 if prices include tax)", "number"], ["lowStockThreshold", "Low-stock alert at", "number"],
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [s, setS] = useState<StoreSettings>(DEFAULT_SETTINGS);
  useEffect(() => { if (data) setS(data); }, [data]);
  return (
    <form className="max-w-2xl" onSubmit={async (e) => { e.preventDefault(); try { await saveSettings(s); toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); } catch (err) { toast.error((err as Error).message); } }}>
      <AdminHeader title="Store settings"><Button>Save</Button></AdminHeader>
      <div className="grid gap-4 rounded-md border bg-background p-5 sm:grid-cols-2">
        {FIELDS.map(([k, label, type]) => (
          <div key={k} className="space-y-1"><Label htmlFor={k}>{label}</Label>
            <Input id={k} type={type} value={String(s[k] ?? "")} onChange={(e) => setS({ ...s, [k]: type === "number" ? Number(e.target.value) : e.target.value })} /></div>
        ))}
      </div>
    </form>
  );
}
