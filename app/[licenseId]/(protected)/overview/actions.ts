"use server";

import { requireSession } from '@/lib/auth';
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { mainDb } from "@/lib/db";

import {
  clients,
  credentials,
  clientCookies,
} from "@/lib/schema/main.schema";

export type ActionState = { error?: string; success?: string; message?: string };


export async function deleteLog(sessionId: string) {
  const session = await requireSession();
  if (!sessionId) return { error: "Invalid session id." };

  try {
    await mainDb.transaction(async (tx) => {
      await tx
        .delete(clientCookies)
        .where(eq(clientCookies.sessionId, sessionId));

      await tx
        .delete(credentials)
        .where(eq(credentials.sessionId, sessionId));

      await tx
        .delete(clients)
        .where(eq(clients.sessionId, sessionId));
    });

    // revalidatePath("/admin");
    revalidatePath(`/${session.licenseId}/overview`);

    return {
      success: "Log deleted successfully",
      message: "Log deleted successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to delete log",
      message: "Failed to delete log",
    };
  }
}