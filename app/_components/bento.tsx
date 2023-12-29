"use client";

import { randomBetween } from "@/utils/random";
import { cn } from "@/utils/style";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { LuGithub, LuLinkedin, LuPhone, LuTwitter } from "react-icons/lu";

export function Bento() {
  const socials = [
    {
      icon: LuGithub,
      href: "https://github.com/ninest",
      className: "text-white bg-gray-900",
    },
    {
      icon: LuLinkedin,
      href: "https://www.linkedin.com/in/parth-kabra/",
      className: "text-white bg-[#3375B0]",
    },
    {
      icon: LuTwitter,
      href: "https://twitter.com/nn9st",
      className: "text-white bg-blue-400",
    },
    {
      icon: LuPhone,
      href: "/contact",
      className: "text-gray-800 bg-white",
    },
  ];

  const cellClasses = "shadow bg-gray-100 dark:bg-background border rounded-2xl md:rounded-3xl p-3 md:p-5 lg:p-8";

  

  return (
    <div className="grid grid-cols-6 md:grid-cols-8 grid-rows-2 gap-3 md:gap-8 lg:gap-10">
      {/* Socials */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(cellClasses, "col-span-2 row-span-2 aspect-square grid grid-cols-2 gap-2 md:gap-4 lg:gap-6")}
      >
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <Link
              key={social.href}
              href={social.href}
              className={cn("block p-2 md:p-4 rounded-md md:rounded-2xl shadow", social.className)}
            >
              <Icon className="w-full h-full" />
            </Link>
          );
        })}
      </div>

      {/* Currently doing */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(cellClasses, "col-span-4 row-span-2 !bg-[#6338CE] flex flex-col justify-between")}
      >
        <div className="text-gray-200 text-sm md:text-base">Currently</div>
        <div className="md:text-lg font-bold text-white">
          Software engineering intern, <b>Alignable</b>
        </div>
      </div>

      {/* Map */}
      <div
        style={{ rotate: `${randomBetween(-0.75, 0.75)}deg` }}
        className={cn(cellClasses, "hidden md:block col-span-2 row-span-2 !p-0 overflow-hidden relative")}
      >
        <Image className="block dark:hidden" src={"/maps/boston/bos-light.png"} width={1024} height={1024} alt="Map of Boston" />
        <Image className="hidden dark:block" src={"/maps/boston/bos-dark.png"} width={1024} height={1024} alt="Map of Boston" />

        <div className="absolute bottom-0 left-0 right-0 p-2 text-sm md:text-base md:px-4 md:py-2 bg-white/10 backdrop-blur-sm font-bold">
          Boston, MA
        </div>
      </div>
    </div>
  );
}
