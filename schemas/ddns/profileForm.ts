import z from "zod/v4";

export const CheckboxSchema = z.literal("on").optional().transform((value) =>
  value === "on"
);

export const DnsRecordSchema = z.object({
  record_name: z.string().min(1),
  zone_id: z.string().min(1),
});

export const DDNSProfileFormSchema = z.object({
  profile_name: z.string().min(1),
  connected_service_id: z.uuid(),
  dns_records: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const result = z.array(DnsRecordSchema).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid DNS records format",
        });
        return z.NEVER;
      }
      return result.data;
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "DNS records must be valid JSON",
      });
      return z.NEVER;
    }
  }),
  allowed_user_agent: z.string().optional(),
  ipv4_enabled: CheckboxSchema,
  ipv6_enabled: CheckboxSchema,
});
