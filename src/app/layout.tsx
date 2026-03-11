import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KANANIMEID - Your Anime & Manga Paradise",
  description: "Read thousands of manga, manhwa, and manhua online with KANANIMEID. Discover trending, popular, and latest anime content.",
  keywords: ["KANANIMEID", "manga", "manhwa", "manhua", "anime", "comics", "reader", "online comics"],
  authors: [{ name: "KANANIMEID Team" }],
  icons: {
    icon: "https://files.catbox.moe/6rk19o.jpg",
  },
  openGraph: {
    title: "KANANIMEID - Your Anime & Manga Paradise",
    description: "Read thousands of manga, manhwa, and manhua online with KANANIMEID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
