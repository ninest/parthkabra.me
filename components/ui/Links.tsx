import { Button, Spacer } from "@/components";

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
  links: { href: string; title: string }[];
}

export const Links = ({ title = "Links", links }: LinkProps) => {
  return (
    <div>
      <h3 className="font-semibold text-sm uppercase">{title}</h3>
      <Spacer size="xs" />
      <div className="flex flex-wrap -mt-xs">
        {links.map((link,index) => (
          <LinkButton key={index} link={link} />
        ))}
      </div>
    </div>
  );
};
