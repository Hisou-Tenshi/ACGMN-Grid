const en = {
  meta: {
    title: 'ACGMN+ Personal Preferences Chart｜ACGMN+ Chart Generator',
    description: 'Create your ACGMN+ personal preferences chart (ACGMN+ chart/3x3 grid) with multilingual support and customizable cells. Export high-quality images with one click.',
  },
  global: {
    main_title: 'ACGMN+ Personal Preferences Chart',
  },
  cell_titles: [
    "First One",
    "All-Time Favorite", 
    "Love at First Sight",
    "Most Criticized",
    "Longest Companion", 
    "Happiest Experience",
    
    "Best Story",
    "Best Visuals", 
    "Best Soundtrack",
    "Best Voice Acting",
    "Best Character Development",
    "Best Ending",
    
    "Most Recommended",
    "Favorite Quick Watch",
    "Highest Rated",
    "Lowest Rated",
    "Most Underrated",
    "Most Overrated",
    
    "Most Anticipated Sequel",
    "Left Me Wanting More", 
    "Guilty Pleasure",
    "Will Finish Someday",
    "Nostalgic Favorite",
    "Obscure Gem",
  ],
  ui: {
    tip_edit:
      'Tip: Click on headers, cell titles, or work names to edit; you can also drag and drop images directly into cells. Work names support auto line breaks, or use ＼n for manual line breaks. Original Work: Github @ SomiaWhiteRing',
    generate: 'Generate {title}!',
  },
  dialog: {
    edit_title: 'Edit Title',
    edit_game_name: 'Edit Work Name',
    edit_main_title: 'Edit Main Title',
  },
  common: {
    cancel: 'Cancel',
    save: 'Save', 
    close: 'Close',
    confirm: 'Confirm',
  },
  footer: {
    made_with: 'Derivative Adaptation with Claude',
    if_useful_star: 'If useful, please star →',
    powered_by: 'Powered by Bangumi & SteamGridDB',
    official_link: 'Official URL: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+ personal preferences chart (also known as "gaming preferences chart", "preferences grid") online generator. Supports multilingual titles and customizable cells, add covers via drag & drop or search, export high-resolution images with one click.',
  },
  search: {
    title: 'Search Works',
    source: 'Source:',
    placeholder: 'Enter work name to search',
    searching: 'Searching',
    search: 'Search',
    retry: 'Retry',
    no_results: 'No relevant works found',
    try_keywords: 'Please try different keywords',
    idle_hint: 'Enter work name to search',
    results_count: 'Found {count} results',
    clear: 'Clear search',
    upload_image: 'Upload image',
    bangumi_tip: 'Bangumi is a Chinese database focused on anime and games with good ACGMN+ support.',
    sgdb_tip: 'SteamGridDB is a game cover database with extensive collection but only supports English name searches.',
  },
  crop: {
    title: 'Crop Image',
    tip: 'Drag and zoom to adjust crop area',
    zoom: 'Zoom',
  },
  error: {
    file_too_large: 'Image file is too large, please upload images smaller than {size}',
    image_load_failed_retry: 'Image failed to load, please retry',
    image_load_failed_select_another: 'Image failed to load, please retry or select another image',
    loading: 'Loading...',
    processing: 'Processing...',
  },
};

export default en;
