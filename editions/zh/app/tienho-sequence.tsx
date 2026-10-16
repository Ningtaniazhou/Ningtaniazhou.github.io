"use client";
import { asset } from "./asset-path";


import { useEffect, useRef } from "react";

type Props = {
  onComplete: () => void;
};

export default function TienhoSequence({ onComplete }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const receivePrototypeEvent = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "tienho:complete") onComplete();
    };

    window.addEventListener("message", receivePrototypeEvent);
    return () => window.removeEventListener("message", receivePrototypeEvent);
  }, [onComplete]);

  return (
    <iframe
      ref={frameRef}
      className="tienho-prototype-frame"
      src={asset("/tienho-prototype/index.html?embedded=1")}
      title="天河村"
      allow="autoplay"
    />
  );
}
