import clsx from "clsx";
import { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";
import { Icon } from "../Icon";

export const Sidebar = ({
  isOpen,
  close,
  sections = [],
}: {
  isOpen: boolean;
  close: () => void;
  sections?: ReactNode[];
}) => {
  return (
    <div
      className={clsx(
        "fixed w-80 top-0 right-0 h-screen bg-light border-l transition-transform",
        {
          "translate-x-96": !isOpen,
        }
      )}
    >
      <div className="flex justify-end p-sm border-b">
        <button
          onClick={close}
          className="border border-gray-lightest p-xs rounded-md"
        >
          <Icon icon={FaTimes} className="text-gray" />
        </button>
      </div>

      <div className="h-full overflow-scroll">
        {sections &&
          sections.map((section, index) => (
            <section key={index} className="border-b p-sm">
              {section}
            </section>
          ))}
      </div>
    </div>
  );
};
