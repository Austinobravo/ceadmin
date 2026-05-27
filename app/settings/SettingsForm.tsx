"use client";

import { useTransition, useState } from "react";
import { updateSettings } from "./actions";
import { Save, CheckCircle2 } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: Record<string, string> }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateSettings(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    });
  }

  const fields = [
    { id: "BOT_TOKEN", label: "Telegram Bot Token", placeholder: "123456789:ABCdefGHIjkl..." },
    { id: "CHAT_ID", label: "Telegram Chat ID", placeholder: "-1001234567890" },
    { id: "H_KEY", label: "H-Captcha Key", placeholder: "Optional key for hCaptcha" },
    { id: "R_KEY", label: "ReCaptcha Key", placeholder: "Optional key for reCaptcha" },
    { id: "LANDING_URL", label: "Landing URL Redirect", placeholder: "https://example.com" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-300 mb-2">
            {field.label}
          </label>
          <input
            type="text"
            id={field.id}
            name={field.id}
            defaultValue={initialData[field.id]}
            placeholder={field.placeholder}
            className="w-full bg-[#161616] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      ))}

      <div className="pt-4 border-t border-[#222] flex items-center justify-between">
        {success ? (
          <div className="flex items-center text-emerald-500 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Settings saved successfully
          </div>
        ) : <div />}
        
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}
