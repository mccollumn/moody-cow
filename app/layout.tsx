import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import StoreProvider from "@/app/StoreProvider";
import SessionProvider from "@/app/SessionProvider";
import theme from "@/theme";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Moody Cow - AI-Powered Music for Your Mood",
  description:
    "Discover music that matches your mood with AI-powered facial expression and sentiment analysis. Dynamic playlists that adapt to how you feel.",
  keywords:
    "mood music, AI music recommendation, facial expression analysis, sentiment analysis, dynamic playlists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <SessionProvider>
            <ThemeProvider theme={theme}>
              <StoreProvider>{children}</StoreProvider>
            </ThemeProvider>
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
