type OgImageCreationParams = { title: string; color: string };

export function createOgImageUrl(params?: Partial<OgImageCreationParams>) {
  let url = `/api/og`;

  const searchParams = new URLSearchParams();
  if (params) searchParams.set("params", Buffer.from(JSON.stringify(params)).toString("base64url"));

  return url + `?` + searchParams.toString();
}

export function getParamsFromUrl(urlString: string): Partial<OgImageCreationParams> {
  const url = new URL(urlString);
  const searchParams = new URLSearchParams(url.search);
  const params = searchParams.get("params")
    ? JSON.parse(Buffer.from(searchParams.get("params")!, "base64url").toString("ascii")) ?? {}
    : {};

  return params;
}
