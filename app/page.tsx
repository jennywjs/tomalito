"use client";

import Banner from "@/components/Banner";
import { useState, FormEvent } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      let image_url: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "posts");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Upload failed");
        image_url = uploadJson.url as string;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, title_en: title, content_en: content, image_url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create post");

      setTitle("");
      setContent("");
      setAuthor("");
      setFile(null);
      setMessage("Post submitted!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8">
      <Banner />

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Latest updates</h2>
        <p className="text-sm text-muted-foreground">Mock list. Newly submitted posts will be visible after we wire the list to Supabase.</p>
        <ul className="grid gap-3">
          <li className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">2025-01-01 • by Jenny</div>
            <div className="font-medium">Kicking off Tomalito</div>
            <p className="text-sm mt-1">This is a mock post. Real posts will appear here once saved.</p>
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Add a new post</h2>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="border rounded-md px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="border rounded-md px-3 py-2 min-h-28" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
          <div className="flex gap-3 flex-col sm:flex-row">
            <input className="border rounded-md px-3 py-2 flex-1" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            <input className="border rounded-md px-3 py-2 flex-1" placeholder="Image URL (optional)" value={""} readOnly hidden />
          </div>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file ? <span className="text-sm text-muted-foreground">{file.name}</span> : null}
          </div>
          <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground rounded-md px-4 py-2 w-fit disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit"}
          </button>
          {message ? <p className="text-sm">{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
