import { Navbar } from "@/app/_components/navbar";
import { ProjectsList } from "@/app/_components/project-block";
import { Spacer } from "@/components/spacer";
import { getAllProjects } from "@/modules/keystatic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const featuredProjects = await getAllProjects({ featured: true });
  const allProjects = await getAllProjects();

  return (
    <>
      <Navbar />
      <Spacer className="h-8" />

      <main className="space-x">
        <h1 className="text-5xl font-bold">Projects</h1>
        <Spacer className="h-12" />

        <h2 className="text-3xl font-bold">Featured</h2>
        <Spacer className="h-8" />
        <ProjectsList projects={featuredProjects} className="sm:-mx-2 md:-mx-8" />

        <Spacer className="h-12" />

        <h2 className="text-3xl font-bold">All</h2>
        <Spacer className="h-8" />
        <ProjectsList projects={allProjects} className="sm:-mx-2 md:-mx-8" />

        <Spacer className="h-28" />
      </main>
    </>
  );
}
