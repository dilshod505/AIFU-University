import { useTranslations } from 'next-intl'

const SimpleTranslation = ({
  title,
  hasLocale = false,
}: {
  title: string
  hasLocale?: boolean
}) => {
  const t = useTranslations()
  return hasLocale ? title : t(title)
}

export default SimpleTranslation
