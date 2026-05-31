"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { domains } from "@/lib/schema/main.schema";
import { and, eq } from "drizzle-orm";

export type ActionState = { error?: string; success?: string };

const domainSchema = z.object({
  domain: z.string().trim().regex(/^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, "Enter a valid domain."),
  domainDns: z.string().trim().min(3, "Domain DNS is required."),
  subdomain: z.string().trim().regex(/^[a-zA-Z0-9-]+$/, "Use letters, numbers, and hyphens only."),
  path: z.string().trim().regex(/^\/[a-zA-Z0-9/_-]*$/, "Path must start with / and use URL-safe characters."),
});

export async function addDomain(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = domainSchema.safeParse({
    domain: formData.get("domain"),
    domainDns: formData.get("domainDns"),
    subdomain: formData.get("subdomain"),
    path: formData.get("path"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid domain." };

  await db.insert(domains).values({ licenseId: session.licenseId, ...parsed.data });
  revalidatePath(`/${session.licenseId}/domain-management/add-domain`);
  revalidatePath(`/${session.licenseId}/overview`);
  return { success: "Domain added." };
}

export async function deleteDomain(id: number): Promise<ActionState> {
  const session = await requireSession();
  const parsed = z.coerce.number().int().positive().safeParse(id);
  if (!parsed.success) return { error: "Invalid domain id." };

  await db
    .delete(domains)
    .where(and(eq(domains.id, parsed.data), eq(domains.licenseId, session.licenseId)));

  revalidatePath(`/${session.licenseId}/domain-management/add-domain`);
  revalidatePath(`/${session.licenseId}/overview`);
  return { success: "Domain deleted." };
}
