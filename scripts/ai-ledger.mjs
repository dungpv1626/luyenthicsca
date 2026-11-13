#!/usr/bin/env node
// In số tiền AI đã chi (bảng ai_spend) so với trần tổng 50 USD.
//   node --env-file=.env.local scripts/ai-ledger.mjs
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const cap = Number(process.env.AI_TOTAL_CAP_USD ?? 75);
const { data } = await sb.from("ai_spend").select("usd");
const spent = (data ?? []).reduce((s, r) => s + Number(r.usd), 0);
console.log(`Đã chi ≈ $${spent.toFixed(2)} / $${cap} → còn ≈ $${(cap - spent).toFixed(2)}`);
