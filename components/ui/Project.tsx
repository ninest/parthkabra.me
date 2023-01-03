import { GoRepoForked } from "react-icons/go";
import { FaRegStar, FaStar } from "react-icons/fa";
import { Icon } from "../Icon";
import { SmartLink } from "../SmartLink";
import { Spacer } from "../Spacer";
import clsx from "clsx";

export const ProjectLink = ({
  project,
  highlighted = false,
}: {
  project: any;
  highlighted?: boolean;
}) => {
  return (
    <SmartLink
      href={`/project/${project.slug}`}
      className={clsx(
        "border rounded-md p-lg",
        // To push icons to bottom
        "flex flex-col justify-between gap-base"
      )}
    >
      <section>
        <h3 className="font-bold text-xl">{project.title}</h3>
        <Spacer size="xs" />
        <p className="text-gray-light text-sm">{project.description}</p>
      </section>

      <div className="text-gray-light flex items-center space-x-base">
        {highlighted ? (
          <Icon icon={FaStar} className="text-primary-light" />
        ) : (
          <Icon icon={FaRegStar} />
        )}
        <Icon icon={GoRepoForked} />
      </div>
    </SmartLink>
  );
};
