import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Progrifes ERP | Gestão de Loja de Roupas',
  description:
    'Sistema ERP completo para gestão de estoque, vendas, clientes e financeiro.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen bg-brand-canvas text-brand-ink antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
