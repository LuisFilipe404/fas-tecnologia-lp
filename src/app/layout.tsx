import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SITE_URL, company } from '@/lib/site';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const title = 'ChefX — Comanda digital para restaurantes, bares e lanchonetes';
const description =
  'Troque a comanda de papel pelo ChefX: mapa de mesas, pedidos com observação, envio da comanda e fechamento de conta com divisão por pessoa. Para restaurantes, bares e lanchonetes de todo o Brasil.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s | ChefX' },
  description,
  applicationName: 'ChefX',
  authors: [{ name: company.name, url: SITE_URL }],
  creator: company.name,
  publisher: company.name,
  keywords: [
    'ChefX',
    'comanda digital',
    'comanda eletrônica',
    'app de comanda',
    'app para garçom',
    'sistema para restaurante',
    'sistema para bar',
    'sistema para lanchonete',
    'sistema para pizzaria',
    'controle de mesas',
    'cardápio digital',
    'totem de autoatendimento'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: company.name,
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
