"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { proxies, proxySettings } from "@/lib/schema/main.schema";

export type ActionState = { error?: string; success?: string };

const ipv4 = z.string().refine((value) => {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}, "Enter a valid IPv4 address.");

const proxySchema = z.object({
  proxyType: z.enum(["http", "https", "socks4", "socks5"]),
  username: z.string().trim().min(2, "Username must be at least 2 characters."),
  password: z.string().min(4, "Password must be at least 4 characters."),
  ipAddress: ipv4,
  port: z.coerce.number().int().min(1).max(65535),
});

const settingsSchema = z.object({
  useProxy: z.enum(["enabled", "disabled"]),
  rotationMethod: z.enum(["sticky", "per-request", "interval"]),
});

export async function saveProxySettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = settingsSchema.safeParse({
    useProxy: formData.get("useProxy"),
    rotationMethod: formData.get("rotationMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };

  await db
    .insert(proxySettings)
    .values({ licenseId: session.licenseId, ...parsed.data, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: proxySettings.licenseId,
      set: { ...parsed.data, updatedAt: new Date().toISOString() },
    });

  revalidatePath("/proxy-management/settings");
  return { success: "Proxy settings saved." };
}

export async function addProxy(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = proxySchema.safeParse({
    proxyType: formData.get("proxyType"),
    username: formData.get("username"),
    password: formData.get("password"),
    ipAddress: formData.get("ipAddress"),
    port: formData.get("port"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid proxy." };

  await db.insert(proxies).values({ licenseId: session.licenseId, ...parsed.data });
  revalidatePath("/proxy-management/add-proxy");
  revalidatePath("/overview");
  return { success: "Proxy added." };
}
