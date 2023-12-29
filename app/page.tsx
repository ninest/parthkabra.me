import { Bento } from "@/app/_components/bento";
import { MiniThemeToggleButton } from "@/app/_components/mini-theme-toggle-button";
import { Navbar } from "@/app/_components/navbar";
import { PostsList } from "@/app/_components/post";
import { ProjectsList } from "@/app/_components/project-block";
import { WorkList } from "@/app/_components/work-block";
import { Mermaid } from "@/components/mermaid";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { getAllPosts, getAllProjects, getAllWork } from "@/modules/keystatic";
import Link from "next/link";
import { ComponentProps } from "react";

export default async function Home() {
  const featuredWork = await getAllWork({ featured: true });
  const allWork = await getAllWork();

  const featuredProjects = await getAllProjects({ featured: true });
  const allProjects = await getAllProjects();

  const posts = await getAllPosts();
  const displayPosts = posts.filter((post) => !post.slug.startsWith("leetcode")).slice(0, 15);

  return (
    <>
      <Navbar onlyVisibleOnScroll={true} />

      <main className="mb-10">
        <section className="space-x">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-primary font-black text-3xl">Parth Kabra</h1>
              <MiniThemeToggleButton />
            </div>
            <h1 className="text-secondary-foreground font-extrabold text-lg">Software Engineer and Data Scientist</h1>
            <h1 className="text-muted-foreground font-extrabold text-lg">Northeastern University, Boston, MA</h1>
          </div>

          <Spacer className="h-6" />
          {/* 
          <div className="flex items-center space-x-3">
            <Button asChild variant={"outline"}>
              <a href={"https://github.com/ninest"} target="_blank">
                GitHub
              </a>
            </Button>
            <Button asChild variant={"outline"}>
              <a href={"https://www.linkedin.com/in/parth-kabra/"} target="_blank">
                LinkedIn
              </a>
            </Button>
            <Button asChild variant={"outline"}>
              <Link href={"/contact"}>Contact</Link>
            </Button>
          </div> */}

          {/* <Spacer className="h-8" /> */}

          <p>
            I'm a computer science student at Northeastern University in Boston, MA looking for internships and
            full-time roles in 2024/2025.{" "}
            <Link href={"/about"} className="text-primary">
              Read more
            </Link>
          </p>
        </section>

        <section className="my-11 md:my-14 space-x-wider">
          <Bento />
        </section>

        <section className="space-x">
          <ul className="list-disc ml-4">
            <li>
              <Link href={"/work"}>
                <span className="text-primary">Work</span>{" "}
                <span className="text-sm tabular-nums">({allWork.length})</span>
              </Link>
            </li>
            <li>
              <Link href={"/projects"}>
                <span className="text-primary">Projects</span>{" "}
                <span className="text-sm tabular-nums">({allProjects.length})</span>
              </Link>
            </li>
            <li>
              <Link href={"/all"}>
                <span className="text-primary">Blog posts</span>{" "}
                <span className="text-sm tabular-nums">({posts.length})</span>
              </Link>
            </li>
          </ul>

          <hr className="my-8" />

          <Title>Work</Title>
          <Spacer className="h-6" />

          <WorkList works={featuredWork} />
          <Link href={"/work"} className="block mt-3 font-semibold text-primary">
            See all ({allWork.length})
          </Link>

          <Spacer className="h-12" />

          <Title>Projects</Title>
          <Spacer className="h-4" />

          <ProjectsList projects={featuredProjects} />
          <Link href={"/projects"} className="block mt-3 font-semibold text-primary">
            See all ({allProjects.length})
          </Link>

          <Spacer className="h-12" />

          <Title>Blog</Title>
          <Spacer className="h-4" />

          <PostsList posts={displayPosts} />
          <Link href={"/all"} className="block mt-3 font-semibold text-primary">
            See all ({posts.length})
          </Link>
        </section>
      </main>
    </>
  );
}

function Title({ children }: ComponentProps<"h2">) {
  return <h2 className="font-bold text-lg text-muted-foreground">{children}</h2>;
}
