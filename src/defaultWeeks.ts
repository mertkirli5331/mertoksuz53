import type { WeekPlan } from './types';

const titles = [
  'Oryantasyon & Temel Bilgilere Giriş',
  'Temel Kavramlar ve Hedef Belirleme',
  'Konu İncelemeleri & Kaynak Taraması',
  '1. Modül: Başlangıç Uygulamaları',
  'Analiz ve Değerlendirme',
  'Problem Çözme Teknikleri',
  '2. Modül: Derinlemesine Çalışma',
  'Pratik & Ara Değerlendirme',
  'Haftalık Tekrar & Quiz / Özet',
  'Proje Planlama & Dokümantasyon',
  'Uygulamalı Çalışma 1',
  'Uygulamalı Çalışma 2',
  'İlk Çeyrek İlerleme Değerlendirmesi',
  'İleri Seviye Konulara Giriş',
  'Vaka Analizi & Örnek Çalışmalar',
  '3. Modül: Uzmanlaşma Adımları',
  'Kritik Beceriler & Metotlar',
  'Grup / Bireysel Çalışma & Notlar',
  'Yarıyıl Kapsamlı Tekrar & Özet',
  'İkinci Dönem Hedefleri & Strateji',
  '4. Modül: Gelişmiş Uygulamalar',
  'Veri & Doküman İncelemesi',
  'Zorlayıcı Konular & Çözümler',
  'Geri Bildirim & İyileştirme',
  '5. Modül: Proje Geliştirme',
  'Entegrasyon & Sistem Tasarımı',
  'Pratik Senaryolar & Simülasyon',
  'Performans & Hız Artırma',
  '6. Modül: Kapsamlı Denemeler',
  'Hata Analizi & Eksik Giderme',
  'Büyük Proje / Tez Hazırlığı',
  'Proje Sunum & Dokümantasyonu',
  'Son Düzlük: Hızlı Hatırlatmalar',
  'Genel Tekrar & Soru Çözümü',
  'Stres Yönetimi & Zaman Planlaması',
  'Son Değerlendirme Denemeleri',
  'Nihai İnceleme & Eksiksiz Kontrol',
  '38. Hafta: Final Tamamlama & Başarı Değerlendirmesi'
];

export function getInitialDefaultWeeks(): WeekPlan[] {
  const weeks: WeekPlan[] = [];

  for (let i = 1; i <= 38; i++) {
    const title = titles[i - 1] || `${i}. Hafta`;
    const defaultLinks = [];

    // Week 1 Sample Link
    if (i === 1) {
      defaultLinks.push({
        id: 'sample-drive-1',
        title: 'Örnek: Ders & Çalışma Materyalleri Klasörü',
        url: 'https://drive.google.com',
        type: 'folder' as const,
        addedAt: new Date().toISOString(),
        notes: 'Haftalık ders materyalleri ve PDF dökümanları'
      });
    }

    // Week 3 Link requested by user
    if (i === 3) {
      defaultLinks.push({
        id: 'link-week-3-vercel',
        title: '3. Hafta Çalışma & Uygulama Bağlantısı',
        url: 'https://opjsdfl-kjsdl-kjasdl-kjds-rblc.vercel.app/',
        type: 'other' as const,
        addedAt: new Date().toISOString(),
        notes: 'Haftalık interaktif çalışma ve kaynak platformu'
      });
    }

    weeks.push({
      weekNumber: i,
      title: `${i}. Hafta: ${title}`,
      subtitle: i <= 13 ? '1. Dönem / Temel Aşama' : i <= 26 ? '2. Dönem / Gelişme Aşaması' : '3. Dönem / İleri & Final Aşaması',
      status: i === 1 ? 'in_progress' : 'not_started',
      notes: i === 1 
        ? 'Hoş geldiniz! Bu alana haftalık çalışma notlarınızı, konuları, özetleri ve yönergeleri yazabilirsiniz. Aşağıdaki Google Drive linkleri bölümünden ilgili klasör ve dosyalarınızı ekleyebilirsiniz. Eklediğiniz her şey sunucuya kaydedilir ve tüm telefon, tablet ve bilgisayarlarınızda anında görünür.'
        : i === 3 
        ? '3. Hafta çalışma ve kaynak uygulaması bağlantısı aşağıya eklenmiştir.'
        : '',
      driveLinks: defaultLinks,
      tasks: [
        { id: `task-${i}-1`, text: 'Haftalık plan ve hedefleri belirle', completed: i === 1 },
        { id: `task-${i}-2`, text: 'Google Drive kaynaklarını incele', completed: false },
        { id: `task-${i}-3`, text: 'Haftalık çalışma ve ödevleri tamamla', completed: false }
      ],
      colorTag: i <= 13 ? 'blue' : i <= 26 ? 'emerald' : 'purple',
      updatedAt: new Date().toISOString()
    });
  }

  return weeks;
}
