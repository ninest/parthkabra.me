"use client";

import { DesktopSidebar } from "@/app/_components/desktop-sidebar";
import { Alert } from "@/components/alert";
import { Mermaid } from "@/components/mermaid";
import { Spacer } from "@/components/spacer";
import { Chat } from "@/components/special/chat";
import { Keyboard } from "@/components/special/keyboard";
import { PostLink } from "@/modules/types";
import { createDivisions } from "@/utils/array";
import { randomBetween } from "@/utils/random";
import { cn } from "@/utils/style";
import { DocumentElement } from "@keystatic/core";
import { DocumentRenderer } from "@keystatic/core/renderer";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ReactNode } from "react";
import { Tweet } from "react-tweet";

interface ContentLayoutProps {
  navbarSlot?: ReactNode;
  sidebarSlot?: ReactNode;

  bannerColor?: string;
  icon: { discriminant: "none" } | { discriminant: "emoji"; value: string } | { discriminant: "image"; value: string };
  draft: boolean;
  title: string;
  description: ReactNode;
  links: readonly PostLink[];
  keystaticContent: DocumentElement[];
}

export function ContentLayout({
  sidebarSlot,
  navbarSlot,

  bannerColor,
  icon,
  draft,
  title,
  description,
  links,
  keystaticContent,
}: ContentLayoutProps) {
  const { theme } = useTheme();

  const draftLinearGradientColors = createDivisions({ start: 1, end: 99, divisions: 12 })
    .flatMap((value, index, array) => {
      if (index === array.length - 1) return []; // Skip the last item
      const color = index % 2 === 0 ? "yellow" : "#222";
      return [`${color} ${value}%`, `${color} ${array[index + 1]}%`];
    })
    .join(", ");

  return (
    <main className="flex">
      {!!sidebarSlot && <DesktopSidebar>{sidebarSlot}</DesktopSidebar>}
      <div className="flex-1">
        {navbarSlot}
        <div
          style={bannerColor ? { backgroundColor: theme === "dark" ? `${bannerColor}50` : `${bannerColor}10` } : {}}
          className="h-56 md:h-64 bg-gray-100 dark:bg-gray-800"
        ></div>

        <div className="space-x">
          {icon.discriminant !== "none" && (
            <>
              {icon.discriminant === "emoji" && <div className="-mt-8 text-6xl">{icon.value}</div>}
              {icon.discriminant === "image" && (
                <div className="-mt-8 w-16">
                  <img src={icon.value} alt="Logo" />
                </div>
              )}
            </>
          )}

          <Spacer className="h-8" />

          {draft && (
            <div
              style={{
                background: `linear-gradient(-45deg, ${draftLinearGradientColors})`,
              }}
              className="w-full h-10 mb-8"
            ></div>
          )}
          <h1 className="text-5xl font-bold">{title}</h1>

          <Spacer className="h-6" />

          <div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <Spacer className="h-8" />

          {links.length > 0 && (
            <>
              <div className="border rounded-md p-5 sm:w-3/4 md:w-1/2">
                <b className="block mb-2">Links</b>
                {links.map((link) => {
                  const target = link.href.startsWith("/") ? "_self" : "_blank";
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={target}
                      className="block text-muted-foreground underline"
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              <Spacer className="h-4" />
            </>
          )}

          <article
            className={cn(
              "prose max-w-none",
              // Code
              "prose-code:before:hidden prose-code:after:hidden prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900",
              // "md:prose-pre:-mx-5",
              "dark:prose-invert",
              "prose-img:rounded sibling-div-space"
            )}
          >
            <DocumentRenderer
              document={keystaticContent}
              componentBlocks={{
                alert: (props) => {
                  return (
                    <div style={{ rotate: `${randomBetween(-0.5, 0.5)}deg` }} className="md:-mx-5">
                      <Alert {...props}>{props.content}</Alert>
                    </div>
                  );
                },
                keyboard: (props) => <Keyboard {...props} />,
                chat: (props) => <Chat {...props} />,
                // @ts-ignore
                tweet: (props) => <Tweet {...props} />,
                mermaid: (props) => {
                  const code = props.code.props.node.children.map((child: any) => child.children[0].text).join("\n\n");
                  return (
                    <div>
                      <Mermaid code={code} />
                    </div>
                  );
                },
              }}
            />
          </article>
          <Spacer className="h-32" />
        </div>
      </div>
    </main>
  );
}
