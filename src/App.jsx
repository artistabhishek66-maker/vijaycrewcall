import React, { useState, useEffect, useCallback } from "react";
import { Camera, UtensilsCrossed, Sparkles, Check, X, Clock, ShieldCheck, Loader2 } from "lucide-react";
import * as db from "./db";

const CATS = {
  camera: { label: "Cameraman", icon: Camera, color: "#3B6E8F", bg: "#EAF1F6" },
  catering: { label: "Caterer", icon: UtensilsCrossed, color: "#4C7A52", bg: "#EDF3EA" },
  makeup: { label: "Makeup Artist", icon: Sparkles, color: "#B5566B", bg: "#F7EBEE" },
};

function Tag({ cat }) {
  const c = CATS[cat];
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: c.bg, color: c.color }}>
      <Icon size={13} strokeWidth={2.2} />
      {c.label}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    open: { c: "#8A6D1D", bg: "#FBF1D6", t: "Open" },
    pending: { c: "#8A6D1D", bg: "#FBF1D6", t: "Pending" },
    accepted: { c: "#3E7A4C", bg: "#E4F1E6", t: "Accepted" },
    approved: { c: "#3E7A4C", bg: "#E4F1E6", t: "Approved" },
    rejected: { c: "#A23B3B", bg: "#F7E6E6", t: "Rejected" },
    closed: { c: "#5B5F6B", bg: "#E9E9EC", t: "Closed" },
  };
  const s = map[status] || map.open;
  return (
    <span className="rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase" style={{ background: s.bg, color: s.c, fontFamily: "IBM Plex Mono, monospace" }}>
      {s.t}
    </span>
  );
}

function LedgerRow({ children }) {
  return (
    <div className="relative pl-4">
      <div className="ml-2 border-l border-dashed" style={{ borderColor: "#D8D2C2" }}>{children}</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-md border ${className}`} style={{ background: "#FFFDF8", borderColor: "#E4DFD0" }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#7A7362", fontFamily: "IBM Plex Mono, monospace" }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded border px-3 py-2 text-sm outline-none transition focus:ring-2";
const inputStyle = { borderColor: "#D8D2C2" };

function Btn({ children, onClick, variant = "primary", type = "button", disabled, className = "" }) {
  const styles = {
    primary: { background: "#14181F", color: "#F6F3EC" },
    accent: { background: "#C9962B", color: "#1B2430" },
    ghost: { background: "transparent", color: "#14181F", border: "1px solid #D8D2C2" },
    danger: { background: "#A23B3B", color: "#fff" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`rounded px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ${className}`} style={{ ...styles[variant] }}>
      {children}
    </button>
  );
}

// ================= CUSTOMER VIEW =================
function CustomerView() {
  const [myIds, setMyIds] = useState([]);
  const [requests, setRequests] = useState({});
  const [bidsByReq, setBidsByReq] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customer_name: "", phone: "", category: "camera", event_type: "", event_date: "", city: "", budget: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async (ids) => {
    try {
      const reqs = await db.getRequestsByIds(ids);
      const reqMap = {};
      reqs.forEach((r) => (reqMap[r.id] = r));
      setRequests(reqMap);
      const bids = await db.getBidsForRequests(ids);
      const bidMap = {};
      bids.forEach((b) => {
        bidMap[b.request_id] = bidMap[b.request_id] || [];
        bidMap[b.request_id].push(b);
      });
      setBidsByReq(bidMap);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const mine = db.getMyRequestIds();
      setMyIds(mine);
      await loadAll(mine);
      setLoading(false);
    })();
  }, [loadAll]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.event_date || !form.city) return;
    setSubmitting(true);
    setError("");
    try {
      const row =
