import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "הנקודה הטובה",
  description: "מקום עדין לנשום, לזכור את הטוב ולבחור צעד קטן לחיים.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body>{children}</body></html>;
}
