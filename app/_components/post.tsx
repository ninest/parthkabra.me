import { Post } from "@/modules/types";
import Link from "next/link";

export function PostsList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-1">
      {posts.length===0 && <i>Nothing here yet!</i>}
      {posts.map((p) => (
        <Link key={p.slug} href={`/${p.slug}`} className="block">
          {p.title}
        </Link>
      ))}
    </div>
  );
}
