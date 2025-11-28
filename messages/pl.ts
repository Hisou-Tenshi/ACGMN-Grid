const pl = {
  meta: {
    title: 'ACGMN+ Tabela Preferencji Osobistych｜Generator Tabeli Preferencji ACGMN+',
    description: 'Stwórz swoją własną tabelę preferencji ACGMN+ (tabela preferencji ACGMN+/siatka 3x3) z obsługą wielu języków i konfigurowalnymi polami. Eksportuj obrazy wysokiej jakości jednym kliknięciem.',
  },
  global: {
    main_title: 'ACGMN+ Osobista Tabela Preferencji',
  },
  cell_titles: [
    "Pierwsze",
    "Ulubione", 
    "Miłość od Pierwszego Wejrzenia",
    "Krytykowane",
    "Najdłużej Towarzyszące",
    "Najszczęśliwsze",
    
    "Najlepsza Fabuła",
    "Najlepsza Grafika", 
    "Najlepsza Muzyka",
    "Najlepsze Głosy",
    "Najlepsza Charakteryzacja",
    "Najlepsze Zakończenie",
    
    "Polecane",
    "Ulubione Krótkie",
    "Najwyżej Oceniane",
    "Najniżej Oceniane",
    "Niedoceniane",
    "Przeceniane",
    
    "Najbardziej Oczekiwana Kontynuacja",
    "Niedosyt", 
    "Niezrozumiała Sympatia",
    "Kiedyś Dokończę",
    "Powrót do Młodości",
    "Niszowe, ale Ukochane",
  ],
  ui: {
    tip_edit:
      'Wskazówka: Kliknij nagłówki, tytuły pól lub nazwy dzieł, aby edytować; możesz także przeciągać obrazy bezpośrednio do pól. Nazwy dzieł obsługują automatyczne zawijanie wierszy, użyj ＼n dla wymuszonego podziału. Oryginalne Dzieło: Github @ SomiaWhiteRing',
    generate: 'Wygeneruj {title}!',
  },
  dialog: {
    edit_title: 'Edytuj Tytuł',
    edit_game_name: 'Edytuj Nazwę Dzieła',
    edit_main_title: 'Edytuj Tytuł Główny',
  },
  common: {
    cancel: 'Anuluj',
    save: 'Zapisz', 
    close: 'Zamknij',
    confirm: 'Potwierdź',
  },
  footer: {
    made_with: 'Adaptacja Pochodna z Claude',
    if_useful_star: 'Jeśli przydatne, proszę o gwiazdkę →',
    powered_by: 'Wspierane przez Bangumi & SteamGridDB',
    official_link: 'Oficjalny link: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+ osobista tabela preferencji (znana również jako "tabela preferencji gier", "tabela preferencji", "siatka preferencji 3x3") generator online. Obsługuje wielojęzyczne tytuły i konfigurowalne pola, dodaj okładki poprzez przeciąganie lub wyszukiwanie, eksportuj obrazy wysokiej rozdzielczości jednym kliknięciem.',
  },
  search: {
    title: 'Wyszukaj Dzieła',
    source: 'Źródło:',
    placeholder: 'Wpisz nazwę dzieła, aby wyszukać',
    searching: 'Wyszukiwanie',
    search: 'Szukaj',
    retry: 'Spróbuj Ponownie',
    no_results: 'Nie znaleziono pasujących dzieł',
    try_keywords: 'Spróbuj innych słów kluczowych',
    idle_hint: 'Wpisz nazwę dzieła, aby wyszukać',
    results_count: 'Znaleziono {count} wyników',
    clear: 'Wyczyść Wyszukiwanie',
    upload_image: 'Prześlij Obraz',
    bangumi_tip: 'Bangumi to chińska baza danych skupiająca się na anime i grach, z dobrym wsparciem ACGMN+.',
    sgdb_tip: 'SteamGridDB to baza danych okładek gier z obszerną kolekcją, ale obsługuje tylko wyszukiwanie po angielskich nazwach.',
  },
  crop: {
    title: 'Przytnij obraz',
    tip: 'Przeciągnij i przybliż, aby dostosować obszar przycinania',
    zoom: 'Powiększenie',
  },
  error: {
    file_too_large: 'Plik obrazu jest za duży, prześlij obrazy mniejsze niż {size}',
    image_load_failed_retry: 'Nie udało się załadować obrazu, spróbuj ponownie',
    image_load_failed_select_another: 'Nie udało się załadować obrazu, spróbuj ponownie lub wybierz inny obraz',
    loading: 'Ładowanie...',
    processing: 'Przetwarzanie...',
  },
};

export default pl;
