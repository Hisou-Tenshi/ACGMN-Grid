const zhCN = {
  meta: {
    title: 'ACGMN+生涯个人喜好表｜ACGMN+喜好表生成器',
    description: '创建你的ACGMN+生涯喜好表（ACGMN+喜好表/九宫格），支持多语言与自定义格子，一键导出高清图片。',
  },
  global: {
    main_title: 'ACGMN+生涯个人喜好表',
  },
  cell_titles: [
  "第一部",
  "最一眼缘",
  "最长陪伴",
  "最一口气看完",
  "最爱泡面",
  "总有一天能补完",

  "最惊喜",
  "最残念",
  "最快乐",
  "最意犹未尽",
  "最莫名其妙地喜欢",
  "最想有人陪看",

  "最喜欢",
  "最想安利",
  "最小众精品",
  "最爷青回",
  "最期待续作",
  "最想早点遇见",

  "最好评",
  "最差评",
  "最被高估",
  "最难评",
  "最想吐槽",
  "最佳剧情",
],
  ui: {
    tip_edit:
      'Ciallo～(∠・ω＜ )⌒★\n提示：点击顶部标题、格子标题或作品名称可以编辑；也可直接拖拽图片到格子中，或通过链接直接下载。作品名称支持自动换行，也可输入＼n强制换行一次。\n原作: [Github@SomiaWhiteRing](https://github.com/SomiaWhiteRing)\n借物表：【[游戏生涯九宫格](https://github.com/SomiaWhiteRing/game-grid/)】【[动画生涯九宫格](https://github.com/itorr/anime-grid)】',
    generate: '生成{title}！',
  },
  dialog: {
    edit_title: '编辑标题',
    edit_game_name: '编辑对象名称',
    edit_main_title: '编辑主标题',
  },
  common: {
    cancel: '取消',
    save: '保存',
    close: '关闭',
    confirm: '确认',
  },
  footer: {
    made_with: '二次创作 with Claude & Trae',
    if_useful_star: '如果觉得对你有用请点 →',
    powered_by: 'Powered by Bangumi & SteamGridDB',
    official_link: '唯一指定链接：acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+生涯个人喜好表（原作也常称作“游戏生涯喜好表”、“游戏喜好表”、“游戏喜好九宫格”）在线生成器。支持多语言标题与自定义格子，拖拽或搜索添加封面，一键导出高分辨率图片。',
  },
  search: {
    title: '搜索对象',
    source: '搜索源：',
    placeholder: '输入对象名称开始搜索',
    searching: '搜索中',
    search: '搜索',
    retry: '重试',
    no_results: '未找到相关对象',
    try_keywords: '请尝试不同的关键词',
    idle_hint: '输入对象名称开始搜索',
    results_count: '找到 {count} 个结果',
    clear: '清除搜索',
    upload_image: '上传图片',
    bangumi_tip: 'Bangumi 是专注动画、游戏的中文数据库，对 ACGMN+ 相关支持较好。',
    sgdb_tip: 'SteamGridDB 是游戏封面数据库，收录丰富，但仅支持英文名搜索。',
  },
  crop: {
    title: '裁剪图片',
    tip: '拖动和缩放图片以调整裁剪区域',
    zoom: '缩放',
  },
  error: {
    file_too_large: '图片文件过大，请上传小于{size}的图片',
    image_load_failed_retry: '图片加载失败，请重试',
    image_load_failed_select_another: '图片加载失败，请重试或选择其他图片',
    loading: '加载中...',
    processing: '处理中...',
  },
};

export default zhCN;
