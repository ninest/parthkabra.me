import { GoRepoForked } from "react-icons/go";
import { FaRegStar } from "react-icons/fa";
import { Project } from "@/.contentlayer/generated";
import { Icon } from "../Icon";
import { SmartLink } from "../SmartLink";
import { Spacer } from "../Spacer";
import clsx from "clsx";

export const ProjectLink = ({
  project,
  highlighted = false,
}: {
  project: Project;
  highlighted?: boolean;
}) => {
  return (
    <SmartLink
      href={`/project/${project.slug}`}
      className={clsx("border rounded-md p-lg", { "bg-primary-50": highlighted })}
    >
      <h3 className="font-bold text-xl">{project.title}</h3>
      <Spacer size="xs" />
      <p className="text-gray-light">{project.description}</p>
      <Spacer size="base" />
      <div className="text-gray-light flex items-center space-x-base">
        <Icon icon={FaRegStar} />
        <Icon icon={GoRepoForked} />
      </div>
    </SmartLink>
  );
};
