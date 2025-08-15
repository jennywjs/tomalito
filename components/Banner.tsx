"use client";

import React, { useMemo } from "react";
import Lottie from "lottie-react";

// Minimal friendly animation (a pulsing tomato-like circle with a waving hand)
const animationData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 180,
  w: 256,
  h: 256,
  nm: "tomato",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [128, 128, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [95, 95, 100] },
          { t: 60, s: [100, 100, 100] },
          { t: 120, s: [95, 95, 100] }
        ] }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [140, 140] },
          nm: "Ellipse Path 1",
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.92, 0.2, 0.2, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill 1",
        }
      ],
      ip: 0,
      op: 180,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "hand",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [ { t: 0, s: -10 }, { t: 45, s: 10 }, { t: 90, s: -10 } ] },
        p: { a: 0, k: [190, 86, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [60, 60, 100] }
      },
      shapes: [
        { ty: "rc", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [40, 30] }, r: { a: 0, k: 6 }, nm: "Rect" },
        { ty: "fl", c: { a: 0, k: [1, 0.84, 0.64, 1] }, o: { a: 0, k: 100 }, r: 1, nm: "Fill" }
      ],
      ip: 0,
      op: 180,
      st: 0,
      bm: 0
    }
  ]
} as const;

export function Banner() {
  const data = useMemo(() => animationData, []);

  return (
    <div className="w-full flex flex-col items-center gap-3 text-center">
      <div className="relative h-32 w-32">
        <Lottie animationData={data} loop autoplay />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Hello World, Tomalito</h1>
      <p className="text-muted-foreground">Sharing the latest of Tomalito</p>
    </div>
  );
}

export default Banner; 