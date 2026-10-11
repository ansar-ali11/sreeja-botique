import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { saveAddress } from "@/lib/api";
import type { Address } from "@/lib/types";

const FIELDS: [keyof Address, string, string?][] = [
  ["fullName", "Full name"], ["phone", "Mobile number", "^[6-9]\\d{9}$"], ["line1", "House / street"], ["line2", "Area / landmark (optional)"],
  ["city", "City"], ["state", "State"], ["pincode", "PIN code", "^\\d{6}$"],
];

export function AddressForm({ onSaved, onCancel }: { onSaved: (a: Address) => void; onCancel?: () => void }) {
  const { user } = useAuth();
  const [a, setA] = useState<Address>({ id: "", fullName: "", phone: "", line1: "", line2: "", city: "Kakinada", state: "Andhra Pradesh", pincode: "", isDefault: false });
  const [busy, setBusy] = useState(false);
  return (
    <form className="mb-6 grid gap-3 border p-4 sm:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      try { const r = await saveAddress(user!.uid, a); onSaved({ ...a, id: (r as { id?: string } | undefined)?.id ?? a.id }); toast.success("Address saved"); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Could not save"); } finally { setBusy(false); }
    }}>
      {FIELDS.map(([k, label, pattern]) => (
        <Input key={k} aria-label={label} placeholder={label} required={k !== "line2"} pattern={pattern} value={String(a[k] ?? "")} onChange={(e) => setA({ ...a, [k]: e.target.value })} className={k === "line1" ? "sm:col-span-2" : ""} />
      ))}
      <div className="flex gap-2 sm:col-span-2"><Button disabled={busy}>Save address</Button>{onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}</div>
    </form>
  );
}
