import { Icon, SmartLink } from "@/components";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { FaFileAlt } from "react-icons/fa";

export const Navbar = () => {
  return (
    <header className="space font-display flex items-center justify-between border-b">
      <div className="text-gray font-medium">Parth Kabra</div>
      <nav>
        <ul className="flex">
          <li>
            <NavLink href="/blog">Blog</NavLink>
          </li>
          <li>
            <NavLink href="/contact">Contact</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <SmartLink
      href={href}
      className="py-xs px-sm rounded-md text-gray text-sm hover:bg-gray-200 transition-colors flex items-center"
    >
      <Icon icon={FaFileAlt} className="text-gray-light mr-xs"></Icon>
      {children}
    </SmartLink>
  );
};
