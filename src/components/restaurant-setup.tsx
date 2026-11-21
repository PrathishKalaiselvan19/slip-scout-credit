import { useEffect, useMemo, useState } from "react";
import { Check, Cloud, LoaderCircle, Minus, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHECKER_URL } from "@/lib/collector";

type Price = { key: string; label: string; price: number };
type Profile = { employees: number; suppliers: number; revenue: number; margin: number };
type Status = "idle" | "saving" | "saved" | "loaded" | "error";

export const DEFAULT_PRICES: Price[] = [
  { key: "produce", label: "Produce (tomatoes, lettuce, onions, herbs)", price: 22.5 },
  { key: "dairy", label: "Dairy (mozzarella, cream, butter)", price: 37 },
  { key: "dry", label: "Dry goods (pasta, flour, canned tomatoes)", price: 28 },
  { key: "proteins", label: "Proteins (chicken breast)", price: 39 },
  { key: "beverages", label: "Beverages (sparkling water & soft drinks)", price: 32 },
];
const DEFAULT_PROFILE: Profile = { employees: 18, suppliers: 6, revenue: 1500000, margin: 6 };

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function buildContract(prices: Price[]) {
  return [
    "Supplier: Ontario Fresh Foods Wholesale",
    ...prices.map(p => p.label + ": $" + p.price.toFixed(2) + " per unit"),
    "No other products are part of this agreement.",
  ].join("\n");
}

function Slider(props: { label: string; value: number; min: number; max: number; step: number; display: string; disabled?: boolean; onChange: (v: number) => void }) {
  return <div className="mt-5">
    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{props.label}</span><span className="font-mono text-base">{props.display}</span></div>
    <input type="range" aria-label={props.label} min={props.min} max={props.max} step={props.step} value={props.value} disabled={props.disabled} onChange={e => props.onChange(Number(e.target.value))} className="mt-3 w-full" style={{ accentColor: "#1F5BFF" }} />
  </div>;
}

export function RestaurantSetup({ onContract, disabled }: { onContract: (contract: string) => void; disabled?: boolean }) {
  const [prices, setPrices] = useState<Price[]>(DEFAULT_PRICES);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let alive = true;
    fetch(CHECKER_URL + "/settings").then(r => (r.ok ? r.json() : null)).then(data => {
      if (!alive || !data) return;
      let found = false;
      if (Array.isArray(data.prices) && data.prices.length) { setPrices(data.prices); found = true; }
      if (data.profile) { setProfile({ ...DEFAULT_PROFILE, ...data.profile }); found = true; }
      if (found) setStatus("loaded");
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const contract = useMemo(() => buildContract(prices), [prices]);
  useEffect(() => { onContract(contract); }, [contract, onContract]);

  const spend = profile.revenue * 0.32;
  const leak = spend * 0.015;
  const back = leak * 0.7;
  const profit = profile.revenue * profile.margin / 100;
  const boost = profit > 0 ? (back / profit) * 100 : 0;
  const perSupplier = profile.suppliers > 0 ? leak / profile.suppliers : 0;
  const perEmployee = profile.employees > 0 ? back / profile.employees : 0;

  function setPrice(index: number, value: number) {
    const v = Number.isFinite(value) ? Math.max(0, Math.round(value * 100) / 100) : 0;
    setPrices(ps => ps.map((p, i) => (i === index ? { ...p, price: v } : p)));
    setStatus("idle");
  }
  function setField(key: keyof Profile, value: number) {
    setProfile(p => ({ ...p, [key]: value }));
    setStatus("idle");
  }
  async function save() {
    setStatus("saving");
    try {
      const r = await fetch(CHECKER_URL + "/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prices, profile }) });
      setStatus(r.ok ? "saved" : "error");
    } catch { setStatus("error"); }
  }

  const statusText = status === "loaded" ? "Loaded from Cloudflare" : status === "saved" ? "Saved to Cloudflare" : status === "error" ? "Couldn't reach Cloudflare" : "Set it once. Collecty remembers.";

  return <div className="paste-zone" style={{ marginTop: 24 }}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm font-semibold">Your restaurant</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground"><Cloud size={14} /> {statusText}</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, marginTop: 4 }}>
      <div>
        <Slider label="Employees" value={profile.employees} min={1} max={150} step={1} display={String(profile.employees)} disabled={disabled} onChange={v => setField("employees", v)} />
        <Slider label="Suppliers" value={profile.suppliers} min={1} max={40} step={1} display={String(profile.suppliers)} disabled={disabled} onChange={v => setField("suppliers", v)} />
        <Slider label="Yearly revenue" value={profile.revenue} min={100000} max={10000000} step={50000} display={usd(profile.revenue)} disabled={disabled} onChange={v => setField("revenue", v)} />
        <Slider label="Profit margin" value={profile.margin} min={1} max={30} step={1} display={profile.margin + "%"} disabled={disabled} onChange={v => setField("margin", v)} />
        <div className="mt-6 rounded-2xl p-5" style={{ background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.28)" }}>
          <p className="text-xs text-muted-foreground">Estimated lost to supplier overcharges each year</p>
          <p style={{ fontSize: 44, fontWeight: 700, color: "#FF4D4D", lineHeight: 1.1, letterSpacing: "-0.03em" }}>{usd(leak)}</p>
          <div className="mt-3" style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, boost) + "%", height: "100%", background: "#22C55E", transition: "width .4s ease" }} />
          </div>
          <p className="mt-3 text-sm">Collecty gets back about <strong>{usd(back)}</strong> a year after our fee. That's <strong style={{ color: "#22C55E" }}>+{boost.toFixed(0)}% profit</strong>.</p>
          <p className="mt-2 text-xs text-muted-foreground">About {usd(perSupplier)} lost per supplier, or {usd(perEmployee)} per employee. Assumes supplies ≈ 32% of revenue and ~1.5% overbilling.</p>
        </div>
      </div>
      <div>
        <p className="mt-5 text-xs text-muted-foreground">Contract prices — Ontario Fresh Foods (per unit)</p>
        {prices.map((p, i) => <div key={p.key} className="mt-3 flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
          <span className="text-sm">{p.label}</span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label={"Lower " + p.key} disabled={disabled} onClick={() => setPrice(i, p.price - 0.5)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ border: "1px solid rgba(255,255,255,0.18)" }}><Minus size={14} /></button>
            <span className="text-sm text-muted-foreground">$</span>
            <input type="number" aria-label={p.label + " price"} step="0.5" min="0" value={p.price} disabled={disabled} onChange={e => setPrice(i, Number(e.target.value))} className="w-20 rounded-md bg-transparent px-2 py-1 text-right font-mono" style={{ border: "1px solid rgba(255,255,255,0.18)" }} />
            <button type="button" aria-label={"Raise " + p.key} disabled={disabled} onClick={() => setPrice(i, p.price + 0.5)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ border: "1px solid rgba(255,255,255,0.18)" }}><Plus size={14} /></button>
          </div>
        </div>)}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
          <Button variant="link" className="h-8 px-0 text-xs" disabled={disabled} onClick={() => { setPrices(DEFAULT_PRICES); setProfile(DEFAULT_PROFILE); setStatus("idle"); }}>Reset</Button>
          <Button variant="cinematic" className="cta-button" disabled={disabled || status === "saving"} onClick={save}>{status === "saving" ? <LoaderCircle className="animate-spin" /> : status === "saved" ? <Check /> : <Save />} {status === "saving" ? "Saving…" : status === "saved" ? "Saved to Cloudflare" : "Save to Cloudflare"}</Button>
        </div>
      </div>
    </div>
  </div>;
}
