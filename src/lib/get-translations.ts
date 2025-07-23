import fs from "fs/promises";
import path from "path";

export async function getTranslations() {
  const locales = ["uzb", "rus", "eng"];
  const translations: { [key: string]: any } = {};

  await Promise.all(
    locales.map(async (locale) => {
      try {
        const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
        const fileContent = await fs.readFile(filePath, "utf-8");
        translations[locale] = JSON.parse(fileContent);
      } catch (error) {
        console.error(`Error loading ${locale} translations:`, error);
      }
    }),
  );

  return translations;
}
