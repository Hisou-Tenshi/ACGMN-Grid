const pt = {
  meta: {
    title: 'Tabela de Preferências Pessoais ACGMN+｜Gerador de Tabela de Preferências ACGMN+',
    description: 'Crie sua tabela de preferências pessoais ACGMN+ (tabela ACGMN+/grade 3x3) com suporte multilíngue e células personalizáveis. Exporte imagens de alta qualidade com um clique.',
  },
  global: {
    main_title: 'Tabela de Preferências Pessoais ACGMN+',
  },
  cell_titles: [
  "O Primeiro",
  "Amor à Primeira Vista",
  "O Mais Duradouro",
  "Visto de Uma Vez",
  "Melhor com Macarrão",
  "Um Dia eu Termino",

  "A Maior Surpresa",
  "O Mais Lamentado",
  "O Mais Feliz",
  "Ficou a Vontade",
  "Amado sem Explicação",
  "Para Ver Acompanhado",

  "Favorito de Todos os Tempos",
  "O Mais Recomendado",
  "Joia Escondida",
  "O Mais Nostálgico",
  "Sequência Mais Esperada",
  "Queria Ter Visto Antes",

  "Mais Bem Avaliado",
  "Pior Avaliado",
  "O Mais Superestimado",
  "O Mais Difícil de Avaliar",
  "O Que Mais Critico",
  "Melhor História",
],
  ui: {
    tip_edit:
      'Dica: Clique nos títulos superiores, títulos das células ou nomes das obras para editar; você também pode arrastar imagens diretamente para as células. Os nomes das obras suportam quebra de linha automática, ou use ＼n para quebra de linha forçada. Trabalho Original: Github @ SomiaWhiteRing',
    generate: 'Gerar {title}!',
  },
  dialog: {
    edit_title: 'Editar Título',
    edit_game_name: 'Editar Nome da Obra',
    edit_main_title: 'Editar Título Principal',
  },
  common: {
    cancel: 'Cancelar',
    save: 'Salvar', 
    close: 'Fechar',
    confirm: 'Confirmar',
  },
  footer: {
    made_with: 'Adaptação Derivada com Claude',
    if_useful_star: 'Se foi útil, por favor dê uma estrela →',
    powered_by: 'Desenvolvido por Bangumi & SteamGridDB',
    official_link: 'Link oficial: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'Tabela de Preferências Pessoais ACGMN+ (também conhecida como "Tabela de Preferências de Jogos", "Tabela de Preferências", "Grade 3x3 de Preferências") gerador online. Suporta títulos multilíngues e células personalizáveis, adicione capas através de arrastar e soltar ou pesquisa, exporte imagens de alta resolução com um clique.',
  },
  search: {
    title: 'Pesquisar Obras',
    source: 'Fonte:',
    placeholder: 'Digite o nome da obra para pesquisar',
    searching: 'Pesquisando',
    search: 'Pesquisar',
    retry: 'Tentar Novamente',
    no_results: 'Nenhuma obra relacionada encontrada',
    try_keywords: 'Tente palavras-chave diferentes',
    idle_hint: 'Digite o nome da obra para pesquisar',
    results_count: 'Encontrados {count} resultados',
    clear: 'Limpar pesquisa',
    upload_image: 'Enviar imagem',
    bangumi_tip: 'Bangumi é um banco de dados chinês focado em anime e jogos, com bom suporte para ACGMN+.',
    sgdb_tip: 'SteamGridDB é um banco de dados de capas de jogos com coleção extensa, mas suporta apenas pesquisa por nomes em inglês.',
  },
  crop: {
    title: 'Recortar imagem',
    tip: 'Arraste e amplie para ajustar a área de recorte',
    zoom: 'Zoom',
  },
  error: {
    file_too_large: 'Arquivo de imagem muito grande, por favor envie imagens menores que {size}',
    image_load_failed_retry: 'Falha ao carregar imagem, tente novamente',
    image_load_failed_select_another: 'Falha ao carregar imagem, tente novamente ou selecione outra imagem',
    loading: 'Carregando...',
    processing: 'Processando...',
  },
};

export default pt;
