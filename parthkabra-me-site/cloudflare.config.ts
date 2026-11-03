import { bindings, defineConfig } from "cf/config";

// The production site: the static build in dist/, plus worker/index.ts for what needs a server.
export default defineConfig({
	worker: {
		name: "me",
		compatibilityDate: "2026-04-10",
		entrypoint: "worker/index.ts",
		workersDev: false,
		domains: ["parthkabra.me", "www.parthkabra.me"],
		previewUrls: true,
		observability: {
			enabled: true,
		},
		assets: {
			htmlHandling: "auto-trailing-slash",
			notFoundHandling: "404-page",
			runWorkerFirst: [
				"/api/*",
			],
		},
		env: {
			NTFY_TOPIC: bindings.text("parthkabra-new-subscriber"),
			DB: bindings.d1({
				name: "me-production",
				id: "a982122a-a012-4f5e-9270-d576ece2bcad",
			}),
			ASSETS: bindings.assets(),
		},
	},
});
