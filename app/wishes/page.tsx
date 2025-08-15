"use client";

import { useEffect, useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Wish = {
  id: string;
  created_at: string;
  name: string;
  message_en: string;
};

export default function WishesPage() {
  const [name, setName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadWishes() {
    try {
      setLoading(true);
      const res = await fetch("/api/wishes", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load wishes");
      setWishes(json.wishes as Wish[]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message_en: messageText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit wish");

      setName("");
      setMessageText("");
      setStatus("Thanks! Your wish was submitted.");
      await loadWishes();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Well Wishes</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading wishes…</p>
        ) : wishes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No wishes yet. Be the first to leave one below.</p>
        ) : (
          <ul className="grid gap-3">
            {wishes.map((w) => (
              <Card key={w.id}>
                <CardHeader>
                  <CardTitle className="text-base">From {w.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{w.message_en}</p>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Leave a message</h2>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea placeholder="Your message" value={messageText} onChange={(e) => setMessageText(e.target.value)} required />
          <Button type="submit" disabled={submitting} className="w-fit">
            {submitting ? "Submitting..." : "Submit"}
          </Button>
          {status ? <p className="text-sm">{status}</p> : null}
        </form>
      </section>
    </div>
  );
} 