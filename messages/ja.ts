const ja = {
  meta: {
    title: 'ACGMN+個人好み表｜ACGMN+好み表ジェネレーター',
    description: 'あなたのACGMN+個人好み表（ACGMN+好み表/3x3グリッド）を作成。多言語対応、カスタム可能なセル、ワンクリックで高画質画像をエクスポート。',
  },
  global: {
    main_title: 'ACGMN+個人好み表',
  },
  cell_titles: [
    "最初に触れた作品",
    "一番好き", 
    "一目惚れ",
    "一番ツッコミたい",
    "一番長く付き合った",
    "一番楽しかった",
    
    "最高のストーリー", 
    "最高のビジュアル",
    "最高の音楽",
    "最高の声優",
    "最高のキャラ造形",
    "最高のエンディング",
    
    "一番オススメしたい",
    "一番好きな短編",
    "最高評価",
    "最低評価",
    "一番過小評価",
    "一番過大評価",
    
    "一番期待する続編", 
    "一番名残惜しい",
    "なんでこれ好きなんだろう",
    "いつか完走したい",
    "青春の思い出",
    "マイナーだけど大好き",
  ],
  ui: {
    tip_edit:
      'ヒント：上部のタイトル、セルタイトル、作品名をクリックして編集可能。画像をセルに直接ドラッグ＆ドロップもできます。作品名は自動改行に対応、＼nで強制改行も可能。Original Work: Github @ SomiaWhiteRing',
    generate: '{title}を生成！',
  },
  dialog: {
    edit_title: 'タイトルを編集',
    edit_game_name: '作品名を編集',
    edit_main_title: 'メインタイトルを編集',
  },
  common: {
    cancel: 'キャンセル',
    save: '保存', 
    close: '閉じる',
    confirm: '確認',
  },
  footer: {
    made_with: 'Claudeによる二次創作',
    if_useful_star: '役に立ったらスターを →',
    powered_by: 'Powered by Bangumi & SteamGridDB',
    official_link: '公式URL：acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+個人好み表（元は「ゲーム好み表」「好み表」「3x3好みグリッド」とも呼ばれる）オンラインジェネレーター。多言語タイトル、カスタム可能なセル、ドラッグ＆ドロップや検索でカバー追加、高解像度画像をワンクリックでエクスポート。',
  },
  search: {
    title: '作品を検索',
    source: '検索元：',
    placeholder: '作品名を入力して検索',
    searching: '検索中',
    search: '検索',
    retry: '再試行',
    no_results: '該当する作品が見つかりません',
    try_keywords: '別のキーワードをお試しください',
    idle_hint: '作品名を入力して検索',
    results_count: '{count}件見つかりました',
    clear: '検索をクリア',
    upload_image: '画像をアップロード',
    bangumi_tip: 'Bangumiはアニメ・ゲームに特化した中国語データベースで、ACGMN+関連のサポートが充実しています。',
    sgdb_tip: 'SteamGridDBはゲームカバーのデータベースで収録数が豊富ですが、英語名でのみ検索可能です。',
  },
  crop: {
    title: '画像をトリミング',
    tip: 'ドラッグまたはズームでトリミング範囲を調整',
    zoom: 'ズーム',
  },
  error: {
    file_too_large: '画像ファイルが大きすぎます。{size}以下の画像をアップロードしてください',
    image_load_failed_retry: '画像の読み込みに失敗しました。再試行してください',
    image_load_failed_select_another: '画像の読み込みに失敗しました。再試行するか別の画像を選択してください',
    loading: '読み込み中...',
    processing: '処理中...',
  },
};

export default ja;
