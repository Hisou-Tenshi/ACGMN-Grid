const zhTW = {
  meta: {
    title: 'ACGMN+生涯個人喜好表｜ACGMN+喜好表生成器',
    description: '建立你的ACGMN+生涯喜好表（ACGMN+喜好表/九宮格），支援多語言與自訂格位，一鍵匯出高畫質圖片。',
  },
  global: {
    main_title: 'ACGMN+生涯個人喜好表',
  },
  cell_titles: [
    "第一部",
    "最喜歡", 
    "最一眼緣",
    "最想吐槽",
    "最長陪伴",
    "最快樂的",
    
    "最佳劇情",
    "最佳畫面",
    "最佳音樂",
    "最佳配音",
    "最佳塑造",
    "最佳結局",
    
    "最想推坑",
    "最愛泡麵番",
    "最好評",
    "最差評",
    "最被低估",
    "最被高估",
    
    "最期待續作",
    "最意猶未盡",
    "我怎麼會喜歡這個",
    "總有一天能補完",
    "爺青回",
    "它好冷門我好愛",
  ],
  ui: {
    tip_edit:
      '提示：點擊頂部標題、格位標題或作品名稱可以編輯；也可直接拖曳圖片到格位中。作品名稱支援自動換行，也可輸入＼n強制換行一次。Original Work: Github @ SomiaWhiteRing',
    generate: '產生{title}！',
  },
  dialog: {
    edit_title: '編輯標題',
    edit_game_name: '編輯作品名稱',
    edit_main_title: '編輯主標題',
  },
  common: {
    cancel: '取消',
    save: '儲存',
    close: '關閉',
    confirm: '確認',
  },
  footer: {
    made_with: '二次創作 with Claude',
    if_useful_star: '如果覺得對你有用請點 →',
    powered_by: 'Powered by Bangumi & SteamGridDB',
    official_link: '唯一指定連結：acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+生涯個人喜好表（原作也常稱作「遊戲生涯喜好表」、「遊戲喜好表」、「遊戲喜好九宮格」）線上生成器。支援多語言標題與自訂格位，拖曳或搜尋新增封面，一鍵匯出高解析度圖片。',
  },
  search: {
    title: '搜尋作品',
    source: '搜尋來源：',
    placeholder: '輸入作品名稱開始搜尋',
    searching: '搜尋中',
    search: '搜尋',
    retry: '重試',
    no_results: '未找到相關作品',
    try_keywords: '請嘗試不同的關鍵字',
    idle_hint: '輸入作品名稱開始搜尋',
    results_count: '找到 {count} 個結果',
    clear: '清除搜尋',
    upload_image: '上傳圖片',
    bangumi_tip: 'Bangumi 是專注動畫、遊戲的中文資料庫，對 ACGMN+ 相關支援較好。',
    sgdb_tip: 'SteamGridDB 是遊戲封面資料庫，收錄豐富，但僅支援英文名稱搜尋。',
  },
  crop: {
    title: '裁剪圖片',
    tip: '拖動和縮放圖片以調整裁剪區域',
    zoom: '縮放',
  },
  error: {
    file_too_large: '圖片檔案過大，請上傳小於{size}的圖片',
    image_load_failed_retry: '圖片載入失敗，請重試',
    image_load_failed_select_another: '圖片載入失敗，請重試或選擇其他圖片',
    loading: '載入中...',
    processing: '處理中...',
  },
};

export default zhTW;
