import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Camera, Check, CheckCheck, Copy, FileUp, LoaderCircle, ScanLine, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { CHECKER_URL, CONTRACT, DEMO, money, readPdf, resize, type Result } from "@/lib/collector";

export function Scanner() {
  const photoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [contract, setContract] = useState(CONTRACT);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState("");
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const timer = setInterval(() => setStep(s => (s + 1) % 3), 1800);
    return () => clearInterval(timer);
  }, [loading]);

  async function check(body: object) {
    const response = await fetch(CHECKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, contract }) });
    if (!response.ok) throw new Error(`The checker couldn't finish (${response.status}). Please try again.`);
    const data: Result = await response.json();
    if (!data.verdict) throw new Error("The checker returned an incomplete result. Please try again.");
    setResult(data);
  }
  async function run(action: () => Promise<void>) {
    setLoading(true); setError(""); setResult(null); setCopied(false);
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }
  function upload(file: File | undefined, pdf = false) {
    if (!file) return;
    setFilename(file.name);
    void run(async () => { await check(pdf ? await readPdf(file) : { image: await resize(file) }); });
  }
  const dont = result?.verdict === "DONT_SIGN";
  return <div className="scanner-shell">
    <div className="scanner-top"><span className="flex items-center gap-2"><ScanLine size={18} /> DELIVERY CHECK</span><span className="flex items-center gap-2 text-muted-foreground"><span className="status-dot" /> Ready when you are</span></div>
    <div className="scanner-body">
      <div className="upload-zone">
        <div className="scan-corners"><Camera size={38} strokeWidth={1.25} /></div>
        <h3>A quick snap. A clear answer.</h3>
        <p>Your next delivery starts here.</p>
        <input ref={photoRef} type="file" aria-label="Delivery photo" accept="image/*" capture="environment" className="hidden" onChange={e => { upload(e.target.files?.[0]); e.target.value = ""; }} />
        <input ref={pdfRef} type="file" aria-label="Delivery PDF" accept="application/pdf,.pdf" className="hidden" onChange={e => { upload(e.target.files?.[0], true); e.target.value = ""; }} />
        <Button variant="cinematic" disabled={loading} className="cta-button" onClick={() => photoRef.current?.click()}><Camera /> Scan delivery <span className="arrow-circle"><ArrowUpRight /></span></Button>
        <Button variant="ghost" disabled={loading} className="mt-3 text-muted-foreground" onClick={() => pdfRef.current?.click()}><FileUp /> Upload a PDF</Button>
        {filename && <p className="upload-filename">{filename}</p>}
      </div>
      <div className="paste-zone">
        <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor="slip" className="text-sm font-semibold">Paste slip text</label><Button variant="link" className="h-8 px-0 text-xs" disabled={loading} onClick={() => { setText(DEMO); setFilename(""); }}>Use demo slip <ArrowUpRight /></Button></div>
        <textarea id="slip" value={text} disabled={loading} onChange={e => setText(e.target.value)} rows={7} placeholder="Invoice number, items, quantities, prices…" className="slip-textarea" />
        <Button variant="secondary" className="mt-4 h-12 w-full justify-between rounded-full px-6" disabled={loading || !text.trim()} onClick={() => { setFilename(""); void run(() => check({ text })); }}>Check text {loading ? <LoaderCircle className="animate-spin" /> : <ArrowUpRight />}</Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14} /> Your slip stays between you and Collecty.</p>
      </div>
    </div>
    <div className="paste-zone" style={{ marginTop: 24 }}>
      <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor="contract" className="text-sm font-semibold">Your contract prices</label><span className="text-xs text-muted-foreground">Every restaurant has its own. Edit any price, then check again.</span></div>
      <textarea id="contract" value={contract} disabled={loading} onChange={e => setContract(e.target.value)} rows={7} className="slip-textarea" />
      <div className="mt-3 flex justify-end"><Button variant="link" className="h-8 px-0 text-xs" disabled={loading} onClick={() => setContract(CONTRACT)}>Reset to Ontario Fresh Foods prices</Button></div>
    </div>
    {loading && <div role="status" className="scanning-state"><div className="scan-paper"><div /><div /><div /><div /><span className="scanning-line" /></div><p>{["Reading slip…", "Checking prices…", "Finding your money…"][step]}</p></div>}
    {error && <p role="alert" className="scanner-error"><TriangleAlert size={20} />{error}</p>}
    <AnimatePresence>{result && <motion.div className="results" initial={{ opacity: 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`verdict ${dont ? "verdict-alert" : "verdict-safe"}`} role="status">
        {dont ? <TriangleAlert size={30} /> : <CheckCheck size={30} />}
        <div><p className="text-sm font-medium">{dont ? "🚫 Don't sign — you're owed" : "✅ Safe to sign"}</p>{dont && <p className="owed-number"><CountUp value={result.owed ?? 0} decimals={2} prefix="$" /></p>}</div>
      </div>
      <div className="issue-grid">{result.issues?.map((issue, index) => <motion.div key={`${issue.item}-${index}`} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : index * .1 }} className="issue-card">
        <div className="flex items-start justify-between gap-3"><h4>{issue.item}</h4><span className="overcharge-pill">+{money(issue.overcharge)}</span></div>
        <p className="mt-2 text-sm capitalize text-muted-foreground">{issue.type.replaceAll("_", " ")}</p>
        {(issue.charged != null || issue.should_be != null) && <div className="price-comparison"><span>Charged <strong>{issue.charged != null ? money(issue.charged) : "—"}</strong></span><span>Contract <strong>{issue.should_be != null ? money(issue.should_be) : "—"}</strong></span></div>}
      </motion.div>)}</div>
      {result.message_to_driver && <div className="driver-message"><span className="section-kicker">Tell the driver</span><p className="mt-3">{result.message_to_driver}</p></div>}
      {result.credit_email && <div className="email-card"><div className="flex items-center justify-between gap-3"><span className="section-kicker">Credit email</span><Button variant="secondary" className="rounded-full" onClick={async () => { const email = result.credit_email; if (!email) return; try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setError("Couldn't copy the email. Please select and copy the text below."); } }}>{copied ? <Check /> : <Copy />}{copied ? "Copied ✓" : "Copy"}</Button></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7">{result.credit_email}</p></div>}
    </motion.div>}</AnimatePresence>
  </div>;
}
