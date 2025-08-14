"use client";

import React from "react";

export function Banner() {
  return (
    <div className="w-full flex flex-col items-center gap-2 text-center">
      <div className="relative h-28 w-28 flex items-center justify-center select-none">
        <div
          className="text-6xl animate-[pulse_2s_ease-in-out_infinite]"
          aria-hidden
        >
          🍅
        </div>
        <div className="absolute inset-0 rounded-full animate-[spin_12s_linear_infinite] border-2 border-dashed border-primary/40" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hello World, Tomalito</h1>
      <p className="text-muted-foreground">Sharing the latest of Tomalito</p>
    </div>
  );
}

export default Banner; 