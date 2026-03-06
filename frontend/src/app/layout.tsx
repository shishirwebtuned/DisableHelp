import type { Metadata } from "next";
import "./globals.css";

import { ReduxProvider } from "@/redux/provider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Disable Help Platform",
  description: "NDIS-style marketplace like Mable",
};

export default function RootLayout({ 
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ReduxProvider>
            {children}
          </ReduxProvider>
          <Toaster 
            position="bottom-right" 
            richColors 
            closeButton
            expand={true}
            duration={4000}
            theme="light"
            toastOptions={{
              unstyled: false,
              classNames: {
                toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-gray-900 group-[.toaster]:text-gray-900 group-[.toaster]:dark:text-gray-50 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:dark:border-gray-800 group-[.toaster]:shadow-lg',
                description: 'group-[.toast]:text-gray-600 group-[.toast]:dark:text-gray-400',
                actionButton: 'group-[.toast]:bg-gray-900 group-[.toast]:dark:bg-gray-50 group-[.toast]:text-gray-50 group-[.toast]:dark:text-gray-900',
                cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:dark:bg-gray-800 group-[.toast]:text-gray-600 group-[.toast]:dark:text-gray-400',
                closeButton: 'group-[.toast]:bg-gray-100 group-[.toast]:dark:bg-gray-800 group-[.toast]:hover:bg-gray-200 group-[.toast]:dark:hover:bg-gray-700',
                success: 'group-[.toaster]:bg-green-50 group-[.toaster]:dark:bg-green-950 group-[.toaster]:border-green-200 group-[.toaster]:dark:border-green-800 group-[.toaster]:text-green-900 group-[.toaster]:dark:text-green-100',
                error: 'group-[.toaster]:bg-red-50 group-[.toaster]:dark:bg-red-950 group-[.toaster]:border-red-200 group-[.toaster]:dark:border-red-800 group-[.toaster]:text-red-900 group-[.toaster]:dark:text-red-100',
                warning: 'group-[.toaster]:bg-yellow-50 group-[.toaster]:dark:bg-yellow-950 group-[.toaster]:border-yellow-200 group-[.toaster]:dark:border-yellow-800 group-[.toaster]:text-yellow-900 group-[.toaster]:dark:text-yellow-100',
                info: 'group-[.toaster]:bg-blue-50 group-[.toaster]:dark:bg-blue-950 group-[.toaster]:border-blue-200 group-[.toaster]:dark:border-blue-800 group-[.toaster]:text-blue-900 group-[.toaster]:dark:text-blue-100',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
