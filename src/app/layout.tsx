import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "잡담회 바이브코딩 데모데이",
  description:
    "잡담회 바이브코딩 데모데이에서 만든 결과물을 공유하고, 재미·완성도·문제해결 가치로 서로 피드백하는 공간입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/*
          Noto Sans KR은 한글 subset이 수천 개 블록으로 쪼개져 있어
          next/font로 감싸면 Turbopack 빌드가 깨진다.
          디자인 시스템 원본과 동일하게 Google Fonts를 직접 링크한다.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line py-8 mt-16">
          <div className="mx-auto max-w-6xl px-4 md:px-8 type-caption text-ink-3">
            잡담회 바이브코딩 데모데이 · 편하게 보고 가볍게 남겨주세요
          </div>
        </footer>
      </body>
    </html>
  );
}
