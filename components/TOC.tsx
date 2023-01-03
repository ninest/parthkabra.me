import { Alert, MiniTitle, Spacer } from "@/components";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Heading {
  slug: string;
  text: string;
  level: number;
}

interface Props {
  listParentClassName?: string;
  listItemClassName?: string;
}

const TOCLinks = ({
  listParentClassName = "",
  listItemClassName = "",
}: Props) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const router = useRouter();

  useEffect(() => {
    setHeadings([]);
    const article = document.getElementsByTagName("article")[0];
    if (article)
      for (let e of article.children as any) {
        // TODO: improve
        const element: HTMLElement = e;

        if (["H2", "H3", "H4"].includes(element.tagName)) {
          const heading: Heading = {
            slug: element.id,
            text: element.innerText,
            level: parseInt(element.tagName[1]) - 1,
          };

          setHeadings((previousHeadings) => [...previousHeadings, heading]);
        }
      }
    /* Update TOC on page change */
  }, [router.asPath]);

  return (
    <>
      <ul className={listParentClassName}>
        {headings &&
          headings.map((heading,index) => (
            <li key={index} className={listItemClassName}>
              <a
                className={clsx("block", {
                  "ml-base": heading.level === 2,
                  "ml-lg": heading.level === 3,
                })}
                href={`#${heading.slug}`}
              >
                {heading.text}
              </a>
            </li>
          ))}
      </ul>
    </>
  );
};

export const TOC = () => {
  return (
    <Alert title="Contents" size="sm" border open={false}>
      <TOCLinks
        listParentClassName="space-y-sm"
        listItemClassName="text-sm text-gray"
      />
    </Alert>
    // <div className="rounded-md">
    //   <MiniTitle>Contents</MiniTitle>
    //   <Spacer size="xs" />
    //   <TOCLinks
    //     listParentClassName="space-y-sm"
    //     listItemClassName="text-sm text-gray"
    //   />
    // </div>
  );
};
