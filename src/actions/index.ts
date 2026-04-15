import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { saveFile as ghSaveFile, uploadImage as ghUploadImage } from "../lib/github";
import { fileToBase64 } from "../lib/base64";

export const server = {
  saveFile: defineAction({
    accept: "json",
    input: z.object({
      path: z.string(),
      content: z.string(),
      sha: z.string().optional(),
    }),
    handler: async (input) => {
      const token = import.meta.env.GITHUB_TOKEN;
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
      const token = import.meta.env.GITHUB_TOKEN;
      if (!token) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "GITHUB_TOKEN not configured" });

      const base64 = fileToBase64(await input.file.arrayBuffer());
      const filePath = `${input.path}/${input.file.name}`;
      return await ghUploadImage(token, filePath, base64);
    },
  }),
};
