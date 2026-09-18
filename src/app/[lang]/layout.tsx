import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NotificationProvider } from "@/components/notifications";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

// No `generateStaticParams` here on purpose. Every route reads the session
// cookie through the header, so none of them prerender, and the function is
// only required with Cache Components, which this app does not use.
export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: { default: dict.brand, template: `%s · ${dict.brand}` },
    description: dict.home.lede,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!locale || !isLocale(locale)) notFound();

  const dict = await getDictionary();

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* The notice region wraps everything, so a form anywhere on the page
            can report success without its own corner of the screen. */}
        <NotificationProvider dismissLabel={dict.common.dismiss}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NotificationProvider>
      </body>
    </html>
  );
}
