/// <reference lib="deno.unstable" />
export const kv = await Deno.openKv();

export async function logAuthorizedDDNSUpdateRequest(data: {
  url: string;
  authorized_user: string | undefined;
  forHost: string;
  forIp: string;
  sourceIp: string;
}) {
  const forHost = data.forHost;
  await kv.set(["ddns", "update", forHost, new Date().toISOString()], data);
}
