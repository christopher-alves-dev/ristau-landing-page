import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "../data/preview";
import { getDraft, resetDraft, useDraft } from "./draft";

const DEVICES = {
  desktop: { label: "Computador", width: 1280, height: 800, scale: 0.34 },
  mobile: { label: "Celular", width: 390, height: 780, scale: 0.44 },
};
type Device = keyof typeof DEVICES;

const font = "system-ui, sans-serif";

const button = (active: boolean): CSSProperties => ({
  font: `600 12px ${font}`,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #d4d4d8",
  background: active ? "#18181b" : "#fff",
  color: active ? "#fff" : "#18181b",
  cursor: "pointer",
});

export default function PreviewPanel() {
  const draft = useDraft();
  const frame = useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = useState(true);
  const [device, setDevice] = useState<Device>("desktop");
  const size = DEVICES[device];

  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, draft: getDraft() }, location.origin);
  }, []);

  useEffect(send, [draft, send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && e.data?.type === PREVIEW_READY) send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => resetDraft, []);

  return createPortal(
    <aside
      aria-label="Prévia da capa"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 12px 40px rgb(0 0 0 / 0.2)",
        padding: 12,
        fontFamily: font,
        color: "#18181b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <strong style={{ fontSize: 13, marginRight: "auto", paddingRight: 12 }}>Prévia ao vivo</strong>
        {open &&
          (Object.keys(DEVICES) as Device[]).map((d) => (
            <button key={d} type="button" style={button(d === device)} onClick={() => setDevice(d)}>
              {DEVICES[d].label}
            </button>
          ))}
        <button type="button" style={button(false)} onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Esconder" : "Mostrar"}
        </button>
      </div>
      <div
        style={{
          display: open ? "block" : "none",
          marginTop: 10,
          width: size.width * size.scale,
          height: size.height * size.scale,
          overflow: "hidden",
          borderRadius: 8,
          border: "1px solid #e4e4e7",
        }}
      >
        <iframe
          ref={frame}
          src="/preview"
          title="Prévia da capa no site"
          style={{
            width: size.width,
            height: size.height,
            border: 0,
            transform: `scale(${size.scale})`,
            transformOrigin: "0 0",
          }}
        />
      </div>
      {open && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#71717a", maxWidth: size.width * size.scale }}>
          Só uma prévia: nada vai para o site antes de clicar em Save.
        </p>
      )}
    </aside>,
    document.body,
  );
}
