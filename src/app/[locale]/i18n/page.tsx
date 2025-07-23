import TranslationEditor from '@/components/i18n-editor/i18n-editor'
import { getTranslations } from '@/lib/get-translations'

export default async function Page() {
  const initialTranslations = await getTranslations()
  return <TranslationEditor initialTranslations={initialTranslations} />
}
