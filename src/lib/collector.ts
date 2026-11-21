export const CHECKER_URL = "https://collecty.kalaiselvanprathish.workers.dev";
export const PRICING = { recoveryRate: 0.30, upfront: 0, doorGuardMonthly: 199 };
export const CONTRACT = [
  "Supplier: Ontario Fresh Foods Wholesale",
  "Produce (tomatoes, lettuce, onions, herbs): $22.50 per unit",
  "Dairy (mozzarella, cream, butter): $37.00 per unit",
  "Dry goods (pasta, flour, canned tomatoes): $28.00 per unit",
  "Proteins (chicken breast): $39.00 per unit",
  "Beverages (sparkling water & soft drinks): $32.00 per unit",
  "No other products are part of this agreement.",
].join("\n");
export const DEMO = `INVOICE
Invoice Number: GTA-26-2210   Date: 2026-11-20
Supplier: Ontario Fresh Foods Wholesale (Sample)
Bill To: Parkside Bistro Group (Sample)
Description | Qty | Unit Price | Line Total
Produce — tomatoes, lettuce, onions, herbs | 12 | $22.50 | $270.00
Dairy — mozzarella, cream, butter | 8 | $37.00 | $296.00
Dry goods — pasta, flour, canned tomatoes | 10 | $28.00 | $280.00
Proteins — chicken breast | 15 | $39.00 | $585.00
Beverages — sparkling water & soft drinks | 6 | $32.00 | $192.00
Beverages — sparkling water & soft drinks | 6 | $32.00 | $192.00
Imported olive oil — 1L bottle | 24 | $96.00 | $2,304.00
Subtotal $4,119.00
HST (13%) $617.85
TOTAL DUE $4,736.85`;
export type Issue = { item: string; type: string; charged?: number; should_be?: number; overcharge: number };
export type Result = { verdict: string; owed?: number; issues?: Issue[]; message_to_driver?: string; credit_email?: string };
export const money = (n?: number) => `$${(n ?? 0).toFixed(2).replace(/\.00$/, "")}`;

export function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1024 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) { reject(new Error("Couldn't read that photo")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read that photo")); };
    img.src = url;
  });
}

export async function readPdf(file: File): Promise<{ text: string } | { image: string }> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  try {
    const lines: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      lines.push(content.items.map(item => "str" in item ? item.str : "").join(" "));
    }
    const text = lines.join("\n").trim();
    if (text) return { text };
    if (pdf.numPages > 1) throw new Error("This scanned PDF has multiple pages. Upload a photo of each slip separately.");
    const page = await pdf.getPage(1);
    const initial = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1024 / initial.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't read that PDF");
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    return { image: canvas.toDataURL("image/jpeg", 0.85) };
  } finally {
    try { await (pdf as any).destroy?.(); } catch { /* ignore cleanup errors */ }
  }
}
