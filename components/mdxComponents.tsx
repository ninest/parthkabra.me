import clsx from "clsx";
import Image from "next/image";
import { Alert, Mermaid, SmartLink } from "@/components";

export const mdxComponents = {
  Image: (props: any) => {
    const src = `/notouchy${props.src}`;
    const className = clsx("rounded-md", props.className);

    const border = props.border;
    const narrower = props.narrower;

    return (
      <div
        className={clsx("flex justify-center bg-gray-50 rounded-md", {
          "border border-gray-200": border,
          "border-0 border-transparent": !border,
          "md:w-4/6 m-auto": narrower,
        })}
      >
        <Image className={className} {...props} src={src} />
      </div>
    );
  },
  a: (props: any) => {
    return (
      <SmartLink href={props.href} className="underline hover:text-primary">
        {props.children}
      </SmartLink>
    );
  },
  Alert: (props: any) => <Alert {...props} />,
};
