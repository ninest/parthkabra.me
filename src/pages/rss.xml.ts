export const prerender = true;

import rss from "@astrojs/rss";
import { getVisiblePosts } from "../utils/posts";
import { getPostLink } from "../utils/links";

// RSS feed of all non-draft posts, newest first. External posts link out to their source.
export async function GET(context: { site: URL }) {
  const posts = (await getVisiblePosts()).sort(
    (a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime(),
  );

  return rss({
    title: "Parth Kabra",
    description: "Posts on Parth Kabra's website",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.createdAt,
      link: getPostLink(post.id, post.data.externalUrl).href,
    })),
  });
}
