"use client";

import Banner from "@/components/Banner";
import { useEffect, useRef, useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Lightweight modal implementation
function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-xl border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">{title}</h3>
          <button aria-label="Close" onClick={onClose} className="text-sm hover:opacity-80">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

type Post = {
  id: string;
  created_at: string;
  author: string;
  title_en: string;
  content_en: string;
  image_url: string | null;
};

type ReactionCounts = Record<string, number>;

type Reply = {
  id: string;
  created_at: string;
  author: string;
  content: string;
  emoji: string | null;
};

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(url);
}

// Only heart reaction
const EMOJIS = ["❤️"] as const;
function getUserKey(): string {
  if (typeof window === "undefined") return "server";
  const key = localStorage.getItem("tomalito_user_key");
  if (key) return key;
  const newKey = `u_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  localStorage.setItem("tomalito_user_key", newKey);
  return newKey;
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [open, setOpen] = useState(false);

  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});

  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, { name: string; content: string }>>({});
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userKey = getUserKey();

  async function loadPosts() {
    try {
      setLoadingPosts(true);
      const res = await fetch("/api/posts", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load posts");
      const list = (json.posts as Post[]) ?? [];
      setPosts(list);
      // Load reactions and replies for each post (best-effort)
      await Promise.all(
        list.map(async (p) => {
          try {
            const r = await fetch(`/api/posts/${p.id}/reactions`);
            const rj = await r.json();
            if (r.ok) {
              setReactions((prev) => ({ ...prev, [p.id]: rj.counts as ReactionCounts }));
              setUserReactions((prev) => ({ ...prev, [p.id]: (rj.userEmojis as string[]) ?? [] }));
            }
          } catch {}
          try {
            const rr = await fetch(`/api/posts/${p.id}/replies`);
            const rrj = await rr.json();
            if (rr.ok) {
              setReplies((prev) => ({ ...prev, [p.id]: (rrj.replies as Reply[]) ?? [] }));
            }
          } catch {}
        })
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setOpen(false);
      await loadPosts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function addReaction(postId: string, emoji: string) {
    // Optimistic update
    const prevCounts = reactions[postId] || {};
    const prevUser = userReactions[postId] || [];
    if (prevUser.includes(emoji)) return;

    const nextCounts: ReactionCounts = { ...prevCounts, [emoji]: (prevCounts[emoji] ?? 0) + 1 };
    setReactions((p) => ({ ...p, [postId]: nextCounts }));
    setUserReactions((p) => ({ ...p, [postId]: [...prevUser, emoji] }));
    setPostErrors((p) => ({ ...p, [postId]: "" }));

    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_key: userKey, emoji }),
      });
      const json = await res.json();
      if (!res.ok) {
        // revert on failure
        setReactions((p) => ({ ...p, [postId]: prevCounts }));
        setUserReactions((p) => ({ ...p, [postId]: prevUser }));
        setPostErrors((p) => ({ ...p, [postId]: json.error || "Failed to like" }));
      }
    } catch (e) {
      setReactions((p) => ({ ...p, [postId]: prevCounts }));
      setUserReactions((p) => ({ ...p, [postId]: prevUser }));
      setPostErrors((p) => ({ ...p, [postId]: e instanceof Error ? e.message : "Failed to like" }));
    }
  }

  async function addReply(postId: string) {
    const inp = replyInputs[postId] || { name: "", content: "" };
    if (!inp.name || !inp.content) {
      setPostErrors((p) => ({ ...p, [postId]: "Please enter your name and a message" }));
      return;
    }
    setPostErrors((p) => ({ ...p, [postId]: "" }));
    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: inp.name, content: inp.content }),
      });
      const json = await res.json();
      if (res.ok) {
        setReplies((prev) => ({ ...prev, [postId]: [ ...(prev[postId] ?? []), json.reply as Reply ] }));
        setReplyInputs((prev) => ({ ...prev, [postId]: { name: "", content: "" } }));
        setReplyOpen((prev) => ({ ...prev, [postId]: false }));
      } else {
        setPostErrors((p) => ({ ...p, [postId]: json.error || "Failed to reply" }));
      }
    } catch (e) {
      setPostErrors((p) => ({ ...p, [postId]: e instanceof Error ? e.message : "Failed to reply" }));
    }
  }

  return (
    <div className="grid gap-8">
      <Banner />

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest updates</h2>
          <Button type="button" onClick={() => setOpen(true)}>+ Add a New Post</Button>
        </div>
        {loadingPosts ? (
          <p className="text-sm text-muted-foreground">Loading posts…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet. Add your first one.</p>
        ) : (
          <ul className="grid gap-3">
            {posts.map((p) => {
              const heartCount = reactions[p.id]?.["❤️"] ?? 0;
              const hearted = userReactions[p.id]?.includes("❤️");
              return (
                <Card key={p.id} className="shadow-sm border border-black/[.06] bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base">{p.title_en}</CardTitle>
                      <button
                        onClick={() => addReaction(p.id, "❤️")}
                        disabled={hearted}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-muted ${hearted ? "opacity-60 cursor-default" : ""}`}
                        title={hearted ? "You liked this" : "Like"}
                      >
                        <span>❤️</span>
                        {heartCount > 0 ? <span className="tabular-nums">{heartCount}</span> : null}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(p.created_at).toLocaleDateString()} • by {p.author}
                    </div>
                    {p.image_url ? (
                      isVideo(p.image_url) ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                          className="mt-2 max-h-72 w-full rounded-md border object-contain bg-muted"
                          src={p.image_url}
                          controls
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt="Post media"
                          className="mt-2 max-h-72 w-full rounded-md border object-cover"
                        />
                      )
                    ) : null}
                    <p className="text-sm mt-3 whitespace-pre-wrap leading-6">{p.content_en}</p>

                    {postErrors[p.id] ? <p className="mt-2 text-sm text-destructive">{postErrors[p.id]}</p> : null}

                    {/* Replies list */}
                    <div className="mt-4 grid gap-2">
                      {(replies[p.id] ?? []).map((r) => (
                        <div key={r.id} className="ml-3 rounded-lg border bg-white/60 px-3 py-2 text-sm">
                          <div className="text-xs text-muted-foreground">
                            {r.author} • {new Date(r.created_at).toLocaleString()}
                          </div>
                          <div className="mt-1 whitespace-pre-wrap leading-6">
                            {r.emoji ? `${r.emoji} ` : null}
                            {r.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply composer */}
                    <div className="mt-2">
                      {!replyOpen[p.id] ? (
                        <Button type="button" variant="outline" onClick={() => setReplyOpen((prev) => ({ ...prev, [p.id]: true }))}>
                          Reply
                        </Button>
                      ) : (
                        <div className="mt-2 grid gap-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Your name"
                              value={replyInputs[p.id]?.name ?? ""}
                              onChange={(e) => setReplyInputs((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] ?? { name: "", content: "" }), name: e.target.value } }))}
                            />
                          </div>
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyInputs[p.id]?.content ?? ""}
                            onChange={(e) => setReplyInputs((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] ?? { name: "", content: "" }), content: e.target.value } }))}
                          />
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => setReplyOpen((prev) => ({ ...prev, [p.id]: false }))}>Cancel</Button>
                            <Button type="button" onClick={() => addReply(p.id)}>Post reply</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ul>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Add a New Post">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
          <Input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              {file ? "Change media" : "Upload photo or video"}
            </Button>
            {file ? <span className="text-sm text-muted-foreground truncate max-w-[240px]">{file.name}</span> : null}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Publish post"}
            </Button>
          </div>
          {message ? <p className="text-sm">{message}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
