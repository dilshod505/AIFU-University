export async function POST(request: Request) {
  try {
    const { translationKey, languages } = await request.json();

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
                  text: `Generate appropriate translations for the software interface element with key "${translationKey}".

Please provide translations for the following languages in this exact order:
1. ${languages[0]} (Uzbek)
3. ${languages[1]} (Russian)
4. ${languages[2]} (English)

The translation key "${translationKey}" suggests the context and meaning. Generate appropriate, concise translations that would work well in a user interface.

Format your response as a simple list, one translation per line, in the exact order specified above. Do not include language names or numbers, just the translations.`,
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
    const responseText = data.candidates[0].content.parts[0].text.trim();

    const translations = responseText
      .split("\n")
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    return Response.json({ translations });
  } catch (error) {
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
