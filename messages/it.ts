const it = {
  meta: {
    title: 'Tabella Preferenze Personali ACGMN+｜Generatore Tabelle ACGMN+',
    description: 'Crea la tua tabella delle preferenze personali ACGMN+ (tabella ACGMN+/griglia 3x3) con supporto multilingue e celle personalizzabili. Esporta immagini ad alta qualità con un clic.',
  },
  global: {
    main_title: 'Tabella Preferenze Personali ACGMN+',
  },
  cell_titles: [
    "Il Primo",
    "Preferito in Assoluto", 
    "Amore a Prima Vista",
    "Più Criticato",
    "Compagnia Più Lunga",
    "Esperienza Più Felice",
    
    "Migliore Trama",
    "Migliori Grafiche", 
    "Miglior Colonna Sonora",
    "Miglior Doppiaggio",
    "Miglior Sviluppo",
    "Finale Migliore",
    
    "Più Consigliato",
    "Preferito Veloce",
    "Miglior Voto",
    "Peggior Voto",
    "Più Sottovalutato",
    "Più Sopravvalutato",
    
    "Seguito Più Atteso",
    "Più Memorabile", 
    "Piacere Proibito",
    "Un Giorno Lo Completerò",
    "Ritorno all'Infanzia",
    "Piccolo Tesoro Nascosto",
  ],
  ui: {
    tip_edit:
      'Suggerimento: Clicca su titoli, intestazioni delle celle o nomi delle opere per modificarli; puoi anche trascinare immagini direttamente nelle celle. I nomi delle opere supportano l\'a capo automatico, oppure usa ＼n per un a capo forzato. Opera Originale: Github @ SomiaWhiteRing',
    generate: 'Genera {title}!',
  },
  dialog: {
    edit_title: 'Modifica Titolo',
    edit_game_name: 'Modifica Nome Opera',
    edit_main_title: 'Modifica Titolo Principale',
  },
  common: {
    cancel: 'Annulla',
    save: 'Salva', 
    close: 'Chiudi',
    confirm: 'Conferma',
  },
  footer: {
    made_with: 'Adattamento Derivato con Claude',
    if_useful_star: 'Se utile, per favore metti una stella →',
    powered_by: 'Supportato da Bangumi & SteamGridDB',
    official_link: 'URL ufficiale: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'Generatore online di Tabelle Preferenze Personali ACGMN+ (anche chiamate "Tabella Preferenze Videogiochi", "Tabella Preferenze", "Griglia 3x3 Preferenze"). Supporta titoli multilingue e celle personalizzabili, aggiungi copertine tramite trascinamento o ricerca, esporta immagini ad alta risoluzione con un clic.',
  },
  search: {
    title: 'Cerca Opere',
    source: 'Fonte:',
    placeholder: 'Inserisci il nome dell\'opera per cercare',
    searching: 'Ricerca in corso',
    search: 'Cerca',
    retry: 'Riprova',
    no_results: 'Nessuna opera trovata',
    try_keywords: 'Prova con parole chiave diverse',
    idle_hint: 'Inserisci il nome dell\'opera per cercare',
    results_count: 'Trovati {count} risultati',
    clear: 'Cancella ricerca',
    upload_image: 'Carica immagine',
    bangumi_tip: 'Bangumi è un database cinese specializzato in anime e videogiochi, con buon supporto ACGMN+.',
    sgdb_tip: 'SteamGridDB è un database di copertine di giochi molto completo, ma supporta solo ricerche in inglese.',
  },
  crop: {
    title: 'Ritaglia immagine',
    tip: 'Trascina e zoom per regolare l\'area di ritaglio',
    zoom: 'Zoom',
  },
  error: {
    file_too_large: 'File immagine troppo grande, carica immagini più piccole di {size}',
    image_load_failed_retry: 'Caricamento immagine fallito, riprova',
    image_load_failed_select_another: 'Caricamento immagine fallito, riprova o seleziona un\'altra immagine',
    loading: 'Caricamento...',
    processing: 'Elaborazione...',
  },
};

export default it;
