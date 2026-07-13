import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Recipe Generator from Food Images',
    short_name: 'GourmetAI',
    description: 'Upload food images and instantly generate AI-powered recipes, cooking instructions, nutrition facts, YouTube videos, and Google resources.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
