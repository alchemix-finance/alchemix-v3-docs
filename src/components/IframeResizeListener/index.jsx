import { useEffect } from "react";

export default function IframeResizeListener() {
  useEffect(() => {
    function onMessage(e) {
      if (e.data && e.data.type === "iframe-resize") {
        document.querySelectorAll("iframe").forEach((f) => {
          try {
            if (f.contentWindow === e.source)
              f.style.height = e.data.height + 2 + "px";
          } catch (x) {}
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return null;
}
