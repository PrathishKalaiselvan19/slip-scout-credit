import { describe, expect, it } from "vitest";
import { CHECKER_URL, PRICING } from "@/lib/collector";

describe("Collector pricing and connection", () => {
  it("charges 30% for recovery audits", () => expect(PRICING.recoveryRate).toBe(0.30));
  it("charges nothing upfront", () => expect(PRICING.upfront).toBe(0));
  it("charges $199 monthly per location for Door Guard", () => expect(PRICING.doorGuardMonthly).toBe(199));
  it("preserves the delivery checker URL", () => expect(CHECKER_URL).toBe("https://collecty.kalaiselvanprathish.workers.dev"));
});