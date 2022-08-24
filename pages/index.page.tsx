import {
  Button,
  Icon,
  PageBar,
  PageTitleBanner,
  SimpleList,
  SmartLink,
  Spacer
} from "@/components";
import bostonMapLight from "@/content/map-bos-light.jpg";
import { getPostPages, posts } from "@/lib/content/markdown/post";
import {
  featuredProjects,
  getProjectPages
} from "@/lib/content/markdown/project";
import { mdsToLinks } from "@/lib/content/markdown/transformers";
import { getWorkPages, works } from "@/lib/content/markdown/work";
import { socialLinks } from "@/lib/content/social";
import { useSettings } from "@/lib/settings";
import clsx from "clsx";
import { InferGetStaticPropsType } from "next";
import Image from "next/image";
import { FaArrowRight, FaLocationArrow } from "react-icons/fa";

export const getStaticProps = async () => {
  const blogPages = mdsToLinks(getPostPages(posts));
  const workPages = mdsToLinks(getWorkPages(works));

  const featuredProjectPages = mdsToLinks(getProjectPages(featuredProjects));
  return {
    props: {
      blogPages,
      workPages,
      featuredProjectPages,
    },
  };
};

export default function IndexPage({
  blogPages,
  workPages,
  featuredProjectPages,
}: InferGetStaticPropsType<typeof getStaticProps>) {
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

            <section className="w-5/6 lg:w-3/6 space-y-base">
              <p>
                Computer science student at <b>Northeastern University</b>,
                Boston with significant experience in app development.
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

          <div className="hidden md:static md:flex md:w-4/12 lg:w-1/5 xl:w-1/5 max-w-xs space-x-base">
            <SmartLink
              href="https://www.google.com/maps/place/Northeastern+University/@42.3398067,-71.0913604,17z/data=!3m1!4b1!4m5!3m4!1s0x89e37a1999cf5ce1:0xc97b00e66522b98c!8m2!3d42.3398067!4d-71.0891717"
              className="block"
            >
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
              <Spacer size="xs" />
              <div className="text-gray-light flex place-content-center items-center space-x-sm">
                <Icon icon={FaLocationArrow} className="text-xs" />
                <div className="text-sm">Boston, MA</div>
              </div>
            </SmartLink>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="3xl" />
      <Spacer size="3xl" className="hidden md:block" />

      <div className="space">
        <main>
          <div
            className={clsx(
              "flex flex-col space-y-xl lg:space-y-0",
              "lg:flex-row lg:space-x-24",
              "lg:w-9/12 xl:w-7/12 max-w-7xl"
            )}
          >
            <div className="lg:w-1/2">
              <h2 className="font-display font-bold text-lg">Projects</h2>
              <SimpleList items={featuredProjectPages} />
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
            <div className="lg:w-1/2">
              <div className="bg-primary-50 rounded -m-sm p-sm lg:rounded-md lg:-m-lg lg:p-lg">
                <h2 className="font-display font-bold text-lg">Work</h2>
                <SimpleList items={workPages} />
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

          <div className="lg:w-3/6 max-w-7xl">
            <h2 className="font-display font-bold text-lg">Blog</h2>
            <SimpleList items={blogPages} />
            <Spacer size="xs" />
            {/* TODO: make this a local component */}
            <div className="flex">
              <Button
                href="/all"
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
