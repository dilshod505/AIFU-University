export async function POST(request: Request) {
  try {
    const { text, targetLanguage, translationKey } = await request.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB1Pr_XAb6eIryaIn-e7Ny0U6tZz2nkbrY`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following text to ${targetLanguage}.

Context: This is a translation for a software application interface. The translation key is "${translationKey}".

Text to translate: "${text}"

Please provide only the translation without any additional explanation or formatting. Keep the tone appropriate for a user interface.`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translation = data.candidates[0].content.parts[0].text.trim();

    return Response.json({ translation });
  } catch (error) {
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
