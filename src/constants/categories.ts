export const CATEGORIES = ['CLASSIC', 'POP', 'K-POP', 'OST', 'ANI', 'ETC'] as const;

export type Category = typeof CATEGORIES[number];
