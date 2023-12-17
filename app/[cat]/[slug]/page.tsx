import { reader } from "@/modules/keystatic";
import { DocumentRenderer } from "@keystatic/core/renderer";

export default async function PostComponent({ params }: { params: { cat: string; slug: string } }) {
  const post = await reader.collections.posts.readOrThrow(`${params.cat}/${params.slug}`);
  const content = await post.content();

  return (
    <>
      {post.title}
      <DocumentRenderer document={content} componentBlocks={{}} />
    </>
  );
}
