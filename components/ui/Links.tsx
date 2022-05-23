import { Button, Spacer } from "@/components";
import { MiniTitle } from "./MiniTitle";

interface Link {
  href: string;
  title: string;
}
const LinkButton = ({ link }: { link: Link }) => {
  return (
    <Button href={link.href} size="sm" className="mt-xs mr-xs" variant="light">
      {link.title}
    </Button>
  );
};

interface LinkProps {
  title?: string;
  showTitle?: boolean;
  links: { href: string; title: string }[];
}

export const Links = ({
  title = "Links",
  showTitle = true,
  links,
}: LinkProps) => {
  return (
    <div>
      {showTitle && <MiniTitle>{title}</MiniTitle>}
      <Spacer size="xs" />
      <div className="flex flex-wrap -mt-xs">
        {links.map((link, index) => (
          <LinkButton key={index} link={link} />
        ))}
      </div>
    </div>
  );
};
