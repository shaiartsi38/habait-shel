"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CARDCOM_URL =
  "https://secure.cardcom.solutions/EA/EA5/iMUhBY4oM06Dkx8yz8r2A/PaymentSP";

export default function SubscriptionCheckoutPage() {
  return (
    <div className="min-h-screen sidebar-safe" style={{ background: "#080608" }}>
      {/* Header */}
      <div
        className="px-4 md:px-12 py-5 flex items-center gap-4"
        style={{ borderBottom: "1px solid rgba(196,133,122,0.1)" }}
      >
        <Link
          href="/subscription"
          className="flex items-center gap-2 text-[0.75rem] font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#8B6355" }}
        >
          <ArrowRight size={14} />
          חזרה
        </Link>
        <div className="flex-1 text-center">
          <p className="text-[0.52rem] tracking-[0.3em] uppercase" style={{ color: "#C4857A" }}>
            NATALIE ARTSI
          </p>
          <p className="text-sm font-black" style={{ color: "#FFF8F5" }}>
            השלמת רכישה
          </p>
        </div>
        {/* spacer to center title */}
        <div className="w-[52px]" />
      </div>

      {/* iframe */}
      <div className="flex justify-center px-4 py-8">
        <div
          className="w-full max-w-xl rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(196,133,122,0.15)",
            boxShadow: "0 16px 64px rgba(0,0,0,0.6)",
          }}
        >
          <iframe
            src={CARDCOM_URL}
            width="100%"
            height="680"
            frameBorder="0"
            title="דף תשלום מאובטח"
            style={{ display: "block", background: "#ffffff" }}
          />
        </div>
      </div>
    </div>
  );
}
