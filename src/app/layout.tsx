import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { THEME_INIT_SCRIPT } from "@/lib/theme"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { UnsavedGuard } from "@/components/layout/unsaved-guard"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Целеполагание",
    template: "%s · Целеполагание",
  },
  description: "Система целеполагания и оценки результативности",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-page">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
        <UnsavedGuard />
      </body>
    </html>
  )
}
