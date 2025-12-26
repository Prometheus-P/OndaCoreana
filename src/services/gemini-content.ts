/**
 * Gemini AI Content Generation Service
 * Generates Spanish-language K-Drama content for Latin American audience
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TMDBDramaDetail } from './tmdb';

// Initialize Gemini
function createGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export interface GeneratedDramaContent {
  title: string;           // SEO-optimized title in Spanish
  description: string;     // 150 chars max meta description
  tags: string[];          // SEO tags
  content: string;         // MDX body content
}

/**
 * Generate SEO-optimized Spanish title
 */
export async function generateDramaTitle(drama: TMDBDramaDetail): Promise<string> {
  const model = createGeminiModel();

  const prompt = `Genera un título SEO en español para este K-Drama.
Nombre original: ${drama.original_name}
Nombre internacional: ${drama.name}
Año: ${drama.first_air_date?.split('-')[0]}
Géneros: ${drama.genres.map(g => g.name).join(', ')}

Requisitos:
- Máximo 60 caracteres
- Incluir el nombre del drama
- Agregar un gancho como "Guía completa" o "Todo sobre" o el género
- Idioma: español latinoamericano
- NO usar emojis

Responde SOLO con el título, sin explicaciones.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Fallback if response is too long or empty
  if (!text || text.length > 60) {
    const year = drama.first_air_date?.split('-')[0] || '';
    return `${drama.name}: K-Drama ${year} - Guía Completa`.slice(0, 60);
  }

  return text;
}

/**
 * Generate meta description
 */
export async function generateDramaDescription(drama: TMDBDramaDetail): Promise<string> {
  const model = createGeminiModel();

  const prompt = `Escribe una meta descripción SEO en español para este K-Drama.
Nombre: ${drama.name}
Sinopsis original: ${drama.overview}
Géneros: ${drama.genres.map(g => g.name).join(', ')}
Año: ${drama.first_air_date?.split('-')[0]}

Requisitos:
- Exactamente entre 140-155 caracteres
- Debe ser atractivo y generar curiosidad
- Incluir palabras clave: K-Drama, el nombre del drama
- Idioma: español latinoamericano natural
- NO usar emojis

Responde SOLO con la descripción, sin explicaciones ni comillas.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // Remove quotes if present
  text = text.replace(/^["']|["']$/g, '');

  // Fallback if response is invalid
  if (!text || text.length < 50 || text.length > 160) {
    return `Descubre ${drama.name}, un emocionante K-Drama que te mantendrá al borde del asiento. Conoce la historia, reparto y dónde verlo.`.slice(0, 155);
  }

  return text;
}

/**
 * Generate SEO tags
 */
export async function generateDramaTags(drama: TMDBDramaDetail): Promise<string[]> {
  const model = createGeminiModel();

  const castNames = drama.credits?.cast?.slice(0, 3).map(c => c.name).join(', ') || '';
  const network = drama.networks?.[0]?.name || '';

  const prompt = `Genera 6-8 tags SEO en español para este K-Drama.
Nombre: ${drama.name}
Géneros: ${drama.genres.map(g => g.name).join(', ')}
Año: ${drama.first_air_date?.split('-')[0]}
Cadena: ${network}
Actores principales: ${castNames}

Requisitos:
- Tags en minúsculas, sin acentos especiales
- Incluir: género principal, año, actores famosos (si los hay)
- Usar guiones para palabras compuestas (ej: "ciencia-ficcion")
- NO usar emojis

Responde con los tags separados por comas, sin explicaciones.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Parse tags
  const tags = text
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length < 30)
    .slice(0, 8);

  // Ensure minimum tags
  if (tags.length < 3) {
    const year = drama.first_air_date?.split('-')[0] || '';
    return ['k-drama', 'drama-coreano', year, 'serie'].filter(Boolean);
  }

  return tags;
}

/**
 * Generate full MDX content body
 */
export async function generateDramaContent(drama: TMDBDramaDetail): Promise<string> {
  const model = createGeminiModel();

  const castList = drama.credits?.cast?.slice(0, 5).map(c => `${c.name} como ${c.character}`).join('\n- ') || 'No disponible';
  const network = drama.networks?.[0]?.name || 'No disponible';
  const year = drama.first_air_date?.split('-')[0] || '';

  const prompt = `Escribe un artículo en español sobre este K-Drama para un blog de cultura coreana.

INFORMACIÓN DEL DRAMA:
- Nombre: ${drama.name}
- Nombre original: ${drama.original_name}
- Año: ${year}
- Episodios: ${drama.number_of_episodes}
- Cadena: ${network}
- Géneros: ${drama.genres.map(g => g.name).join(', ')}
- Sinopsis: ${drama.overview}
- Reparto:
  - ${castList}

ESTRUCTURA REQUERIDA (usa estos headers exactos en markdown):
## Sinopsis
(2-3 párrafos expandiendo la sinopsis, sin spoilers)

## Por qué deberías verlo
(3-4 razones con subtítulos ### numerados)

## Reparto principal
(Descripción breve de 2-3 personajes principales)

## Dónde verlo
(Mencionar plataformas de streaming disponibles en Latinoamérica)

## Veredicto final
(Puntuación con estrellas y conclusión breve)

REQUISITOS:
- Idioma: español latinoamericano natural y amigable
- Tono: entusiasta pero informativo
- NO inventar información que no esté en los datos
- NO usar emojis excepto las estrellas del veredicto (⭐)
- Longitud: 400-600 palabras
- Usar markdown para formato`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Basic validation
  if (!text || text.length < 500) {
    return generateFallbackContent(drama);
  }

  return text;
}

/**
 * Fallback content if AI generation fails
 */
function generateFallbackContent(drama: TMDBDramaDetail): string {
  const year = drama.first_air_date?.split('-')[0] || '';
  const network = drama.networks?.[0]?.name || 'cadena coreana';
  const genres = drama.genres.map(g => g.name).join(', ') || 'Drama';

  return `## Sinopsis

**${drama.name}** (${drama.original_name}) es un K-Drama de ${year} que ha cautivado a audiencias de todo el mundo.

${drama.overview || 'Una historia emocionante que te mantendrá al borde del asiento.'}

## Por qué deberías verlo

### 1. Historia cautivadora
Este drama ofrece una trama bien desarrollada que mantiene el interés del espectador desde el primer episodio.

### 2. Actuaciones memorables
El reparto principal entrega interpretaciones que dan vida a personajes complejos y entrañables.

### 3. Producción de calidad
Con la producción de ${network}, este drama cuenta con valores de producción de primer nivel.

## Datos técnicos

| Aspecto | Detalle |
|---------|---------|
| **Episodios** | ${drama.number_of_episodes} |
| **Año** | ${year} |
| **Géneros** | ${genres} |

## Dónde verlo

**${drama.name}** está disponible en plataformas de streaming como Netflix y Viki con subtítulos en español para toda Latinoamérica.

## Veredicto final

⭐⭐⭐⭐ (4/5)

Un K-Drama que vale la pena ver para cualquier fan del género.
`;
}

/**
 * Generate all content at once
 */
export async function generateAllDramaContent(drama: TMDBDramaDetail): Promise<GeneratedDramaContent> {
  // Run in parallel for speed
  const [title, description, tags, content] = await Promise.all([
    generateDramaTitle(drama),
    generateDramaDescription(drama),
    generateDramaTags(drama),
    generateDramaContent(drama),
  ]);

  return {
    title,
    description,
    tags,
    content,
  };
}
