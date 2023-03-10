export function createJSONResponse(
  // deno-lint-ignore no-explicit-any
  body: any,
  status = 200,
  init: ResponseInit = {},
) {
  return new Response(JSON.stringify(body), {
    ...init,
    status,
    headers: {
      ...(init.headers ?? {}),
      "Content-Type": "application/json",
    },
  });
}
