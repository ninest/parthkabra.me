const metaPageSlugs = ["about", "contact"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mermaid.ink",
        port: "",
        pathname: "/svg/**",
      },
    ],
  },

  async redirects() {
    return [
      ...metaPageSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/me/${slug}`,
        permanent: true,
      })),
      {
        source: "/project/:path*",
        destination: "/projects/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
