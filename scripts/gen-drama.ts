
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import yaml from 'js-yaml';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!TMDB_API_KEY || !GEMINI_API_KEY) {
  console.error("❌ Missing TMDB_API_KEY or GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_API_KEY,
  },
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- TYPE DEFINITIONS ---
interface TvSearchResult {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  overview: string;
}

interface Network {
  name: string;
}

interface CastMember {
  name: string;
  order: number;
}

interface Genre {
  id: number;
  name: string;
}

interface Translation {
    iso_3166_1: string;
    iso_639_1: string;
    name: string;
    english_name: string;
    data: {
        name: string;
        overview: string;
    }
}

interface TvDetails {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  number_of_episodes: number;
  networks: Network[];
  genres: Genre[];
  poster_path: string;
  overview: string;
  credits: {
    cast: CastMember[];
  };
  translations: {
    translations: Translation[];
  }
}

interface AiContent {
    seoDescription: string;
    introHook: string;
}

// TMDB Genre ID to Name mapping (for common K-drama genres)
const GENRE_MAP: { [key: number]: string } = {
    18: 'Drama',
    35: 'Comedia',
    80: 'Crimen',
    99: 'Documental',
    10751: 'Familia',
    10759: 'Acción y Aventura',
    10762: 'Infantil',
    10763: 'Noticias',
    10764: 'Reality',
    10765: 'Ciencia Ficción y Fantasía',
    10766: 'Serial',
    10767: 'Talk Show',
    10768: 'Guerra y Política',
    9648: 'Misterio',
};

function mapTmdbGenres(genres: Genre[]): string[] {
    return genres.map(g => GENRE_MAP[g.id] || g.name).filter(Boolean);
}

async function downloadImage(url: string, filepath: string): Promise<void> {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

function createSlug(title: string): string {
    return slugify(title, { lower: true, strict: true, locale: 'es' });
}

async function generateAiContent(overview: string): Promise<AiContent> {
    const prompt = `
Contexto: El siguiente es el resumen de la trama de un K-Drama: "${overview}"

Tarea: Basado en el resumen, genera el siguiente contenido en español, formateado como un único objeto JSON con dos claves, "seoDescription" e "introHook".

1.  "seoDescription": Una descripción atractiva y concisa para SEO, dirigida a una audiencia sudamericana. Debe tener menos de 160 caracteres.
2.  "introHook": Un párrafo introductorio apasionado y emocionante para una publicación de blog sobre por qué alguien debería ver este drama. Usa emojis para hacerlo más atractivo.

Proporciona únicamente el objeto JSON en tu respuesta. No envuelvas el JSON en bloques de código markdown.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean potential markdown formatting
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText) as AiContent;
    } catch (error) {
        console.error("❌ Error generating AI content:", error);
        // Return a fallback object
        return {
            seoDescription: "Descubre todo sobre este emocionante K-Drama, incluyendo su trama, elenco y dónde verlo.",
            introHook: "¡Prepárate para una nueva obsesión! Este K-Drama tiene todo lo que buscas: romance, misterio y actuaciones inolvidables. 🍿✨"
        };
    }
}


async function main() {
  console.log('✨ Bienvenido al Generador de Contenido de K-Dramas ✨');

  // --- Step 1: Search and Select ---
  const { searchQuery } = await inquirer.prompt([
    {
      type: 'input',
      name: 'searchQuery',
      message: '📺 ¿Qué drama coreano quieres buscar en TMDB?',
    },
  ]);

  const searchResponse = await tmdb.get< { results: TvSearchResult[] }>('/search/tv', {
    params: {
      query: searchQuery,
      language: 'es-ES',
      include_adult: false,
    },
  });

  if (!searchResponse.data.results.length) {
    console.log(`❌ No se encontraron resultados para "${searchQuery}".`);
    return;
  }

  const choices = searchResponse.data.results.map(drama => ({
      name: `${drama.name} (${drama.first_air_date?.split('-')[0] || 'N/A'}) - ${drama.original_name}`,
      value: drama.id,
  }));

  const { dramaId } = await inquirer.prompt([
      {
          type: 'list',
          name: 'dramaId',
          message: '👇 Selecciona el drama correcto:',
          choices,
      },
  ]);
  
  // --- Step 2: Fetching & Mapping ---
  console.log(`⬇️  Obteniendo detalles para el ID: ${dramaId}...`);
  const { data: dramaDetails } = await tmdb.get<TvDetails>(`/tv/${dramaId}`, {
      params: {
          language: 'es-ES',
          append_to_response: 'credits,translations',
      },
  });
  
  const spanishTranslation = dramaDetails.translations.translations.find(t => t.iso_639_1 === 'es');
  const title = spanishTranslation?.data?.name || dramaDetails.name;
  const overview = spanishTranslation?.data?.overview || dramaDetails.overview;
  const slug = createSlug(title);

  // Image handling
  const posterPath = dramaDetails.poster_path;
  const imageUrl = `https://image.tmdb.org/t/p/w1280${posterPath}`;
  const imageDir = path.join(process.cwd(), 'public', 'images', 'dramas');
  if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
  }
  const imageLocalPath = path.join(imageDir, `${slug}.jpg`);
  
  console.log(`🖼️  Descargando poster a ${imageLocalPath}...`);
  await downloadImage(imageUrl, imageLocalPath);

  const frontmatter = {
    title: title,
    description: '', // Placeholder, will be filled by AI
    pubDate: new Date(dramaDetails.first_air_date),
    modDate: new Date(),
    heroImage: `/images/dramas/${slug}.jpg`,
    contentType: 'dramas',
    tags: ['drama', 'resena'],
    dramaTitle: dramaDetails.original_name,
    dramaYear: new Date(dramaDetails.first_air_date).getFullYear(),
    network: dramaDetails.networks[0]?.name || 'N/A',
    episodes: dramaDetails.number_of_episodes,
    cast: dramaDetails.credits.cast.slice(0, 5).map(c => c.name),
    genre: mapTmdbGenres(dramaDetails.genres),
    whereToWatch: ['Netflix', 'Viki'],
    affiliate_hint: 'streaming',
  };

  // --- Step 3: AI Post-processing ---
  console.log('🤖 Generando contenido con Gemini 1.5 Flash...');
  const aiContent = await generateAiContent(overview);
  frontmatter.description = aiContent.seoDescription;

  // --- Step 4: File Generation ---
  const body = `
${aiContent.introHook}

${overview}

### Elenco Principal

${frontmatter.cast.map(actor => `- ${actor}`).join('\\n')}

### ¿Dónde ver este drama?

<AffiliateBox contentId='${slug}' />

### Nuestra Opinión

*(Aquí puedes añadir tu reseña personal sobre el drama...)*
`;
  
  const mdxContent = `---
${yaml.dump(frontmatter)}---
${body}
`;

  const outputDir = path.join(process.cwd(), 'src', 'content', 'dramas');
   if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `${slug}.mdx`);

  fs.writeFileSync(outputPath, mdxContent);

  console.log(`✅ ¡Éxito! Archivo creado en: ${outputPath}`);
}

main().catch(error => {
  console.error('\n💥 Ocurrió un error inesperado:', error.message);
  process.exit(1);
});
