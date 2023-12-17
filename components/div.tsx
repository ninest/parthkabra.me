import { ComponentProps } from "react";

type DivProps = ComponentProps<"div">;

export function Div(props: DivProps) {
  return <div {...props} />;
}
