import { PostLink } from "@/lib/content/frontmatter";
import { useScrollPosition } from "@/lib/scroll/useScrollPosition";
import { useSettings } from "@/lib/settings";
import clsx from "clsx";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { WiMoonAltThirdQuarter } from "react-icons/wi";
import { Icon } from "../Icon";
import { SmartLink } from "../SmartLink";
import { Spacer } from "../Spacer";
interface Props {
  items?: { title: string; href?: string }[];
  sidebarSections?: ReactNode[];
  fullWidth?: boolean;
}

export const PageBar = ({ items }: Props) => {
  const scrollPosition = useScrollPosition();
  const haveScrolledBelowTitle = scrollPosition > 135;

  const router = useRouter();
  const isHome = router.asPath === "/";

  const { setTheme, theme } = useSettings();
  const toggleTheme = () => {
    if (theme == "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <>
      <header
        className={clsx(
          "space",
          // { space: isHome, "max-w-[80ch] mx-auto": !isHome },
          "sticky top-0 bg-light opacity-95 flex justify-between items-center z-10",
          "mt-xl",

          {
            // "border-b md:border-none": !fullWidth && haveScrolledBelowTitle,
          }
        )}
      >
        {/* text-gray-light is for ellipsis */}
        <div
          className={clsx("line-clamp-1", {
            // Default transparent before scrolling down to hide ellipsis
            "text-transparent": !haveScrolledBelowTitle,
            "text-gray-light": haveScrolledBelowTitle,
          })}
        >
          <SmartLink
            href="/"
            className={clsx(
              "font-display text-gray-dark font-extrabold transition-opacity",
              {
                "opacity-0": haveScrolledBelowTitle ? false : isHome,
                "opacity-100": !(haveScrolledBelowTitle ? false : isHome),
              }
            )}
          >
            Parth Kabra
          </SmartLink>
          {items && <> </>}
          <span className="text-gray-light text-sm">
            {/* All except last */}
            {items &&
              items.slice(0, -1).map((item) => (
                <span key={item.title}>
                  {"/ "}
                  {item.href ? (
                    <SmartLink href={item.href}>{item.title}</SmartLink>
                  ) : (
                    <>{item.title}</>
                  )}{" "}
                </span>
              ))}
            {/* Last one should only show when scrolled below title */}
            {items && (
              <span
                className={clsx("transition-opacity", {
                  "opacity-100": haveScrolledBelowTitle,
                  "opacity-0": !haveScrolledBelowTitle,
                })}
              >
                {"/ "}{" "}
                {items.at(-1)?.href ? (
                  <SmartLink href={items.at(-1)?.href!}>
                    {items.at(-1)?.title}
                  </SmartLink>
                ) : (
                  <>{items.at(-1)?.title}</>
                )}
              </span>
            )}
          </span>
        </div>

        <Spacer axis="x" size="sm" />

        <div className="flex items-center space-x-base">
          <button
            className="border border-gray-lightest p-xs rounded-md"
            onClick={toggleTheme}
          >
            <Icon icon={WiMoonAltThirdQuarter} className="text-gray" />
          </button>
        </div>
      </header>
    </>
  );
};
