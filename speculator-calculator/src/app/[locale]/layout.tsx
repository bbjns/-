import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import type { ReactNode } from 'react';
import {ThemeProvider} from "next-themes";
import { TopBar } from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "投机计算器",
  description: "北辰团队专注量化.风险管理",
};

export function generateStaticParams() {
  return [{locale: 'zh'}, {locale: 'en'}, {locale: 'ko'}];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  let messages: Record<string, unknown>;
  try {
    messages = (await import(`../../i18n/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="theme-classic" enableSystem={false}>
            <div className="min-h-dvh flex flex-col">
              <TopBar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
