import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import TypesDropdown from '@/components/TypesDropdown';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MBTI for AI Agents',
  description: 'Discover the personality type of your AI agent through MBTI analysis',
  openGraph: {
    title: 'MBTI for AI Agents',
    description: 'Discover the personality type of your AI agent through MBTI analysis',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${nunito.variable}`}>
      <body className="font-body min-h-screen flex flex-col bg-surface-50">
        <header className="bg-white border-b border-surface-300 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              {/* 4-color dots logo */}
              <div className="personality-dots">
                <span style={{ backgroundColor: '#88619A' }} />
                <span style={{ backgroundColor: '#33A474' }} />
                <span style={{ backgroundColor: '#4298B4' }} />
                <span style={{ backgroundColor: '#E4AE3A' }} />
              </div>
              <span className="font-display text-lg font-semibold text-body tracking-tight group-hover:text-analyst transition-colors">
                MBTI for AI Agents
              </span>
            </a>
            <nav className="flex items-center gap-5 text-sm font-medium text-body-light">
              <a href="/" className="hover:text-body transition-colors hidden sm:block">
                Home
              </a>
              <TypesDropdown />
              <a
                href="https://github.com/ingeun92/mbti-for-ai-agents"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-body transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-white border-t border-surface-300 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="personality-dots">
                  <span style={{ backgroundColor: '#88619A' }} />
                  <span style={{ backgroundColor: '#33A474' }} />
                  <span style={{ backgroundColor: '#4298B4' }} />
                  <span style={{ backgroundColor: '#E4AE3A' }} />
                </div>
                <span className="font-display text-sm font-semibold text-body-light">
                  MBTI for AI Agents
                </span>
              </div>
              <p className="text-sm text-body-muted">
                Discover your AI agent&apos;s personality type
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
