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
        source: "/project/national-service-resources",
        destination: "/project/nsr",
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
  webpack: (config) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, ...{ topLevelAwait: true } };
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config;
  },
};

module.exports = nextConfig;
