import clsx from "clsx";

export const MarkdocFence = ({
  html,
  lineNumbers,
  lineStart = 1,
  title,
}: {
  html: string;
  lineNumbers: boolean;
  lineStart: number;
  title: string;
}) => {
  return (
    <div className={lineNumbers ? "line-numbers" : ""}>
      {title && (
        <div className="fence-title font-mono text-sm px-5 py-2 rounded-t-lg border-t border-x">
          {title}
        </div>
      )}
      <div
        style={{ ["--start" as any]: lineStart ?? 1 }}
        className={clsx("text-sm overflow-hidden", {
          "rounded-lg": !title,
          "rounded-b-lg": title,
        })}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
