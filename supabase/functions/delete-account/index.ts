// @ts-nocheck
// Supabase Edge Function (Deno); https:// imports resolved at deploy. Optional: Deno VS Code extension.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Deploy: `supabase functions deploy delete-account` (project must be linked). */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("delete-account: missing env", {
      hasUrl: Boolean(supabaseUrl),
      hasAnon: Boolean(anonKey),
      hasServiceRole: Boolean(serviceRoleKey),
    });
    return new Response(
      JSON.stringify({
        error:
          "Server misconfigured (missing Supabase env). On hosted projects, redeploy the function; for local serve run `supabase secrets set --env-file ./supabase/.env` with SERVICE_ROLE.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();

  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Explicit delete so training rows are removed even if FK CASCADE was not applied (older DBs).
  // Safe when CASCADE exists: row is already gone after deleteUser, or delete is a no-op.
  const { error: trainingDelErr } = await admin
    .from("user_training_data")
    .delete()
    .eq("user_id", user.id);

  if (trainingDelErr) {
    console.error("delete-account: user_training_data delete failed", trainingDelErr);
    return new Response(JSON.stringify({ error: trainingDelErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);

  if (delErr) {
    console.error("delete-account: admin.deleteUser failed", delErr);
    return new Response(JSON.stringify({ error: delErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
