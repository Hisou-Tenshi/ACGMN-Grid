const ko = {
  meta: {
    title: 'ACGMN+ 취향표｜ACGMN+ 취향표 생성기',
    description: '나만의 ACGMN+ 취향표(ACGMN+ 취향표/3x3 그리드)를 만들어보세요. 다국어 지원과 커스텀 칸 설정이 가능하며, 한 번의 클릭으로 고화질 이미지를 내보낼 수 있습니다.',
  },
  global: {
    main_title: 'ACGMN+ 개인 취향표',
  },
  cell_titles: [
  "첫 작품",
  "첫눈에 반한",
  "가장 오래 함께한",
  "한 번에 정주행한",
  "라면과 함께",
  "언젠가 완주할",

  "가장 놀라운",
  "가장 아쉬운",
  "가장 행복한",
  "아쉬움 남는",
  "이유 없이 좋은",
  "같이 보고 싶은",

  "가장 좋아하는",
  "가장 추천하고 싶은",
  "숨은 명작",
  "가장 향수로운",
  "가장 기대되는 속편",
  "더 일찍 만났으면",

  "최고 평점",
  "최저 평점",
  "가장 과대평가",
  "평가하기 가장 어려운",
  "가장 태클 걸고 싶은",
  "최고의 스토리",
],
  ui: {
    tip_edit:
      '팁: 상단 제목, 칸 제목 또는 작품 이름을 클릭하여 편집할 수 있습니다. 이미지를 칸으로 직접 끌어다 놓을 수도 있습니다. 작품 이름은 자동 줄바꿈을 지원하며, ＼n을 입력하여 강제 줄바꿈할 수 있습니다. Original Work: Github @ SomiaWhiteRing',
    generate: '{title} 생성하기!',
  },
  dialog: {
    edit_title: '제목 편집',
    edit_game_name: '작품 이름 편집',
    edit_main_title: '메인 제목 편집',
  },
  common: {
    cancel: '취소',
    save: '저장', 
    close: '닫기',
    confirm: '확인',
  },
  footer: {
    made_with: 'Claude를 통한 파생 어댑테이션',
    if_useful_star: '도움이 되셨다면 별점을 →',
    powered_by: 'Powered by Bangumi & SteamGridDB',
    official_link: '공식 링크: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+ 개인 취향표(원작에서는 "게임 취향표", "취향표", "3x3 취향 그리드"로도 불림) 온라인 생성기. 다국어 제목과 커스텀 칸을 지원하며, 드래그 앤 드롭이나 검색으로 커버를 추가하고, 고해상도 이미지를 한 번의 클릭으로 내보낼 수 있습니다.',
  },
  search: {
    title: '작품 검색',
    source: '검색 소스:',
    placeholder: '작품 이름을 입력하여 검색',
    searching: '검색 중',
    search: '검색',
    retry: '다시 시도',
    no_results: '관련 작품을 찾을 수 없습니다',
    try_keywords: '다른 키워드로 시도해 보세요',
    idle_hint: '작품 이름을 입력하여 검색',
    results_count: '{count}개의 결과를 찾았습니다',
    clear: '검색 지우기',
    upload_image: '이미지 업로드',
    bangumi_tip: 'Bangumi는 애니메이션과 게임에 특화된 중국어 데이터베이스로, ACGMN+ 관련 지원이 잘 되어 있습니다.',
    sgdb_tip: 'SteamGridDB는 게임 커버 데이터베이스로 콜렉션이 풍부하지만, 영어 이름으로만 검색이 가능합니다.',
  },
  crop: {
    title: '이미지 자르기',
    tip: '드래그 및 줌으로 자르기 영역 조정',
    zoom: '줌',
  },
  error: {
    file_too_large: '이미지 파일이 너무 큽니다. {size}보다 작은 이미지를 업로드하세요',
    image_load_failed_retry: '이미지 로드 실패, 다시 시도하세요',
    image_load_failed_select_another: '이미지 로드 실패, 다시 시도하거나 다른 이미지를 선택하세요',
    loading: '로딩 중...',
    processing: '처리 중...',
  },
};

export default ko;
