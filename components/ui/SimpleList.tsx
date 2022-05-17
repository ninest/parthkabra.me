import { SmartLink } from "@/components";

interface SimpleListItem {
  text: string;
  href?: string;
  side?: string;
}
interface Props {
  items: SimpleListItem[];
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

const SimpleListItem = ({ listItem }: { listItem: SimpleListItem }) => {
  const listItemClassNames =
    "flex items-center justify-between py-xs md:py-1 group space-x-base";

  const children = (
    <>
      <div className="group-hover:text-primary group-hover:underline">{listItem.text}</div>
      <div className="flex-none text-gray-light tabular-nums">{listItem.side}</div>
    </>
  );

  return listItem.href ? (
    <SmartLink href={listItem.href} className={listItemClassNames}>
      {children}
    </SmartLink>
  ) : (
    <div className={listItemClassNames}>{children}</div>
  );
};
