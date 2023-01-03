import { HTMLAttributes, ReactNode } from "react";

// TODO: move to lib
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface TitleProps extends HTMLAttributes<HTMLDivElement> {
  level?: number;
  weightClassName?: string;
  hash?: boolean;
  children: string | ReactNode;
}

export const Title = ({
  level = 1,
  children,
  weightClassName = "",
  hash = false,
  ...props
}: TitleProps) => {
  // https://stackoverflow.com/a/59685929/8677167
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const slug =
    typeof children === "string"
      ? slugify(children)
      : // TODO: fix, get inner text of children
        slugify(children?.toString() ?? "");

  return (
    <HeadingTag
      id={slugify(typeof children === "string" ? children : "")}
      href="/"
    >
      {/* {children} */}
      <a href={`#${slug}`} className="block">{children}</a>
    </HeadingTag>
  );
};
