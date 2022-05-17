import clsx from "clsx";
import { HTMLAttributes, ReactNode, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { Icon } from "../Icon";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
  variant?: "primary" | "error" | "gray" | "warning";
  open?: boolean;
}

export const Alert = ({
  title,
  children,
  variant = "gray",
  open = true,
  ...props
}: AlertProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(open);

  const toggle = (event: any) => {
    event.preventDefault();
    setIsOpen(!isOpen);
  };

  const classNames = clsx(
    "p-base rounded -m-1",
    {
      "bg-primary-lightest": variant == "primary",
      "bg-gray-100": variant == "gray",
      "bg-warning-light": variant == "warning",
    },
    props.className
  );
  return (
    <>
      {title ? (
        <details open={isOpen} className={classNames}>
          <summary
            onClick={toggle}
            className="list-none flex items-center justify-between"
          >
            <div className="font-bold">{title}</div>
            <Icon icon={FaCaretDown} className={clsx({ hidden: isOpen })} />
          </summary>
          <div className="mt-base space-y-sm">{children}</div>
        </details>
      ) : (
        <div className={clsx(classNames, "space-y-sm")}>{children}</div>
      )}
    </>
  );
};
