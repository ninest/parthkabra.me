import { allPosts, Project, Work } from "@/.contentlayer/generated";
import { allProjects, allWorks } from "@/.contentlayer/generated/index.mjs";
import {
  Button,
  PageBar,
  PageTitleBanner,
  SimpleList,
  SmartLink,
  Spacer,
} from "@/components";
import { featuredProjectSlugs, socialLinks, workSlugs } from "@/content/map";
import bostonMapLight from "@/content/map-bos-light.jpg";
import {
  getContent,
  getPostLinkInfo,
  getProjectLinkInfo,
  getWorkLinkInfo,
  sortByDate,
} from "@/lib/content";
import { useSettings } from "@/lib/settings";
import clsx from "clsx";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

export default function IndexPage() {
  const blogPosts = sortByDate(allPosts.filter((post) => !post.draft)).map(
    (post) => getPostLinkInfo(post)
  );
  const workPosts = (
    workSlugs.map((slug) => getContent(allWorks, slug)) as Work[]
  ).map((work) => getWorkLinkInfo(work));
  const featuredProjectPosts = (
    featuredProjectSlugs.map((slug) =>
      getContent(allProjects, slug)
    ) as Project[]
  ).map((project) => getProjectLinkInfo(project));

  const { theme } = useSettings();
  const mapImage = bostonMapLight;

  return (
    <>
      <PageBar />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />
        <div className="space relative overflow-x-hidden md:flex space-y-lg md:space-y-0 justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                Parth Kabra
              </h1>
            </SmartLink>
            <Spacer />

            <section className="w-5/6 lg:w-4/6 space-y-base">
              <p>
                Computer science student at <b>Northeastern University</b> with
                significant experience in app development.
              </p>
              <div className="text-gray-light space-x-base">
                {socialLinks.map((link) => (
                  <SmartLink key={link.href} href={link.href}>
                    {link.title}
                  </SmartLink>
                ))}
              </div>
            </section>
          </div>

          <div className="hidden md:static md:flex md:w-4/12 lg:w-1/5 xl:w-1/5 space-x-base">
            <div
              className={clsx({
                "contrast-200 brightness-50": theme == "dark",
              })}
            >
              <Image
                src={mapImage}
                alt="Map of Northeastern University"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="3xl" />
      <Spacer size="3xl" className="hidden md:block" />

      <div className="space">
        <main>
          <div className="flex flex-col space-y-xl lg:space-y-0 lg:flex-row lg:space-x-24">
            <div className="xl:w-3/12 lg:w-4/12">
              <h2 className="font-display font-bold text-lg">Projects</h2>
              <SimpleList items={featuredProjectPosts} />
              <Spacer size="xs" />
              <div className="flex">
                <Button
                  href="/project"
                  variant="ghost"
                  size="sm"
                  className="text-gray-light"
                  iconRight={FaArrowRight}
                >
                  View all
                </Button>
              </div>
            </div>
            <div className="xl:w-3/12 lg:w-4/12">
              <div className="bg-primary-50 rounded -m-sm p-sm lg:rounded-md lg:-m-lg lg:p-lg">
                <h2 className="font-display font-bold text-lg">Work</h2>
                <SimpleList items={workPosts} />
                <Spacer size="xs" />
                <div className="flex">
                  <Button
                    href="/work"
                    variant="ghost"
                    size="sm"
                    className="text-gray-light"
                    iconRight={FaArrowRight}
                  >
                    View all
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Spacer size="3xl" />

          <div className="hidden lg:block">
            <hr />
            <Spacer size="2xl" />
          </div>

          <div className="lg:w-3/6">
            <h2 className="font-display font-bold text-lg">Blog</h2>
            <SimpleList items={blogPosts} />
            <Spacer size="xs" />
            {/* TODO: make this a local component */}
            <div className="flex">
              <Button
                href="/work"
                variant="ghost"
                size="sm"
                className="text-gray-light"
                iconRight={FaArrowRight}
              >
                View all
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
