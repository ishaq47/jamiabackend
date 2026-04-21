import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from './models/News.js';

dotenv.config();

const sampleNews = [
  {
    title: {
      en: 'Annual Conference 2024',
      ur: 'سالانہ اجتماع 2024',
      ar: 'المؤتمر السنوي 2024',
    },
    description: {
      en: 'Our annual Islamic conference will be held next month with scholars from around the world.',
      ur: 'ہماری سالانہ اسلامی کانفرنس اگلے ماہ منعقد ہوگی جس میں دنیا بھر کے علماء شرکت کریں گے۔',
      ar: 'سيعقد مؤتمرنا الإسلامي السنوي الشهر المقبل بمشاركة علماء من جميع أنحاء العالم.',
    },
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800',
  },
  {
    title: {
      en: 'New Admissions Open',
      ur: 'نئے داخلے کھلے ہیں',
      ar: 'القبول الجديد مفتوح',
    },
    description: {
      en: 'Admissions for the new academic year are now open. Apply before the deadline.',
      ur: 'نئے تعلیمی سال کے لیے داخلے شروع ہو چکے ہیں۔ آخری تاریخ سے پہلے درخواست دیں۔',
      ar: 'القبول للعام الدراسي الجديد مفتوح الآن. قدم طلبك قبل الموعد النهائي.',
    },
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
  },
  {
    title: {
      en: 'Quran Competition Results',
      ur: 'مسابقہ قرآن کے نتائج',
      ar: 'نتائج مسابقة القرآن',
    },
    description: {
      en: 'Congratulations to the winners of this year Quran memorization competition.',
      ur: 'اس سال کے مسابقہ حفظ قرآن کے فاتحین کو مبارکباد۔',
      ar: 'تهانينا للفائزين في مسابقة حفظ القرآن لهذا العام.',
    },
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800',
  },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await News.deleteMany();
  await News.insertMany(sampleNews);
  console.log('✅ Seeded');
  process.exit();
});