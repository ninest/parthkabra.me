import { Spacer } from "@/components";
import { PostLink } from "@/lib/content/frontmatter";
import { ReactNode } from "react";

interface Props {
  title?: string;
  date?: ReactNode;
  description?: string;
  children?: ReactNode;
  links?: PostLink[];
}
export const PageTitleBanner = (props: Props) => {
  const className = "bg-gray-50 border-y";

  if (props.children) {
    return <div className={className}>{props.children}</div>;
  } else {
    return (
      <div className={className}>
        <div className="space">
          <Spacer size="3xl" />
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <section>
              <h1 className="font-display leading-snug text-5xl font-black text-gray-dark">
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
            </section>
            {props.links && (
              <section className="w-full md:w-auto min-w-[10ch] self-start mt-lg md:mt-base">
                <div className="bg-gray-100 p-xs -m-xs md:p-sm md:-m-sm rounded-lg">
                  <ul className="text-sm text-gray-500 font-medium md:text-right">
                    {props.links.map((postLink) => (
                      <li key={postLink.href} className="my-0.5 md:my-0 ">
                        <a
                          href={postLink.href}
                          className="py-0.5 md:py-0 underline"
                        >
                          {postLink.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
          <Spacer size="3xl" />
        </div>
      </div>
    );
  }
};
