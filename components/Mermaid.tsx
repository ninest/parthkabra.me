export const colors = {
  blue: "#aaf",
  green: "#afa",
  red: "#faa",
};

export const Mermaid = ({ code, alt = "Diagram" }: any) => {
  const object = {
    code,
    mermaid: {
      theme: "default",
      themeVariables: {
        fontFamily: "Arial",
        fontSize: "16px",
        nodeBorder: "#000",
        mainBkg: "#fff",
        nodeTextColor: "#000",
      },
    },
  };

  let base64 =
    typeof window === "undefined"
      ? Buffer.from(JSON.stringify(object)).toString("base64")
      : // @ts-ignore
        btoa(JSON.stringify(object));

  const url = `https://mermaid.ink/svg/${base64}`;

  return <img src={url} alt={alt} />;
};
