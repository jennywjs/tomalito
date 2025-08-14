import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("wishes")
      .select("id, created_at, name, message_en, message_zh, approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ wishes: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch wishes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message_en, message_zh = null, approved = true } = body ?? {};

    if (!name || !message_en) {
      return NextResponse.json({ error: "name and message_en are required" }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("wishes")
      .insert({ name, message_en, message_zh, approved })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ wish: data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create wish";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 