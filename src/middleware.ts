import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

export const onRequest = defineMiddleware((context, next) => {
  const { url, request } = context;

  if (!url.pathname.startsWith("/admin")) {
    return next();
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const decoded = atob(authHeader.slice(6));
  const [username, ...passwordParts] = decoded.split(":");
  const password = passwordParts.join(":");

  const expectedUser = env.ADMIN_USERNAME;
  const expectedPass = env.ADMIN_PASSWORD;

  if (username !== expectedUser || password !== expectedPass) {
    return new Response("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return next();
});
