"use client";

import { useState, FormEvent } from "react";

export default function WishesPage() {
  const [name, setName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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
        <ul className="grid gap-3">
          <li className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">2025-01-01</div>
            <div className="font-medium">From Auntie M</div>
            <p className="text-sm mt-1">Can’t wait to meet you, little tomato!</p>
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Leave a message</h2>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="border rounded-md px-3 py-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea className="border rounded-md px-3 py-2 min-h-28" placeholder="Your message" value={messageText} onChange={(e) => setMessageText(e.target.value)} required />
          <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground rounded-md px-4 py-2 w-fit disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit"}
          </button>
          {status ? <p className="text-sm">{status}</p> : null}
        </form>
      </section>
    </div>
  );
} 