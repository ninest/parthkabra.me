import { AnchorHTMLAttributes } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import clsx from "clsx";

interface SmartLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  underline?: boolean;
  activeClassName?: string;
}

export const SmartLink = ({
  href,
  activeClassName,
  underline = false,
  ...props
}: SmartLinkProps) => {
  const router = useRouter();
  const className = clsx(props.className, {
    underline,
    [`${activeClassName}`]: router.asPath == href.split("?")[0],
  });

  if (href[0] === "/" || href[0].includes("parthkabra.me"))
    return (
      <Link href={href}>
        <a {...props} className={className} />
      </Link>
    );

  return (
    <a
      {...props}
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer"
    />
  );
};
