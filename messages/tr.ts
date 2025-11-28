const tr = {
  meta: {
    title: 'ACGMN+ Kişisel Tercihler Tablosu｜ACGMN+ Tercih Tablosu Oluşturucu',
    description: 'ACGMN+ kişisel tercihler tablonuzu (ACGMN+ tercih tablosu/3x3 ızgara) oluşturun. Çok dilli destek ve özelleştirilebilir hücrelerle, tek tıkla yüksek kaliteli görseller dışa aktarın.',
  },
  global: {
    main_title: 'ACGMN+ Kişisel Tercihler Tablosu',
  },
  cell_titles: [
    "İlk Eser",
    "Tüm Zamanların Favorisi", 
    "İlk Görüşte Aşk",
    "En Çok Eleştirilen",
    "En Uzun Süreli Eşlik Eden",
    "En Mutluluk Veren Deneyim",
    
    "En İyi Hikaye",
    "En İyi Görsel", 
    "En İyi Müzik",
    "En İyi Seslendirme",
    "En İyi Karakter Gelişimi",
    "En İyi Son",
    
    "En Çok Tavsiye Edilen",
    "En Sevdiğim Kısa Eser",
    "En Yüksek Puan Alan",
    "En Düşük Puan Alan",
    "En Görmezden Gelinen",
    "En Abartılan",
    
    "En Çok Beklenen Devam Filmi",
    "En Çok Aklımda Kalan", 
    "Neden Bunu Seviyorum?",
    "Bir Gün Mutlaka Bitireceğim",
    "Gençlik Günlerime Dönüş",
    "Az Bilinen Ama Sevilen",
  ],
  ui: {
    tip_edit:
      'İpucu: Üst başlıklara, hücre başlıklarına veya eser adlarına tıklayarak düzenleyebilirsiniz; ayrıca resimleri doğrudan hücrelere sürükleyip bırakabilirsiniz. Eser adları otomatik satır sonunu destekler, zorunlu satır sonu için ＼n kullanın. Orijinal Çalışma: Github @ SomiaWhiteRing',
    generate: '{title} Oluştur!',
  },
  dialog: {
    edit_title: 'Başlığı Düzenle',
    edit_game_name: 'Eser Adını Düzenle',
    edit_main_title: 'Ana Başlığı Düzenle',
  },
  common: {
    cancel: 'İptal',
    save: 'Kaydet', 
    close: 'Kapat',
    confirm: 'Onayla',
  },
  footer: {
    made_with: 'Claude ile Türev Uyarlama',
    if_useful_star: 'Yararlı bulduysanız lütfen yıldız verin →',
    powered_by: 'Bangumi & SteamGridDB tarafından desteklenmektedir',
    official_link: 'Resmi bağlantı: acgmn-grid.vercel.app',
  },
  seo: {
    intro:
      'ACGMN+ kişisel tercihler tablosu (orijinalde "oyun tercihleri tablosu", "tercih tablosu", "3x3 tercih ızgarası" olarak da bilinir) çevrimiçi oluşturucu. Çok dilli başlık ve özelleştirilebilir hücre desteği, sürükle-bırak veya arama ile kapak ekleme, tek tıkla yüksek çözünürlüklü görsel dışa aktarma.',
  },
  search: {
    title: 'Eser Ara',
    source: 'Kaynak:',
    placeholder: 'Eser adını girin ve arayın',
    searching: 'Aranıyor',
    search: 'Ara',
    retry: 'Yeniden Dene',
    no_results: 'İlgili eser bulunamadı',
    try_keywords: 'Lütfen farklı anahtar kelimeler deneyin',
    idle_hint: 'Eser adını girin ve arayın',
    results_count: '{count} sonuç bulundu',
    clear: 'Aramayı Temizle',
    upload_image: 'Görsel Yükle',
    bangumi_tip: 'Bangumi, anime ve oyunlara odaklanan bir Çin veritabanıdır ve ACGMN+ ile iyi entegrasyona sahiptir.',
    sgdb_tip: 'SteamGridDB, zengin koleksiyona sahip bir oyun kapağı veritabanıdır, ancak yalnızca İngilizce aramayı destekler.',
  },
  crop: {
    title: 'Görseli kırp',
    tip: 'Kırpma alanını ayarlamak için sürükleyin ve yakınlaştırın',
    zoom: 'Yakınlaştır',
  },
  error: {
    file_too_large: 'Görsel dosyası çok büyük, lütfen {size} boyutundan küçük görseller yükleyin',
    image_load_failed_retry: 'Görsel yüklenemedi, lütfen tekrar deneyin',
    image_load_failed_select_another: 'Görsel yüklenemedi, tekrar deneyin veya başka bir görsel seçin',
    loading: 'Yüklenıyor...',
    processing: 'İşleniyor...',
  },
};

export default tr;
