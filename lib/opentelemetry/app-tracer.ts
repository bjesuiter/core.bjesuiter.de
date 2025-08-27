import { trace } from "npm:@opentelemetry/api@1";
import denoJson from "../../deno.json" with { type: "json" };
export const appTracer = trace.getTracer(denoJson.name, denoJson.version);
