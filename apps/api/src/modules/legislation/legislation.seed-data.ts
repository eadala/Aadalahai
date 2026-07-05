export interface LegislationSeedArticle {
  articleRef: string;
  content: string;
}

export interface LegislationSeedItem {
  title: string;
  category: string;
  jurisdiction: string;
  articles: LegislationSeedArticle[];
}

export const LEGISLATION_CORPUS_SEED: LegislationSeedItem[] = [
  {
    title: "نظام العمل السعودي",
    category: "عمل",
    jurisdiction: "السعودية",
    articles: [
      {
        articleRef: "المادة 77",
        content:
          "المادة 77: يحق للعامل الحصول على إجازة سنوية مدفوعة الأجر لا تقل عن واحد وعشرين يومًا عن كل سنة.",
      },
      {
        articleRef: "المادة 80",
        content:
          "المادة 80: لا يجوز لصاحب العمل إنهاء عقد العمل دون مكافأة أو إشعار إلا في الحالات المنصوص عليها نظامًا.",
      },
    ],
  },
  {
    title: "نظام الإجراءات الجزائية",
    category: "جزائي",
    jurisdiction: "السعودية",
    articles: [
      {
        articleRef: "المادة 112",
        content:
          "المادة 112: للمتهم الحق في الاستعانة بمحامٍ للدفاع عنه في جميع مراحل الدعوى الجزائية.",
      },
    ],
  },
];
