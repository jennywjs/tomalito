"use client";

import React from "react";

const VIDEO_URL = "https://fzfsllwdyyjfptjqiuay.supabase.co/storage/v1/object/public/media/videos/1755369095141-2r40usdm3ro.mp4";

export function Banner() {
  return (
    <div className="w-full flex flex-col items-center gap-3 text-center">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        className="w-full max-w-xl rounded-xl shadow-sm border bg-black/50"
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
        loop
      />
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Hello World, Tomalito</h1>
      <p className="text-muted-foreground">Sharing the latest of Tomalito</p>
    </div>
  );
}

export default Banner; 