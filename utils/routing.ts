/**
 * Usage from a route handler:
 *
 * ```ts
 * return redirectToLogin();
 * ```
 */
export function redirectToLogin() {
  const headers = new Headers();
  headers.set("location", "/login");
  return new Response(null, {
    status: 303,
    headers,
  });
}
