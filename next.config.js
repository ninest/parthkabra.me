const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "api.tsx"],
  async rewrites() {
    return [
      {
        source: "/resume",
        destination: "/me/resume",
      },
      {
        source: "/about",
        destination: "/me/about",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/projects/:slug*",
        destination: "/project/:slug*",
        permanent: true,
      },
      {
        source: "/mini-project/:slug*",
        destination: "/project/:slug*",
        permanent: true,
      },
      {
        source: "/work-experience/:slug*",
        destination: "/work/:slug*",
        permanent: true,
      },
      {
        source: "/work/singapore-armed-forces",
        destination: "/work/saf",
        permanent: true,
      },
      {
        source: "/project/typer",
        destination: "/mini-project/typer",
        permanent: true,
      },
      {
        source: "/project/uniquecode",
        destination: "/mini-project/uniquecode",
        permanent: true,
      },
      {
        source: "/current",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/sonic-pi-vscode",
        destination: "/vscode/sonic-pi",
        permanent: true,
      },
      {
        source: "/project/nextbus",
        destination: "/project/nextbussg",
        permanent: true,
      },
      {
        source: "/project/nsr",
        destination: "/project/national-service-resources",
        permanent: true,
      },
      {
        source: "/embed-google-forms",
        destination: "/html/google-forms-embed",
        permanent: true,
      },
      {
        source: "/nextjs/non-file-based-routing",
        destination: "/nextjs/custom-routing",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
