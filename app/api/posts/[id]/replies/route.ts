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
      .from("replies")
      .select("id, created_at, author, content, emoji")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ replies: data ?? [] });
  } catch (error: unknown) {
    const message = toErrorMessage(error, "Failed to fetch replies");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const postId = extractPostId(request.url);
    if (!postId) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });

    const body = await request.json();
    const { author, content, emoji = null } = body ?? {};
    if (!author || !content) {
      return NextResponse.json({ error: "author and content are required" }, { status: 400 });
    }
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("replies")
      .insert({ post_id: postId, author, content, emoji })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ reply: data }, { status: 201 });
  } catch (error: unknown) {
    const message = toErrorMessage(error, "Failed to create reply");
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 