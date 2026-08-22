#!/usr/bin/env node
// End-to-end verification of the AI service critical path:
//   - chat endpoint rejects unauthenticated and anon-key requests (401)
//   - free-tier limit blocks the 6th request per user per month (429)
//   - the counter survives a browser refresh / new HTTP request (server-side)
//   - RLS isolates conversations between users
//
// Requires: SUPABASE_SERVICE_ROLE_KEY (admin) and the project ref as env
// variables or hard-coded constants below.

import { createClient } from "@supabase/supabase-js";

const PROJECT_REF = "xyvuqbpwrhkukjgzveyc";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) { console.error("SUPABASE_SERVICE_ROLE_KEY env var required"); process.exit(2); }

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let pass = 0;
let fail = 0;
function ok(msg) { console.log("  PASS " + msg); pass++; }
function bad(msg) { console.log("  FAIL " + msg); fail++; }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchChat(token, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.text() };
}

async function signInAs(email, password) {
  const { data, error } = await adminClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session.access_token;
}

async function createUser(label) {
  const email = `verify-ai-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@chinaconnect-test.com`;
  const password = "TestPass123!";
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return { id: data.user.id, email, password };
}

async function deleteUser(id) {
  await adminClient.auth.admin.deleteUser(id);
}

async function listConversationsAs(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_conversations?select=id,user_id,summary`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${token}`,
      "Accept-Profile": "public",
    },
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  console.log("== ChinaConnect AI Service Verification ==\n");

  // 1. Unauthenticated POST -> 401
  console.log("[1/6] Unauthenticated request -> 401");
  {
    const { status } = await fetchChat(null, { messages: [{ role: "user", content: "ping" }] });
    status === 401 ? ok("no token -> 401") : bad(`no token -> ${status}`);
  }

  // 2. Anon key POST -> 401 (anon != user)
  console.log("\n[2/6] Anon-key request -> 401");
  {
    const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || "";
    const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ messages: [{ role: "user", content: "ping" }] }),
    });
    res.status === 401 ? ok(`anon key -> 401 (status ${res.status})`) : bad(`anon key -> ${res.status}`);
  }

  // 3. Sign in a free-tier user and exercise the 5+1 quota
  console.log("\n[3/6] 5+1 monthly free-tier quota");
  const userA = await createUser("alpha");
  const tokenA = await signInAs(userA.email, userA.password);
  for (let i = 1; i <= 5; i++) {
    const { status } = await fetchChat(tokenA, { messages: [{ role: "user", content: `req-${i}` }] });
    status === 200 ? ok(`req ${i} -> 200`) : bad(`req ${i} -> ${status}`);
  }

  // 4. 6th request -> 429
  {
    const { status, body } = await fetchChat(tokenA, { messages: [{ role: "user", content: "req-6" }] });
    if (status === 429 && body.includes("usage_exceeded")) {
      ok(`req 6 -> 429 with usage_exceeded`);
    } else {
      bad(`req 6 -> ${status} ${body.slice(0, 100)}`);
    }
  }

  // 5. Re-issuing the request after a fresh sign-in must still be blocked
  console.log("\n[4/6] Counter survives a refresh / re-auth");
  await sleep(1500);
  const tokenA2 = await signInAs(userA.email, userA.password);
  {
    const { status, body } = await fetchChat(tokenA2, { messages: [{ role: "user", content: "after-refresh" }] });
    status === 429 ? ok("refresh -> 429 (counter is server-side)") : bad(`refresh -> ${status} ${body.slice(0, 100)}`);
  }

  // 6. A second user cannot see the first user's conversations (RLS)
  console.log("\n[5/6] RLS isolates conversation memory per user");
  const userB = await createUser("beta");
  const tokenB = await signInAs(userB.email, userB.password);
  const userBConv = await listConversationsAs(tokenB);
  userBConv.body === "[]"
    ? ok("user B sees zero conversations (user A's 5 are hidden)")
    : bad(`user B sees ${userBConv.body}`);

  // user A still sees their own 5 conversations
  const userAConv = await listConversationsAs(tokenA);
  const aList = JSON.parse(userAConv.body);
  Array.isArray(aList) && aList.length === 5 && aList.every((c) => c.user_id === userA.id)
    ? ok(`user A sees exactly 5 conversations, all owned`)
    : bad(`user A conv list unexpected: ${userAConv.body.slice(0, 200)}`);

  // 7. user B can create and see their own conversation
  console.log("\n[6/6] user B can create + retrieve their own conversation");
  {
    const { status } = await fetchChat(tokenB, { messages: [{ role: "user", content: "userB hi" }] });
    status === 200 ? ok("user B first chat -> 200") : bad(`user B first chat -> ${status}`);
  }
  const userBConv2 = await listConversationsAs(tokenB);
  const bList = JSON.parse(userBConv2.body);
  Array.isArray(bList) && bList.length === 1 && bList[0].user_id === userB.id
    ? ok("user B now sees 1 conversation owned by themselves")
    : bad(`user B conv list unexpected: ${userBConv2.body.slice(0, 200)}`);
  {
    const bSummary = JSON.parse(userBConv2.body)[0]?.summary ?? "";
    bSummary.length > 0 ? ok(`summary populated: "${bSummary.slice(0, 60)}..."`) : bad("summary missing");
  }

  // Cleanup
  console.log("\n[cleanup]");
  await deleteUser(userA.id);
  await deleteUser(userB.id);
  console.log("  deleted user A and user B");

  console.log(`\n== RESULT: ${pass} pass, ${fail} fail ==`);
  if (fail === 0) console.log("AI SERVICE READY");
  else console.log("AI SERVICE BLOCKED");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(2);
});