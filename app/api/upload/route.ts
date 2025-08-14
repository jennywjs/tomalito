import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "uploads";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
    const supabase = getServerSupabaseClient();

    const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
    const safeExt = ext ? `.${ext.toLowerCase()}` : "";
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(key, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(key);

    return NextResponse.json({ url: publicUrl.publicUrl, path: key });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 