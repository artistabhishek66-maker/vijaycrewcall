import { supabase } from "./supabaseClient";

// ---------- Vendors ----------
export async function createVendor(data) {
  const { data: row, error } = await supabase.from("vendors").insert(data).select().single();
  if (error) throw error;
  return row;
}

export async function getVendor(id) {
  const { data, error } = await supabase.from("vendors").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function listVendors() {
  const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateVendorStatus(id, status) {
  const { data, error } = await supabase.from("vendors").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ---------- Requests ----------
export async function createRequest(data) {
  const { data: row, error } = await supabase.from("requests").insert(data).select().single();
  if (error) throw error;
  return row;
}

export async function getRequestsByIds(ids) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("requests").select("*").in("id", ids);
  if (error) throw error;
  return data;
}

export async function listOpenRequestsByCategory(category) {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAllRequests() {
  const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateRequestStatus(id, status) {
  const { data, error } = await supabase.from("requests").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ---------- Bids ----------
export async function createBid(data) {
  const { data: row, error } = await supabase.from("bids").insert(data).select().single();
  if (error) throw error;
  return row;
}

export async function getBidsForRequests(requestIds) {
  if (!requestIds.length) return [];
  const { data, error } = await supabase.from("bids").select("*").in("request_id", requestIds);
  if (error) throw error;
  return data;
}

export async function getBidsForVendor(vendorId) {
  const { data, error } = await supabase.from("bids").select("*").eq("vendor_id", vendorId);
  if (error) throw error;
  return data;
}

export async function updateBidStatus(id, status) {
  const { data, error } = await supabase.from("bids").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ---------- Local "who am I" pointers (no auth yet, just this browser) ----------
export function getMyRequestIds() {
  return JSON.parse(localStorage.getItem("cc_my_requests") || "[]");
}
export function addMyRequestId(id) {
  const ids = [id, ...getMyRequestIds()];
  localStorage.setItem("cc_my_requests", JSON.stringify(ids));
  return ids;
}
export function getMyVendorId() {
  return localStorage.getItem("cc_my_vendor_id");
}
export function setMyVendorId(id) {
  localStorage.setItem("cc_my_vendor_id", id);
}
