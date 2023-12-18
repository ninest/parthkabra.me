"use client";

import { Combobox } from "@/components/combobox";
import { Spacer } from "@/components/spacer";
import { PostCollection } from "@/modules/types";
import { cn } from "@/utils/style";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface CollectionsSidebarContentProps {
  collections: PostCollection[];
}

export function CollectionsSidebarContent({ collections }: CollectionsSidebarContentProps) {
  const pathname = usePathname();
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState(collections[0].slug);
  const selectedCollection = collections.find((c) => c.slug === selectedCollectionSlug);

  return (
    <div className="p-5">
      <Combobox
        type="single-select"
        placeholder="Select collection ..."
        searchPlaceholder="Search collection ..."
        options={collections.map((c) => ({
          label: c.title,
          value: c.slug,
        }))}
        currentValue={selectedCollectionSlug}
        setValue={setSelectedCollectionSlug}
        className="w-full"
      />

      <Spacer className="h-5" />

      {selectedCollection && (
        <>
          <div className="space-y-1">
            {selectedCollection.posts.map((post) => {
              const postHref = `/${post.slug}`;
              return (
                <Link
                  key={post.slug}
                  href={postHref}
                  className={cn("block -mx-1 p-1 rounded line-clamp-1 text-sm font-medium", {
                    "bg-gray-100 dark:bg-gray-800": postHref === pathname,
                    "hover:bg-gray-200 dark:hover:bg-gray-700": postHref !== pathname,
                  })}
                >
                  {post.title}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
