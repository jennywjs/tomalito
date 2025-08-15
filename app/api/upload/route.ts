import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

function hasMessage(e: unknown): e is { message: string } {
  return typeof (e as { message?: unknown })?.message === "string";
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (hasMessage(error)) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const folder = (formData.get("folder") as string) || "uploads";

    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const file = fileEntry as File;

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
    const supabase = getServerSupabaseClient();

    const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
    const safeExt = ext ? `.${ext.toLowerCase()}` : "";
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = file.type || undefined;

    async function uploadOnce() {
      return await supabase.storage
        .from(bucket)
        .upload(key, bytes, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });
    }

    let { error: uploadError } = await uploadOnce();

    if (uploadError && /bucket not found/i.test(String(uploadError.message))) {
      const { error: createErr } = await supabase.storage.createBucket(bucket, {
        public: true,
      });
      if (createErr) throw createErr;
      const retry = await uploadOnce();
      uploadError = retry.error;
    }

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(key);

    return NextResponse.json({ url: publicUrl.publicUrl, path: key, bucket });
  } catch (error: unknown) {
    const message = toErrorMessage(error, "Upload failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 