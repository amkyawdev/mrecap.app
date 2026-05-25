import type { Metadata } from 'next';
import '../styles/global.css';

export const metadata: Metadata = {
  title: 'Movie Recap Editor',
  description: 'Edit videos with subtitles and voiceover',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#FF0000',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#FF0000' }}>
        {children}
      </body>
    </html>
  );
}