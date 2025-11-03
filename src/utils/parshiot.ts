import { parshiot } from '@hebcal/core';

/**
 * מיפוי דו-כיווני בין שמות פרשות באנגלית לעברית
 */
export const parashaMapping: { [key: string]: string } = {
  // English to Hebrew
  'Bereshit': 'בראשית',
  'Noach': 'נח',
  'Lech-Lecha': 'לך לך',
  'Vayera': 'וירא',
  'Chayei Sara': 'חיי שרה',
  'Toldot': 'תולדות',
  'Vayetzei': 'ויצא',
  'Vayishlach': 'וישלח',
  'Vayeshev': 'וישב',
  'Miketz': 'מקץ',
  'Vayigash': 'ויגש',
  'Vayechi': 'ויחי',
  'Shemot': 'שמות',
  'Vaera': 'וארא',
  'Bo': 'בא',
  'Beshalach': 'בשלח',
  'Yitro': 'יתרו',
  'Mishpatim': 'משפטים',
  'Terumah': 'תרומה',
  'Tetzaveh': 'תצוה',
  'Ki Tisa': 'כי תשא',
  'Vayakhel': 'ויקהל',
  'Pekudei': 'פקודי',
  'Vayikra': 'ויקרא',
  'Tzav': 'צו',
  'Shmini': 'שמיני',
  'Tazria': 'תזריע',
  'Metzora': 'מצורע',
  'Achrei Mot': 'אחרי מות',
  'Kedoshim': 'קדושים',
  'Emor': 'אמור',
  'Behar': 'בהר',
  'Bechukotai': 'בחקתי',
  'Bamidbar': 'במדבר',
  'Nasso': 'נשא',
  "Beha'alotcha": 'בהעלתך',
  "Sh'lach": 'שלח לך',
  'Korach': 'קרח',
  'Chukat': 'חקת',
  'Balak': 'בלק',
  'Pinchas': 'פינחס',
  'Matot': 'מטות',
  'Masei': 'מסעי',
  'Devarim': 'דברים',
  'Vaetchanan': 'ואתחנן',
  'Eikev': 'עקב',
  "Re'eh": 'ראה',
  'Shoftim': 'שפטים',
  'Ki Teitzei': 'כי תצא',
  'Ki Tavo': 'כי תבוא',
  'Nitzavim': 'נצבים',
  'Vayeilech': 'וילך',
  "Ha'azinu": 'האזינו',
  
  // Hebrew to English (reverse mapping)
  'בראשית': 'Bereshit',
  'נח': 'Noach',
  'לך לך': 'Lech-Lecha',
  'וירא': 'Vayera',
  'חיי שרה': 'Chayei Sara',
  'תולדות': 'Toldot',
  'ויצא': 'Vayetzei',
  'וישלח': 'Vayishlach',
  'וישב': 'Vayeshev',
  'מקץ': 'Miketz',
  'ויגש': 'Vayigash',
  'ויחי': 'Vayechi',
  'שמות': 'Shemot',
  'וארא': 'Vaera',
  'בא': 'Bo',
  'בשלח': 'Beshalach',
  'יתרו': 'Yitro',
  'משפטים': 'Mishpatim',
  'תרומה': 'Terumah',
  'תצוה': 'Tetzaveh',
  'כי תשא': 'Ki Tisa',
  'ויקהל': 'Vayakhel',
  'פקודי': 'Pekudei',
  'ויקרא': 'Vayikra',
  'צו': 'Tzav',
  'שמיני': 'Shmini',
  'תזריע': 'Tazria',
  'מצורע': 'Metzora',
  'אחרי מות': 'Achrei Mot',
  'קדושים': 'Kedoshim',
  'אמור': 'Emor',
  'בהר': 'Behar',
  'בחקתי': 'Bechukotai',
  'במדבר': 'Bamidbar',
  'נשא': 'Nasso',
  'בהעלתך': "Beha'alotcha",
  'שלח לך': "Sh'lach",
  'קרח': 'Korach',
  'חקת': 'Chukat',
  'בלק': 'Balak',
  'פינחס': 'Pinchas',
  'מטות': 'Matot',
  'מסעי': 'Masei',
  'דברים': 'Devarim',
  'ואתחנן': 'Vaetchanan',
  'עקב': 'Eikev',
  'ראה': "Re'eh",
  'שפטים': 'Shoftim',
  'כי תצא': 'Ki Teitzei',
  'כי תבוא': 'Ki Tavo',
  'נצבים': 'Nitzavim',
  'וילך': 'Vayeilech',
  'האזינו': "Ha'azinu"
};

/**
 * רשימת כל הפרשות בעברית (54 פרשות)
 * מסודרות לפי סדר הופעתן בשנה
 */
export const parshiotList = parshiot.map(englishName => ({
  english: englishName,
  hebrew: parashaMapping[englishName] || englishName
}));

/**
 * רשימת פרשות מאוחדות נפוצות (בשנים מסוימות)
 */
export const combinedParshiot = [
  { english: 'Vayakhel-Pekudei', hebrew: 'ויקהל-פקודי' },
  { english: 'Tazria-Metzora', hebrew: 'תזריע-מצורע' },
  { english: 'Achrei Mot-Kedoshim', hebrew: 'אחרי מות-קדושים' },
  { english: 'Behar-Bechukotai', hebrew: 'בהר-בחקתי' },
  { english: 'Chukat-Balak', hebrew: 'חקת-בלק' },
  { english: 'Matot-Masei', hebrew: 'מטות-מסעי' },
  { english: 'Nitzavim-Vayeilech', hebrew: 'נצבים-וילך' }
];

/**
 * רשימה מלאה של כל הפרשות כולל פרשות מאוחדות
 */
export const allParshiot = [
  ...parshiotList,
  ...combinedParshiot
];

/**
 * המרת שם פרשה מאנגלית לעברית
 */
export function toHebrewParasha(englishName: string): string {
  return parashaMapping[englishName] || englishName;
}

/**
 * המרת שם פרשה מעברית לאנגלית
 */
export function toEnglishParasha(hebrewName: string): string {
  return parashaMapping[hebrewName] || hebrewName;
}

/**
 * קבלת רשימת פרשות עבור Select dropdown
 * מחזיר מערך של אובייקטים עם value (אנגלית) ו-label (עברית)
 */
export function getParshiotForSelect() {
  return allParshiot.map(parasha => ({
    value: parasha.english,
    label: parasha.hebrew
  }));
}
