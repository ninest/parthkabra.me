import { MiniThemeToggleButton } from "@/app/_components/mini-theme-toggle-button";
import { Navbar } from "@/app/_components/navbar";
import { WorkList } from "@/app/_components/work-block";
import { Spacer } from "@/components/spacer";
import { buttonVariants } from "@/components/ui/button";
import { getAllPosts, getAllProjects, getAllWork } from "@/modules/keystatic";
import Link from "next/link";
import { ComponentProps } from "react";
import { LuArrowUpRight, LuArrowRight } from "react-icons/lu";

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
            <p className="text-secondary-foreground font-extrabold text-lg">Software Engineer and Data Scientist</p>
            <p className="text-muted-foreground font-extrabold text-lg">Boston, MA</p>

            <div className="mt-3 flex flex-col gap-1">
              <a href="mailto:parth.kabra@gmail.com">parth.kabra@gmail.com</a>
              <a href="tel:18573342428">+1 (857) 334-2428</a>
            </div>
          </div>

          <Spacer className="h-6" />

          <div className="flex flex-col  gap-3">
            <div className="flex items-center space-x-3">
              <a href={"https://github.com/ninest"} target="_blank" className={buttonVariants({ variant: "outline" })}>
                GitHub
              </a>

              <a
                href={"https://www.linkedin.com/in/parth-kabra/"}
                target="_blank"
                className={buttonVariants({ variant: "outline" })}
              >
                LinkedIn
              </a>

              <a
                href={"https://drive.google.com/file/d/17GM5L36CuDgM1G-CdwbmjF1NeRJxO_g1/view?usp=sharing"}
                target="_blank"
                className={buttonVariants({ variant: "outline" })}
              >
                Resume
              </a>

              {/* <Link href={"/contact"} className={buttonVariants({ variant: "outline" })}>
                Contact
              </Link> */}
            </div>
          </div>

          <Spacer className="h-8" />

          <p>
            I'm Python and TypeScript programmer with a Bachelors in computer scientist from Northeastern University in
            Boston, MA looking for full-time roles in the fields of software engineering, data science, or AI. I have
            previously interned at{" "}
            <Link href={"/work/alignable"} className="underline">
              Alignable
            </Link>{" "}
            and the{" "}
            <Link href={"/work/boston-red-sox"} className="underline">
              Boston Red Sox
            </Link>{" "}
            as a full-stack engineer.
            <br />
            <Link href={"/about"} className="mt-1 font-bold text-primary flex items-center gap-1">
              Read more <LuArrowRight />
            </Link>
          </p>
        </section>

        {/* <section className="my-11 md:my-14 space-x-wide">
          <Bento />
        </section> */}

        <Spacer className="h-12" />

        <section className="space-x">
          <Title>Work Experience</Title>
          <Spacer className="h-6" />

          <WorkList works={featuredWork} />
          <Link href={"/work"} className="block mt-3 font-semibold text-primary">
            See all
          </Link>

          <Spacer className="h-12" />

          <Title>Other</Title>
          <Spacer className="h-3" />
          <ul className="list-disc ml-4">
            {/* <li>
              <Link href={"/work"}>
                <span className="text-primary">Work</span>{" "}
                <span className="text-sm tabular-nums">({allWork.length})</span>
              </Link>
            </li> */}

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

          {/* <Title>Projects</Title>
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
          </Link> */}
        </section>
      </main>
    </>
  );
}

function Title({ children }: ComponentProps<"h2">) {
  return <h2 className="font-bold text-lg text-muted-foreground">{children}</h2>;
}
