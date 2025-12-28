import { Playfair_Display, EB_Garamond, Inter } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400','700','800'],
  display: 'swap',
});

export const garamond = EB_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400','500','600','700'],
  style: ['normal','italic'],
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});