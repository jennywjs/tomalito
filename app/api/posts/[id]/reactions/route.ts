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

function extractPostId(url: string): string | null {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  // Expect: ["api","posts",":id","reactions"]
  const idx = parts.findIndex((p) => p === "posts");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

export async function GET(request: Request) {
  try {
    const postId = extractPostId(request.url);
    if (!postId) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    const supabase = getServerSupabaseClient();

    const { data, error } = await supabase
      .from("reactions")
      .select("emoji, user_key")
      .eq("post_id", postId);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.emoji] = (counts[row.emoji] ?? 0) + 1;
    }

    return NextResponse.json({ counts, userEmojis: [] });
  } catch (error: unknown) {
    const message = toErrorMessage(error, "Failed to fetch reactions");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const postId = extractPostId(request.url);
    if (!postId) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    const body = await request.json();
    const { user_key, emoji } = body ?? {};
    if (!user_key || !emoji) {
      return NextResponse.json({ error: "user_key and emoji are required" }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();

    const { error } = await supabase
      .from("reactions")
      .insert({ post_id: postId, user_key, emoji })
      .select();

    if (error && !String(error.message).includes("duplicate key")) throw error;

    const { data: rows, error: fetchErr } = await supabase
      .from("reactions")
      .select("emoji")
      .eq("post_id", postId);
    if (fetchErr) throw fetchErr;

    const counts: Record<string, number> = {};
    for (const row of rows ?? []) counts[row.emoji] = (counts[row.emoji] ?? 0) + 1;

    return NextResponse.json({ ok: true, counts });
  } catch (error: unknown) {
    const message = toErrorMessage(error, "Failed to add reaction");
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 