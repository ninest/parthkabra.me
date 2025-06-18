import { getAllPosts, getAllProjects, getAllWork } from "@/modules/keystatic";
import { MetadataRoute } from "next";

const BASE_URL = "https://parthkabra.me";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectPages: MetadataRoute.Sitemap = (await getAllProjects()).map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: project.updatedAt ?? project.createdAt,
    priority: 0.8,
    changeFrequency: "monthly",
  }));
  const blogPages: MetadataRoute.Sitemap = (await getAllPosts()).map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: post.updatedAt ?? post.createdAt,
    priority: 0.8,
    changeFrequency: "monthly",
  }));
  const workPages = (await getAllWork()).map((work) => ({
    url: `${BASE_URL}/work/${work.slug}`,
    lastModified: work.updatedAt ?? work.createdAt,
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/me/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/me/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projectPages,
    ...blogPages,
    ...workPages,
  ];
}
