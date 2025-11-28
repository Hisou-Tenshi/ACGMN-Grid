const es = {
  meta: {
    title: 'Tabla de Preferencias ACGMN+｜Generador de Tablas ACGMN+',
    description: 'Crea tu tabla de preferencias ACGMN+ (tabla ACGMN+/cuadrícula 3x3) con soporte multilingüe y celdas personalizables. Exporta imágenes de alta calidad con un clic.',
  },
  global: {
    main_title: 'Tabla de Preferencias Personales ACGMN+',
  },
  cell_titles: [
    "El Primero",
    "Favorito Absoluto", 
    "Amor a Primera Vista",
    "Más Criticado",
    "Mayor Compañía",
    "Más Divertido",
    
    "Mejor Historia",
    "Mejores Visuales", 
    "Mejor Banda Sonora",
    "Mejor Doblaje",
    "Mejor Desarrollo",
    "Mejor Final",
    
    "Más Recomendado",
    "Favorito Rápido",
    "Mejor Valorado",
    "Peor Valorado",
    "Más Subestimado",
    "Más Sobrevalorado",
    
    "Secuela Más Esperada",
    "Me Dejó con Ganas de Más", 
    "Placer Culposo",
    "Algún Día lo Terminaré",
    "Regreso a la Infancia",
    "Obra Oculta que Amo",
  ],
  ui: {
    tip_edit:
      'Consejo: Haz clic en los títulos superiores, títulos de celdas o nombres de obras para editarlos; también puedes arrastrar imágenes directamente a las celdas. Los nombres de obras admiten saltos de línea automáticos, o usa ＼n para un salto manual. Obra Original: Github @ SomiaWhiteRing',
    generate: '¡Generar {title}!',
  },
  dialog: {
    edit_title: 'Editar Título',
    edit_game_name: 'Editar Nombre de Obra',
    edit_main_title: 'Editar Título Principal',
  },
  common: {
    cancel: 'Cancelar',
    save: 'Guardar', 
    close: 'Cerrar',
    confirm: 'Confirmar',
  },
  footer: {
    made_with: 'Adaptación Derivativa con Claude',
    if_useful_star: 'Si te es útil, por favor dale una estrella →',
    powered_by: 'Con tecnología de Bangumi & SteamGridDB',
    official_link: 'Enlace oficial: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'Generador online de Tabla de Preferencias Personales ACGMN+ (también conocida como "Tabla de Preferencias de Videojuegos", "Tabla de Preferencias", "Cuadrícula 3x3 de Preferencias"). Soporta títulos multilingües y celdas personalizables, añade portadas mediante arrastrar y soltar o búsqueda, exporta imágenes de alta resolución con un clic.',
  },
  search: {
    title: 'Buscar Obras',
    source: 'Fuente:',
    placeholder: 'Ingresa el nombre de la obra para buscar',
    searching: 'Buscando',
    search: 'Buscar',
    retry: 'Reintentar',
    no_results: 'No se encontraron obras relevantes',
    try_keywords: 'Por favor prueba con diferentes palabras clave',
    idle_hint: 'Ingresa el nombre de la obra para buscar',
    results_count: 'Se encontraron {count} resultados',
    clear: 'Limpiar búsqueda',
    upload_image: 'Subir imagen',
    bangumi_tip: 'Bangumi es una base de datos china centrada en anime y videojuegos, con buen soporte para ACGMN+.',
    sgdb_tip: 'SteamGridDB es una base de datos de portadas de videojuegos con amplia colección, pero solo admite búsquedas en inglés.',
  },
  crop: {
    title: 'Recortar imagen',
    tip: 'Arrastra y amplía para ajustar el área de recorte',
    zoom: 'Zoom',
  },
  error: {
    file_too_large: 'Archivo de imagen demasiado grande, por favor sube imágenes menores de {size}',
    image_load_failed_retry: 'Error al cargar la imagen, inténtalo de nuevo',
    image_load_failed_select_another: 'Error al cargar la imagen, inténtalo de nuevo o selecciona otra imagen',
    loading: 'Cargando...',
    processing: 'Procesando...',
  },
};

export default es;
