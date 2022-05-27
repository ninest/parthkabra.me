import { SmartLink } from "@/components";
import { LinkItem } from "@/types";

interface Props {
  items: LinkItem[];
}

export const SimpleList = ({ items }: Props) => {
  return (
    <>
      {items.map((item) => (
        <SimpleListItem key={item.href} listItem={item} />
      ))}
    </>
  );
};

const SimpleListItem = ({ listItem }: { listItem: LinkItem }) => {
  const listItemClassNames =
    "flex items-top justify-between py-xs md:py-1 group space-x-base";

  const children = (
    <>
      <div className="group-hover:text-primary group-hover:underline">
        {listItem.title}
      </div>
      <div className="flex-none text-gray-light tabular-nums">
        {listItem.right}
      </div>
    </>
  );

  return listItem.href ? (
    <SmartLink
      href={listItem.href}
      className={listItemClassNames}
      activeClassName="text-primary font-semibold"
    >
      {children}
    </SmartLink>
  ) : (
    <div className={listItemClassNames}>{children}</div>
  );
};
