import { formatDateFull } from "@/lib/date";
import { Spacer } from "@/components";
import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  title?: string;
  date?: ReactNode;
  description?: string;
  children?: ReactNode;
}
export const PageTitleBanner = (props: Props) => {
  const className = "bg-gray-50 border-y";

  if (props.children) {
    return <div className={className}>{props.children}</div>;
  } else {
    return (
      <div className={clsx(className, "px-xs", "text-center")}>
        <Spacer size="3xl" />
        <h1 className="font-display text-5xl font-black text-gray-dark">
          {props.title}
        </h1>
        <Spacer size="sm" />

        <p className="font-medium text-gray">{props.description}</p>

        <Spacer size="xs" />

        {props.date && (
          <div className="text-sm text-gray-light font-medium">
            {props.date}
          </div>
        )}
        <Spacer size="3xl" />
      </div>
    );
  }
};
