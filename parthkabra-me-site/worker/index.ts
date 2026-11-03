// What the static site can't do itself: the subscribe form's endpoint. Everything else is dist/.
type D1 = {
  prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<{ meta: { changes: number } }> } };
};
type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB: D1;
  NTFY_TOPIC?: string;
};
type Context = { waitUntil(promise: Promise<unknown>): void };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** Sends a phone notification about a subscriber. Best effort: failing must not fail the form. */
async function notify(env: Env, email: string, reason: string | null, alreadySubscribed: boolean) {
  if (!env.NTFY_TOPIC) return;
  try {
    await fetch(`https://ntfy.sh/${env.NTFY_TOPIC}`, {
      method: "POST",
      body: `Email: ${email}\nReason: ${reason || "(not provided)"}`,
      headers: { Title: alreadySubscribed ? "Subscriber resubscribed" : "New subscriber" },
    });
  } catch (e) {
    console.warn("Failed to send ntfy notification", e);
  }
}

/** Saves a subscriber. A repeat keeps their row, updating the reason only if they gave a new one. */
async function subscribe(request: Request, env: Env, ctx: Context): Promise<Response> {
  const origin = request.headers.get("Origin");
  if (!origin || new URL(origin).host !== new URL(request.url).host) return json({ error: "Forbidden" }, 403);

  const form = await request.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().toLowerCase();
  const reason = String(form?.get("reason") ?? "").trim() || null;
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Please enter a valid email" }, 400);
  if (reason && reason.length > 2000) return json({ error: "That reason is too long" }, 400);

  try {
    const { meta } = await env.DB.prepare("INSERT INTO subscribers (email, reason) VALUES (?, ?) ON CONFLICT (email) DO NOTHING")
      .bind(email, reason)
      .run();
    const alreadySubscribed = meta.changes === 0;
    if (alreadySubscribed && reason) {
      await env.DB.prepare("UPDATE subscribers SET reason = ? WHERE email = ?").bind(reason, email).run();
    }
    ctx.waitUntil(notify(env, email, reason, alreadySubscribed));
    return json({ alreadySubscribed });
  } catch (e) {
    console.error("Failed to save subscriber", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/subscribe") {
      return request.method === "POST" ? subscribe(request, env, ctx) : json({ error: "Method not allowed" }, 405);
    }
    return env.ASSETS.fetch(request);
  },
};
