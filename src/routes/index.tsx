import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Camera, CircleDollarSign, FileSearch, ReceiptText, ScanText, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import kitchen from "@/assets/collector-kitchen.png.asset.json";
import { CountUp } from "@/components/count-up";
import { Scanner } from "@/components/scanner";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/collector";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Collecty – Check deliveries before you sign" },
    { name: "description", content: "Check every restaurant delivery against your contract in seconds and recover overcharges." },
    { property: "og:title", content: "Collecty – Catch it before you sign" },
    { property: "og:description", content: "Snap a delivery slip, catch overcharges, and send a credit email before you sign." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
function Cta({ children, href }: { children: ReactNode; href: string }) {
  return <Button asChild variant="cinematic" className="cta-button"><a href={href}>{children}<span className="arrow-circle"><ArrowUpRight /></span></a></Button>;
}

const steps = [
  ["01", "Snap the slip", Camera, "Photograph the paper the driver hands you, or drop in a PDF."],
  ["02", "AI reads every line", ScanText, "Quantities, units, prices, fees, and the total are lifted into a clean check."],
  ["03", "Checked against your contract", FileSearch, "Wrong prices, missing items, and suspicious charges are surfaced instantly."],
  ["04", "Get your money back", CircleDollarSign, "Tell the driver what is wrong and send a ready credit request."],
] as const;

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => { const update = () => setScrolled(window.scrollY > 24); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  return <div className="collector-page">
    <nav className={`site-nav ${scrolled ? "is-scrolled" : ""}`}><a href="#top" className="wordmark">Collecty</a><div className="hidden items-center gap-8 text-sm md:flex"><a href="#how">How it works</a><a href="#pricing">Pricing</a></div><a href="#scanner" className="nav-scan">Check a delivery</a></nav>
    <main>
      <section id="top" className="hero-section" style={{ backgroundImage: `url(${kitchen.url})` }}>
        <div className="hero-overlay" /><div className="film-grain" />
        <div className="hero-inner">
          <Reveal className="hero-copy"><p className="eyebrow"><span /> Delivery protection for independent kitchens</p><h1>Catch it before you sign.</h1><p className="hero-subtitle">Collecty checks every delivery against your contract in 10 seconds. You only pay when we find money.</p><Cta href="#scanner">📷 Scan a delivery</Cta></Reveal>
          <motion.div className="glass-result" initial={{ opacity: 0, y: 30 }} animate={reduced ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -12, 0] }} transition={reduced ? { duration: .4 } : { opacity: { duration: .6 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}>
            <div className="glass-head"><span className="live-pill"><span /> LIVE CHECK</span><ReceiptText size={20} /></div><p className="text-sm opacity-70">Fresh Foods Co. · Invoice #4471</p>
            <p className="glass-amount"><CountUp value={135.15} decimals={2} prefix="$" /></p><p className="font-semibold text-alert">owed</p>
            <ul><li>⚠ Mozzarella above contract</li><li>⚠ Fuel surcharge</li><li>⚠ Missed 5% discount</li></ul>
          </motion.div>
        </div>
      </section>
      <section className="light-section stats-section"><div className="section-wrap stat-grid">
        <Reveal><p className="stat-number"><CountUp value={1} /> in <CountUp value={4} /></p><p>invoices charge the wrong price</p></Reveal>
        <Reveal delay={.1}><p className="stat-number">~<CountUp value={1.5} decimals={1} suffix="%" /></p><p>of every invoice is overcharge</p></Reveal>
        <Reveal delay={.2}><p className="stat-number">&lt;<CountUp value={10} suffix="s" /></p><p>to check a delivery</p></Reveal>
      </div></section>
      <section id="how" className="dark-section"><div className="section-wrap"><Reveal className="section-heading"><span className="section-kicker">How it works</span><h2>Ten seconds at the back door.</h2></Reveal><div className="step-grid">{steps.map(([number, title, Icon, copy], i) => <Reveal key={number} delay={i * .08}><article className="step-card"><span className="step-number">{number}</span><Icon className="step-icon" strokeWidth={1} /><div><h3>{title}</h3><p>{copy}</p></div></article></Reveal>)}</div></div></section>
      <section id="scanner" className="dark-section scanner-section"><div className="section-wrap"><Reveal className="section-heading"><span className="section-kicker">The checker</span><h2>Before the pen moves.</h2><p>Scan the slip, upload the invoice, or paste the text. Collecty does the math.</p></Reveal><Reveal><Scanner /></Reveal></div></section>
      <section id="pricing" className="light-section"><div className="section-wrap"><Reveal className="section-heading"><span className="section-kicker">Pricing</span><h2>Don't pay us until we save you money.</h2></Reveal><div className="pricing-grid">
        <Reveal><article className="price-card"><CircleDollarSign className="text-primary" size={34} /><h3>Recovery audit</h3><p className="price">20%</p><p className="text-muted-foreground">of what we recover · $0 until we save you money</p><p className="mt-8">We check every invoice and recover what you were overcharged. If we don't find money, you don't pay.</p></article></Reveal>
        <Reveal delay={.1}><article className="price-card price-card-dark"><ShieldCheck size={34} /><h3>Door Guard</h3><p className="price">${PRICING.doorGuardMonthly}<span>/month</span></p><p className="opacity-70">per location · only starts after we've saved you money</p><p className="mt-8">Check deliveries before signing and stop overcharges at the back door.</p></article></Reveal>
      </div></div></section>
    </main>
    <footer className="site-footer"><span className="wordmark">Collecty</span><span>Catch it before you sign.</span></footer>
  </div>;
}
