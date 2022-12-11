import { SmartLink } from "@/components";
import { LinkItem } from "@/types";

interface Props {
  items: LinkItem[];
  showDate?: boolean;
}

export const SimpleList = ({ items, showDate = true }: Props) => {
  return (
    <>
      {items.map((item) => (
        <SimpleListItem key={item.href} listItem={item} showDate={showDate} />
      ))}
    </>
  );
};

const SimpleListItem = ({
  listItem,
  showDate,
}: {
  listItem: LinkItem;
  showDate: boolean;
}) => {
  const listItemClassNames =
    "flex items-top justify-between py-xs md:py-1 group space-x-base";

  const children = (
    <>
      <div className="group-hover:text-primary group-hover:underline">
        {listItem.title}
      </div>
      {showDate && (
        <div className="flex-none text-gray-light tabular-nums">
          {listItem.date}
        </div>
      )}
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
