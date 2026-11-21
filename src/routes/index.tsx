import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Collector – Catch it before you sign" },
      { name: "description", content: "Scan a delivery slip and find overcharges before you sign." },
      { property: "og:title", content: "The Collector – Catch it before you sign" },
      { property: "og:description", content: "Scan a delivery slip and find overcharges before you sign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const API = "https://collecty.kalaiselvanprathish.workers.dev";
const DEMO = `INVOICE #44821 — Sysco Foods
Deliver to: Rosa's Kitchen
Tomatoes, Roma 25lb   10 cs @ $25.00 = $250.00  (contract $20.00)
Chicken Breast 40lb    5 cs @ $92.00 = $460.00  (contract $92.00)
Olive Oil 3L           6 ea @ $18.50 = $111.00
Received: Tomatoes 8 cs, Chicken 5 cs, Olive Oil 4 ea
TOTAL DUE: $821.00`;

type Issue = { item: string; type: string; charged?: number; should_be?: number; overcharge: number };
type Result = { verdict: string; owed?: number; issues?: Issue[]; message_to_driver?: string; credit_email?: string };

function resize(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1024 / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

const money = (n?: number) => `$${(n ?? 0).toFixed(2).replace(/\.00$/, "")}`;

function Index() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function send(body: object) {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`Server error ${r.status}`);
      setResult(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try { await send({ image: await resize(f) }); } catch { setError("Couldn't read that photo"); }
  }

  const dont = result?.verdict === "DONT_SIGN";

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-16 pt-8 font-sans">
      <header className="mb-8">
        <h1 className="font-display text-4xl leading-none tracking-tight">The Collector</h1>
        <p className="mt-2 text-primary">Catch it before you sign.</p>
      </header>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="w-full rounded-2xl bg-primary py-8 font-display text-2xl text-primary-foreground shadow-lg transition active:scale-[0.98] disabled:opacity-50"
      >
        📷 Scan delivery
      </button>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="slip" className="text-sm font-medium text-muted-foreground">Paste slip text</label>
          <button onClick={() => setText(DEMO)} className="text-sm font-medium text-primary underline-offset-4 hover:underline">Use demo slip</button>
        </div>
        <textarea id="slip" value={text} onChange={(e) => setText(e.target.value)} rows={6}
          placeholder="Paste invoice / delivery slip text…"
          className="w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={() => send({ text })} disabled={loading || !text.trim()}
          className="mt-3 w-full rounded-xl bg-secondary py-3 font-medium text-secondary-foreground disabled:opacity-40">
          Check text
        </button>
      </section>

      {loading && <p className="mt-6 animate-pulse text-center text-muted-foreground">Checking the slip…</p>}
      {error && <p className="mt-6 rounded-xl bg-destructive/15 p-3 text-center text-destructive">{error}</p>}

      {result && (
        <section className="mt-6 space-y-4">
          <div className={`rounded-2xl p-5 font-display text-xl ${dont ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
            {dont ? `🚫 Don't sign — you're owed ${money(result.owed)}` : "✅ Safe to sign"}
          </div>

          {result.issues?.map((i, k) => (
            <div key={k} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{i.item}</p>
                  <p className="text-sm capitalize text-muted-foreground">{i.type}</p>
                </div>
                <p className="font-display text-lg text-destructive">+{money(i.overcharge)}</p>
              </div>
            </div>
          ))}

          {result.message_to_driver && (
            <div className="rounded-2xl border border-primary/40 bg-card p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">Tell the driver</p>
              <p>{result.message_to_driver}</p>
            </div>
          )}

          {result.credit_email && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Credit email</p>
                <button
                  onClick={async () => { await navigator.clipboard.writeText(result.credit_email!); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm">{result.credit_email}</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
