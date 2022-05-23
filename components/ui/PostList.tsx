import { SmartLink, Spacer } from "@/components/";
import { allCats } from "@/content/map";
import { LinkItem } from "@/types";
import clsx from "clsx";

interface Props {
  items: LinkItem[];
  bubble?: boolean;
  showCat?: boolean;
}

export const PostList = ({ items, bubble = false, showCat = false }: Props) => {
  return (
    <>
      {items.map((item) => (
        <PostListItem
          key={item.href}
          listItem={item}
          bubble={bubble}
          showCat={showCat}
        ></PostListItem>
      ))}
    </>
  );
};

const PostListItem = ({
  listItem,
  bubble = false,
  showCat = false,
}: {
  listItem: LinkItem;
  bubble?: boolean;
  showCat?: boolean;
}) => {
  const cat = allCats[listItem.cat!];
  return (
    <SmartLink
      href={listItem.href}
      className={clsx("block hover:bg-gray-100 rounded-md", {
        "px-sm py-xs": !bubble,
        "-mx-sm -my-xs px-sm py-xs": bubble,
      })}
      activeClassName="bg-gray-100"
    >
      <div className="font-medium">
        {showCat && <span className="text-gray-light">{cat.title}{" / "}</span>}
        {listItem.title}
      </div>
      <Spacer size="xs" />
      <div className="text-gray text-sm">{listItem.description}</div>
    </SmartLink>
  );
};
