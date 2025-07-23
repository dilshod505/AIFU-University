import fs from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { locale } = Object.fromEntries(new URL(request.url).searchParams)
    const translations = await request.json()

    console.log('Received locale:', locale)
    console.log('Received translations:', translations)

    if (!locale || typeof locale !== 'string') {
      console.error('Invalid locale parameter')
      return NextResponse.json(
        { message: 'Invalid locale parameter' },
        { status: 400 }
      )
    }

    if (!translations || Object.keys(translations).length === 0) {
      console.error('Empty translations object')
      return NextResponse.json(
        { message: 'Empty translations object' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`)

    console.log('Writing to file:', filePath)

    // Faylni JSON formatda yozish
    await fs.writeFile(filePath, JSON.stringify(translations, null, 2), 'utf-8')

    console.log('File saved successfully')

    return NextResponse.json({ message: 'Translations saved successfully' })
  } catch (error) {
    console.error('Error saving translations:', error)
    return NextResponse.json(
      { message: 'Error saving translations', error },
      { status: 500 }
    )
  }
}
