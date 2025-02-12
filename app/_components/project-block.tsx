import { Project } from "@/modules/types";
import { randomBetween } from "@/utils/random";
import { cn } from "@/utils/style";
import Link from "next/link";

interface ProjectBlockProps {
  project: Project;
}
export function ProjectBlock({ project }: ProjectBlockProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      style={{
        // rotate: `${randomBetween(-2, 2)}deg`,
        // @ts-ignore
        "--shadow-color": `${project.color}40`,
        backgroundColor: `${project.color}20`,
        borderColor: `${project.color}20`,
      }}
      className="block border-4 rounded-sm p-4 shadow shadow-[--shadow-color]"
    >
      <b style={{ color: project.color }} className="brightness-50 dark:brightness-125">
        {project.title}
      </b>
      <p className="mt-1 text-sm">{project.description}</p>
    </Link>
  );
}

export function ProjectsList({ projects, className }: { projects: Project[]; className?: string }) {
  return (
    <div className={cn("grid sm:grid-cols-2 gap-6", className)}>
      {projects.map((p) => (
        <ProjectBlock key={p.slug} project={p} />
      ))}
    </div>
  );
}
