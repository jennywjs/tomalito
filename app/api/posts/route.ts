import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, created_at, author, title_en, title_zh, content_en, content_zh, image_url, published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ posts: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      author,
      title_en,
      content_en,
      title_zh = null,
      content_zh = null,
      image_url = null,
      published = true,
    } = body ?? {};

    if (!author || !title_en || !content_en) {
      return NextResponse.json({ error: "author, title_en, and content_en are required" }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({ author, title_en, content_en, title_zh, content_zh, image_url, published })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 