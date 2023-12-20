"use client";

export function Mermaid({ code, possibleHeightClassName }: { code: string; possibleHeightClassName?: string }) {
  console.log(code)
  const createParams = ({ darkMode }: { darkMode: boolean }) => ({
    code,
    mermaid: {
      theme: "base",
      themeVariables: {
        darkMode,
      },
    },
  });
  const lightParams = createParams({ darkMode: false });
  const darkParams = createParams({ darkMode: true });

  const lightBase64 = Buffer.from(JSON.stringify(lightParams)).toString("base64");
  const darkBase64 = Buffer.from(JSON.stringify(darkParams)).toString("base64");

  return (
    <div>
      <img src={`https://mermaid.ink/svg/${lightBase64}`} alt="Diagram" className="block dark:hidden" />
      <img src={`https://mermaid.ink/svg/${darkBase64}`} alt="Diagram" className="hidden dark:block" />
    </div>
  );
}
