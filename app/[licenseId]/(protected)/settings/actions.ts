// "use server";

// import { configDb } from "../../lib/db";
// import { revalidatePath } from "next/cache";

// export async function updateSettings(formData: FormData) {
//   const keys = ['BOT_TOKEN', 'CHAT_ID', 'H_KEY', 'R_KEY', 'LANDING_URL'];
  
//   for (const key of keys) {
//     const value = formData.get(key);
//     if (value !== null) {
//       configDb.setSetting(key, value.toString());
//     }
//   }
  
//   revalidatePath("/settings");
//   return { success: true };
// }

"use server";

import { settings } from "@/lib/schema/config.schema";
import { configDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

export async function updateSettings(formData: FormData) {
  await requireSession();
  const keys = [
    "BOT_TOKEN",
    "CHAT_ID",
    "H_KEY",
    "R_KEY",
    "LANDING_URL",
  ];

  for (const key of keys) {
    const value = formData.get(key)?.toString() || "";

    await configDb
      .insert(settings)
      .values({
        key,
        value,
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value,
        },
      });
  }

  revalidatePath("/settings");

  return {
    success: true,
  };
}
