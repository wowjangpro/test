import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhisperBoard - 익명 커뮤니티",
    template: "%s | WhisperBoard",
  },
  description: "계정 없이 자유롭게 의견을 나누는 완전한 익명 게시판 플랫폼. 랜덤 닉네임으로 안전하게 소통하세요.",
  keywords: ["익명 게시판", "익명 커뮤니티", "자유 게시판", "WhisperBoard", "익명 토론", "자유로운 의견 공유"],
  authors: [{ name: "WhisperBoard Team" }],
  creator: "WhisperBoard",
  publisher: "WhisperBoard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "WhisperBoard - 익명 커뮤니티",
    description: "계정 없이 자유롭게 의견을 나누는 완전한 익명 게시판 플랫폼",
    siteName: "WhisperBoard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WhisperBoard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhisperBoard - 익명 커뮤니티",
    description: "계정 없이 자유롭게 의견을 나누는 완전한 익명 게시판 플랫폼",
    images: ["/og-image.png"],
    creator: "@whisperboard",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
