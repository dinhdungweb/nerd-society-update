import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import 'rc-slider/assets/index.css'
import ThemeProvider from './theme-provider'
import { Providers } from './providers'
import { FloatingContact } from '@/components/ui/FloatingContact'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: '%s - Nerd Society',
    default: 'Nerd Society | Không gian học tập dành cho Gen Z',
  },
  description: 'Nerd Society: Cộng đồng học tập Gen Z năng động tại Hà Nội. Không gian làm việc chung, học nhóm lý tưởng.',
  keywords: ['Nerd Society', 'cafe học tập', 'co-working space', 'Hà Nội', 'Gen Z'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.className}>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Providers>
          {children}
          <FloatingContact />
        </Providers>
      </body>
    </html>
  )
}

