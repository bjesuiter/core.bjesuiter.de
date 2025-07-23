/// <reference lib="deno.unstable" />
export const kv = await Deno.openKv();

// TODO: move this logging table to turso

export async function logAuthorizedDDNSUpdateRequest(data: {
  url: string;
  authorized_user: string | undefined;
  forHost: string;
  forIp: string;
  sourceIp: string;
}) {
  const forHost = data.forHost;
  await kv.set(["ddns", "update", forHost, "latest"], {
    ...data,
    timestamp: new Date().toISOString(),
  });
}
