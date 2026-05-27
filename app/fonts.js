import localFont from "next/font/local";

export const outfit = localFont({
  src: [
    { path: "../public/fonts/Outfit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Outfit-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Outfit-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-outfit",
});
