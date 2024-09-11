"use client";

import { randomBetween } from "@/utils/random";
import { cn } from "@/utils/style";
import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuArrowUpRight, LuGithub, LuLinkedin, LuPhone, LuTwitter } from "react-icons/lu";

export function Bento() {
  const socials = [
    {
      icon: LuGithub,
      href: "https://github.com/ninest",
      className: "text-white/75 bg-gray-900",
    },
    {
      icon: LuLinkedin,
      href: "https://www.linkedin.com/in/parth-kabra/",
      className: "text-white/75 bg-[#3375B0]",
    },
    {
      icon: LuTwitter,
      href: "https://twitter.com/nn9st",
      className: "text-white/75 bg-blue-400",
    },
    {
      icon: LuPhone,
      href: "/contact",
      className: "text-gray-800/75 bg-white",
    },
  ];
  const quickLinks = [
    { title: "Work", href: "/work" },
    { title: "Projects", href: "/projects" },
    { title: "Blog", href: "/blog" },
  ];

  const cellClasses = "bg-background border rounded-2xl md:rounded-3xl";

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5 lg:gap-4">
      {/* Socials */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(cellClasses, "row-span-1 aspect-square", "grid grid-cols-2", "p-[10%] gap-[10%]")}
      >
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <Link
              key={social.href}
              href={social.href}
              className={cn("block shadow p-[25%] rounded-md md:rounded-2xl", social.className)}
            >
              <Icon className="w-full h-full" />
            </Link>
          );
        })}
      </div>

      {/* Current */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(
          cellClasses,
          "row-span-1 col-span-2 md:col-span-3 lg:col-span-2",
          "shadow p-5",
          "!bg-[#6338CE] flex flex-col justify-between"
        )}
      >
        <div className="text-gray-200 text-sm">Currently</div>
        <div className="text-sm font-bold text-white">
          Software engineering intern, <b>Alignable</b>
        </div>
      </div>

      {/* Quick links */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(
          cellClasses,
          "row-span-1 col-span-2 md:col-span-3 lg:col-span-2",
          "px-7 py-7",
          "flex flex-col justify-between"
        )}
      >
        {quickLinks.map((ql) => (
          <Link
            key={ql.href}
            href={ql.href}
            className="flex items-center justify-between group hover:bg-muted -mx-2 px-2 -my-3 py-3 rounded-md"
          >
            <div className="text-sm font-semibold text-muted-foreground">{ql.title}</div>
            <LuArrowUpRight className="text-muted-foreground/75" />
          </Link>
        ))}
      </div>

      {/* Map */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(cellClasses, "row-span-1 aspect-square", "p-0 shadow overflow-hidden relative")}
      >
        <Image
          className="block dark:hidden"
          src={"/maps/boston/bos-light.png"}
          width={1024}
          height={1024}
          alt="Map of Boston"
        />
        <Image
          className="hidden dark:block"
          src={"/maps/boston/bos-dark.png"}
          width={1024}
          height={1024}
          alt="Map of Boston"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 text-sm md:text-base md:px-4 md:py-2 bg-white/10 backdrop-blur-sm font-bold">
          Boston, MA
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="grid grid-cols-3 md:grid-cols-6">
  //     {/* Socials */}
  //     <div
  //       style={{ rotate: `${0}deg` }}
  //       className={cn(cellClasses, "col-span-1 row-span-1 aspect-square", "grid grid-cols-2 gap-2 md:gap-4 lg:gap-6")}
  //     >
  //       {/* {socials.map((social) => {
  //         const Icon = social.icon;
  //         return (
  //           <Link
  //             key={social.href}
  //             href={social.href}
  //             className={cn("block p-2 md:p-4 rounded-md md:rounded-2xl shadow", social.className)}
  //           >
  //             <Icon className="w-full h-full" />
  //           </Link>
  //         );
  //       })} */}
  //     </div>

  //     {/* Currently doing */}
  //     <div
  //       style={{ rotate: `${0}deg` }}
  //       className={cn(cellClasses, "col-span-2 row-span-1 aspect-[2/1]", "!bg-[#6338CE] flex flex-col justify-between")}
  //     >
  //       <div className="text-gray-200 text-sm md:text-base">Currently</div>
  //       <div className="md:text-lg font-bold text-white">
  //         Software engineering intern, <b>Alignable</b>
  //       </div>
  //     </div>

  //     {/* Links to work, block, projects */}
  //     <div className={cn(cellClasses, "col-span-2 row-span-1 aspect-[2/1] ")}>hello</div>

  //     {/* Map */}
  //     <div
  //       style={{ rotate: `${0}deg` }}
  //       className={cn(cellClasses, "col-span-1 row-span-1 aspect-square", "!p-0 overflow-hidden relative")}
  //     >
  //       <Image
  //         className="block dark:hidden"
  //         src={"/maps/boston/bos-light.png"}
  //         width={1024}
  //         height={1024}
  //         alt="Map of Boston"
  //       />
  //       <Image
  //         className="hidden dark:block"
  //         src={"/maps/boston/bos-dark.png"}
  //         width={1024}
  //         height={1024}
  //         alt="Map of Boston"
  //       />

  //       <div className="absolute bottom-0 left-0 right-0 p-2 text-sm md:text-base md:px-4 md:py-2 bg-white/10 backdrop-blur-sm font-bold">
  //         Boston, MA
  //       </div>
  //     </div>
  //   </div>
  // );
}
