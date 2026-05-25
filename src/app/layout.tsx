import type { Metadata } from 'next';
import '../styles/global.css';

export const metadata: Metadata = {
  title: 'Movie Recap Editor',
  description: 'Edit videos with subtitles and voiceover',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#E50914',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css" rel="stylesheet" />
      </head>
      <body className="bg-neutral-950 text-white antialiased">
        {children}
        <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script>
        <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>
        <script src="https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/util.js"></script>
      </body>
    </html>
  );
}