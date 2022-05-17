import type { IconType } from "react-icons";

interface Props {
  icon: IconType;
  className?: string;
}

export const Icon = ({ icon, className = "" }: Props) => {
  const IconElement = icon;
  return <IconElement className={className}></IconElement>;
};
