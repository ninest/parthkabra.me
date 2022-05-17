import { Size } from "@/types";
import clsx from "clsx";
import { HTMLAttributes, ReactNode } from "react";
import type { IconType } from "react-icons";
import { Icon } from "../Icon";
import { SmartLink } from "../SmartLink";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  iconLeft?: IconType;
  iconRight?: IconType;
  href?: string;
  className?: string;
  children?: ReactNode;
  size?: Size;
  variant?: "default" | "light" | "ghost";
  type?: "button" | "reset" | "submit";
  disabled?: boolean;
}

export const Button = ({
  iconLeft,
  iconRight,
  href,
  size = "base",
  variant = "default",
  type,
  children,
  disabled = false,
  ...props
}: Props) => {
  const className = clsx(
    {
      "px-base py-sm": size == "base" && variant != "ghost",
      "px-sm py-xs text-sm": size == "sm" && variant != "ghost",
      "px-sm py-xs text-xs": size == "xs" && variant != "ghost",
    },
    {
      "-mx-base -my-base -py-sm px-base py-sm":
        size == "base" && variant == "ghost",
      "-mx-sm -my-xs px-sm py-xs text-sm": size == "sm" && variant == "ghost",
      "-mx-sm -my-xs px-sm py-xs text-xs": size == "xs" && variant == "ghost",
    },
    {
      "bg-gray-lightest text-gray": variant == "default",
      "bg-gray-100 text-gray": variant == "light",
    },
    {
      "hover:bg-gray-100": variant == "ghost",
    },
    "rounded-md font-medium text-gray flex items-center justify-center space-x-sm",
    props.className
  );

  const Element = (
    <>
      {iconLeft ? <Icon icon={iconLeft} /> : null}
      {children && <div>{children}</div>}
      {iconRight ? <Icon icon={iconRight} /> : null}
    </>
  );

  return href ? (
    <SmartLink href={href} className={className}>
      {Element}
    </SmartLink>
  ) : (
    <button
      type={type}
      disabled={disabled}
      onClick={props.onClick}
      className={className}
    >
      {Element}
    </button>
  );
};
