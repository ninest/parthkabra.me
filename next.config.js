const metaPageSlugs = ["about", "contact"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return metaPageSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/me/${slug}`,
    }));
  },
  // async redirects() {
  //   return metaPageSlugs.map((slug) => ({
  //     source: `/meta/${slug}`,
  //     destination: `/meta/${slug}`,
  //     permanent: true,
  //   }));
  // },
};

module.exports = nextConfig;
