import {routing} from '@/i18n/routing'
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: any
}) => {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  return children
}

export default Layout
