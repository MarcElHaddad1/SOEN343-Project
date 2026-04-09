import { useEffect } from "react";

const TAWK_SCRIPT_ID = "tawk-chat-script";
const TAWK_SRC = "https://embed.tawk.to/69d810bd84fd891c3894f4ca/1jlq02opb";

export default function CustomerChatWidget({ enabled }) {
  useEffect(() => {
    const tawkGlobal = globalThis;

    if (!enabled) {
      const existing = document.getElementById(TAWK_SCRIPT_ID);
      if (existing) existing.remove();
      if (tawkGlobal.Tawk_API && typeof tawkGlobal.Tawk_API.hideWidget === "function") {
        tawkGlobal.Tawk_API.hideWidget();
      }
      return;
    }

    if (document.getElementById(TAWK_SCRIPT_ID)) {
      if (tawkGlobal.Tawk_API && typeof tawkGlobal.Tawk_API.showWidget === "function") {
        tawkGlobal.Tawk_API.showWidget();
      }
      return;
    }

    tawkGlobal.Tawk_API = tawkGlobal.Tawk_API || {};
    tawkGlobal.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = TAWK_SRC;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, [enabled]);

  return null;
}
