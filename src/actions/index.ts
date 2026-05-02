import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { saveFile as ghSaveFile, uploadImage as ghUploadImage } from "../lib/github";
import { fileToBase64 } from "../lib/base64";
import { env } from "cloudflare:workers";

export const server = {
  saveFile: defineAction({
    accept: "json",
    input: z.object({
      path: z.string(),
      content: z.string(),
      sha: z.string().optional(),
    }),
    handler: async (input) => {
      const token = env.GITHUB_TOKEN;
      if (!token) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "GITHUB_TOKEN not configured" });

      return await ghSaveFile(token, input.path, input.content, input.sha);
    },
  }),

  uploadImage: defineAction({
    accept: "form",
    input: z.object({
      file: z.instanceof(File),
      path: z.string(),
    }),
    handler: async (input) => {
      const token = env.GITHUB_TOKEN;
      if (!token) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "GITHUB_TOKEN not configured" });

      const base64 = fileToBase64(await input.file.arrayBuffer());
      const filePath = `${input.path}/${input.file.name}`;
      return await ghUploadImage(token, filePath, base64);
    },
  }),

  // Stores a subscriber email (and optional reason) in the D1 `subscribers` table.
  // Returns { alreadySubscribed: true } if the email is already saved, updating
  // the saved reason when the subscriber provides a new non-empty one.
  subscribe: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email().max(254),
      reason: z.string().max(2000).optional(),
    }),
    handler: async (input) => {
      const db = env.DB;
      if (!db) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "DB not configured" });

      const email = input.email.trim().toLowerCase();
      const reason = input.reason?.trim() || null;

      try {
        await db
          .prepare("INSERT INTO subscribers (email, reason) VALUES (?, ?)")
          .bind(email, reason)
          .run();
        return { alreadySubscribed: false };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("UNIQUE") || msg.includes("constraint")) {
          if (reason) {
            await db.prepare("UPDATE subscribers SET reason = ? WHERE email = ?").bind(reason, email).run();
          }

          return { alreadySubscribed: true };
        }
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save subscriber" });
      }
    },
  }),
};
