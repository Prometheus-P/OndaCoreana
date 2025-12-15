import { config, fields, collection } from '@keystatic/core';

/**
 * Keystatic CMS Configuration
 *
 * Provides a visual editing interface for content at /keystatic
 * Content is stored as files in the repository (Git-based CMS)
 */
export default config({
  storage: {
    kind: 'local',
  },

  ui: {
    brand: {
      name: 'OndaCoreana CMS',
    },
    navigation: {
      'Contenido Principal': ['dramas', 'kpop', 'noticias', 'guias'],
      Editorial: ['features'],
    },
  },

  collections: {
    // K-Dramas Collection
    dramas: collection({
      label: 'K-Dramas',
      slugField: 'title',
      path: 'src/content/dramas/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Título SEO', validation: { isRequired: true } },
        }),
        dramaTitle: fields.text({
          label: 'Título del Drama (Original)',
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: 'Descripción',
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        pubDate: fields.date({
          label: 'Fecha de Publicación',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Última Actualización',
        }),
        heroImage: fields.image({
          label: 'Imagen Principal',
          directory: 'public/images/dramas',
          publicPath: '/images/dramas/',
        }),
        heroImageAlt: fields.text({
          label: 'Alt de Imagen',
        }),
        dramaYear: fields.integer({
          label: 'Año del Drama',
        }),
        network: fields.text({
          label: 'Cadena/Plataforma',
          description: 'tvN, JTBC, Netflix, etc.',
        }),
        episodes: fields.integer({
          label: 'Episodios',
        }),
        genre: fields.array(
          fields.text({ label: 'Género' }),
          {
            label: 'Géneros',
            itemLabel: (props) => props.value || 'Género',
          }
        ),
        cast: fields.array(
          fields.text({ label: 'Actor/Actriz' }),
          {
            label: 'Reparto',
            itemLabel: (props) => props.value || 'Actor',
          }
        ),
        whereToWatch: fields.array(
          fields.text({ label: 'Plataforma' }),
          {
            label: 'Dónde Ver',
            itemLabel: (props) => props.value || 'Plataforma',
          }
        ),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'OndaCoreana',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Tag',
          }
        ),
        keywords: fields.array(
          fields.text({ label: 'Keyword' }),
          {
            label: 'Keywords SEO',
            itemLabel: (props) => props.value || 'Keyword',
          }
        ),
        affiliate_hint: fields.select({
          label: 'Tipo de Afiliado',
          options: [
            { label: 'Ninguno', value: '' },
            { label: 'Streaming', value: 'streaming' },
            { label: 'K-Pop Goods', value: 'kpop_goods' },
          ],
          defaultValue: '',
        }),
        draft: fields.checkbox({
          label: 'Borrador',
          defaultValue: false,
        }),
        noAds: fields.checkbox({
          label: 'Sin Anuncios',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Contenido',
        }),
      },
    }),

    // K-Pop Collection
    kpop: collection({
      label: 'K-Pop',
      slugField: 'title',
      path: 'src/content/kpop/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Título SEO', validation: { isRequired: true } },
        }),
        artistName: fields.text({
          label: 'Nombre del Artista/Grupo',
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: 'Descripción',
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        pubDate: fields.date({
          label: 'Fecha de Publicación',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Última Actualización',
        }),
        heroImage: fields.image({
          label: 'Imagen Principal',
          directory: 'public/images/kpop',
          publicPath: '/images/kpop/',
        }),
        heroImageAlt: fields.text({
          label: 'Alt de Imagen',
        }),
        artistType: fields.select({
          label: 'Tipo de Artista',
          options: [
            { label: 'Grupo', value: 'grupo' },
            { label: 'Solista', value: 'solista' },
            { label: 'Banda', value: 'banda' },
          ],
          defaultValue: 'grupo',
        }),
        agency: fields.text({
          label: 'Agencia',
          description: 'HYBE, SM, JYP, etc.',
        }),
        debutYear: fields.integer({
          label: 'Año de Debut',
        }),
        members: fields.array(
          fields.text({ label: 'Miembro' }),
          {
            label: 'Miembros',
            itemLabel: (props) => props.value || 'Miembro',
          }
        ),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'OndaCoreana',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Tag',
          }
        ),
        keywords: fields.array(
          fields.text({ label: 'Keyword' }),
          {
            label: 'Keywords SEO',
            itemLabel: (props) => props.value || 'Keyword',
          }
        ),
        affiliate_hint: fields.select({
          label: 'Tipo de Afiliado',
          options: [
            { label: 'Ninguno', value: '' },
            { label: 'K-Pop Goods', value: 'kpop_goods' },
          ],
          defaultValue: '',
        }),
        draft: fields.checkbox({
          label: 'Borrador',
          defaultValue: false,
        }),
        noAds: fields.checkbox({
          label: 'Sin Anuncios',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Contenido',
        }),
      },
    }),

    // Noticias Collection
    noticias: collection({
      label: 'Noticias',
      slugField: 'title',
      path: 'src/content/noticias/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Título', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Descripción',
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        pubDate: fields.date({
          label: 'Fecha de Publicación',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Última Actualización',
        }),
        heroImage: fields.image({
          label: 'Imagen Principal',
          directory: 'public/images/noticias',
          publicPath: '/images/noticias/',
        }),
        heroImageAlt: fields.text({
          label: 'Alt de Imagen',
        }),
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Drama', value: 'drama' },
            { label: 'K-Pop', value: 'kpop' },
            { label: 'Cine', value: 'cine' },
            { label: 'Cultura', value: 'cultura' },
            { label: 'General', value: 'general' },
          ],
          defaultValue: 'general',
        }),
        breaking: fields.checkbox({
          label: 'Noticia Urgente',
          defaultValue: false,
        }),
        source: fields.text({
          label: 'Fuente',
        }),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'OndaCoreana',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Tag',
          }
        ),
        keywords: fields.array(
          fields.text({ label: 'Keyword' }),
          {
            label: 'Keywords SEO',
            itemLabel: (props) => props.value || 'Keyword',
          }
        ),
        draft: fields.checkbox({
          label: 'Borrador',
          defaultValue: false,
        }),
        noAds: fields.checkbox({
          label: 'Sin Anuncios',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Contenido',
        }),
      },
    }),

    // Guías Collection
    guias: collection({
      label: 'Guías',
      slugField: 'title',
      path: 'src/content/guias/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Título', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Descripción',
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        pubDate: fields.date({
          label: 'Fecha de Publicación',
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: 'Última Actualización',
        }),
        heroImage: fields.image({
          label: 'Imagen Principal',
          directory: 'public/images/guias',
          publicPath: '/images/guias/',
        }),
        heroImageAlt: fields.text({
          label: 'Alt de Imagen',
        }),
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Streaming', value: 'streaming' },
            { label: 'Viaje', value: 'viaje' },
            { label: 'Idioma', value: 'idioma' },
            { label: 'Cultura', value: 'cultura' },
            { label: 'General', value: 'general' },
          ],
          defaultValue: 'general',
        }),
        difficulty: fields.select({
          label: 'Dificultad',
          options: [
            { label: 'Sin especificar', value: '' },
            { label: 'Principiante', value: 'principiante' },
            { label: 'Intermedio', value: 'intermedio' },
            { label: 'Avanzado', value: 'avanzado' },
          ],
          defaultValue: '',
        }),
        readingTime: fields.integer({
          label: 'Tiempo de Lectura (minutos)',
        }),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'OndaCoreana',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Tag',
          }
        ),
        keywords: fields.array(
          fields.text({ label: 'Keyword' }),
          {
            label: 'Keywords SEO',
            itemLabel: (props) => props.value || 'Keyword',
          }
        ),
        affiliate_hint: fields.select({
          label: 'Tipo de Afiliado',
          options: [
            { label: 'Ninguno', value: '' },
            { label: 'Streaming', value: 'streaming' },
            { label: 'eSIM', value: 'esim' },
            { label: 'Seguro de Viaje', value: 'travel_insurance' },
            { label: 'Aprender Coreano', value: 'korean_learning' },
          ],
          defaultValue: '',
        }),
        draft: fields.checkbox({
          label: 'Borrador',
          defaultValue: false,
        }),
        noAds: fields.checkbox({
          label: 'Sin Anuncios',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Contenido',
        }),
      },
    }),

    // Features Collection (Editorial content for LatAm)
    features: collection({
      label: 'Features (Editorial)',
      slugField: 'title',
      path: 'src/content/features/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Título', validation: { isRequired: true } },
        }),
        descriptionEs: fields.text({
          label: 'Descripción (Español)',
          multiline: true,
          validation: { isRequired: true, length: { max: 180 } },
        }),
        publishDate: fields.date({
          label: 'Fecha de Publicación',
          validation: { isRequired: true },
        }),
        heroImage: fields.image({
          label: 'Imagen Principal',
          directory: 'public/images/features',
          publicPath: '/images/features/',
        }),
        heroImageAlt: fields.text({
          label: 'Alt de Imagen',
        }),
        category: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Música', value: 'music' },
            { label: 'Series', value: 'series' },
            { label: 'Evento', value: 'event' },
            { label: 'Gastronomía', value: 'gastronomy' },
            { label: 'Cultura', value: 'culture' },
          ],
          defaultValue: 'culture',
        }),
        countries: fields.array(
          fields.text({ label: 'País' }),
          {
            label: 'Países LatAm',
            itemLabel: (props) => props.value || 'País',
            validation: { length: { min: 1 } },
          }
        ),
        latamHook: fields.array(
          fields.text({ label: 'Gancho' }),
          {
            label: 'Ganchos para LatAm',
            itemLabel: (props) => props.value || 'Gancho',
            validation: { length: { min: 1 } },
          }
        ),
        author: fields.text({
          label: 'Autor',
          defaultValue: 'OndaCoreana',
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Tag',
          }
        ),
        draft: fields.checkbox({
          label: 'Borrador',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Contenido',
        }),
      },
    }),
  },
});
