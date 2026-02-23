interface Arrangement {
  id: string;
  name: string;
  version: string;
  createdAt: string;
}


interface Score {
  id: string;
  title: string;
  arrangements: Arrangement[];
  createdAt: string;
}


export const mockScores: Score[] = [
  {
    id: "s1",
    title: "Canon in D",
    createdAt: "2025-11-20",
    arrangements: [
      { id: "a1", name: "현악 3중주 (Vn, Vn, Vc)", version: "v2.1", createdAt: "2025-11-20" },
      { id: "a2", name: "현악 4중주 (Vn, Vn, Va, Vc)", version: "v1.0", createdAt: "2025-10-15" },
      { id: "a3", name: "피아노 솔로 (Pf)", version: "v1.0", createdAt: "2025-09-01" },
    ],
  },
  {
    id: "s2",
    title: "River Flows in You",
    createdAt: "2025-12-01",
    arrangements: [
      { id: "a4", name: "피아노 솔로 (Pf)", version: "v1.2", createdAt: "2025-12-01" },
    ],
  },
  {
    id: "s3",
    title: "A Thousand Years",
    createdAt: "2026-01-10",
    arrangements: [
      { id: "a5", name: "현악 5중주 (Vn, Vn, Va, Vc, Cb)", version: "v1.0", createdAt: "2026-01-10" },
      { id: "a6", name: "현악 4중주 (Vn, Vn, Va, Vc)", version: "v1.0", createdAt: "2026-01-05" },
    ],
  },
  {
    id: "s4",
    title: "Wedding March",
    createdAt: "2024-06-22",
    arrangements: [
      { id: "a7", name: "브라스 앙상블 (Tp, Tp, Hn, Tb, Tu)", version: "v3.0", createdAt: "2024-06-22" },
    ],
  },
  {
    id: "s5",
    title: "Spring Waltz",
    createdAt: "2026-02-05",
    arrangements: [
      { id: "a8", name: "플룻 듀엣 (Fl, Fl)", version: "v1.0", createdAt: "2026-02-05" },
    ],
  },
];