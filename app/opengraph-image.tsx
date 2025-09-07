import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Gul Tekin - Mekanik Mühendislik ve AI Çözümleri";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to right, #0C0D0D, #1a1a1a)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Gul Tekin
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#00E599",
          }}
        >
          Mekanik Mühendislik & AI Çözümleri
        </div>
        <div
          style={{
            fontSize: 24,
            marginTop: 20,
            opacity: 0.8,
          }}
        >
          Vercel + Neon PostgreSQL + Groq AI
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}