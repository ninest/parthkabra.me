import { Work } from "@/modules/types";
import { getStartEndYear } from "@/utils/date";
import Link from "next/link";

interface WorkBlockProps {
  work: Work;
}

export function WorkBlock({ work }: WorkBlockProps) {
  return (
    <Link href={`/work/${work.slug}`} className="flex items-center space-x-4">
      {/* Icon */}
      {work.icon.discriminant === "none" && <div className="h-12 w-12"></div>}
      {["emoji", "image"].includes(work.icon.discriminant) && (
        <div
          style={{ backgroundColor: `${work.color}20` }}
          className="rounded-sm h-12 w-12 flex items-center justify-center text-2xl"
        >
          {work.icon.discriminant === "emoji" && work.icon.value}
          {work.icon.discriminant === "image" && (
            <div className="p-2.5">
              <img src={work.icon.value} />
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center space-x-2">
          <div className="font-semibold">{work.title}</div>
          <div className="text-xs rounded p-0.5 bg-gray-200 dark:bg-gray-800">
            {getStartEndYear(new Date(work.date.start), work.date.end ? new Date(work.date.end) : null)}
          </div>
        </div>
        <div className="mt-1 text-sm">{work.description}</div>
      </div>
    </Link>
  );
}

export function WorkList({ works }: { works: Work[] }) {
  return (
    <div className="space-y-6">
      {works.map((we) => (
        <WorkBlock key={we.slug} work={we} />
      ))}
    </div>
  );
}
