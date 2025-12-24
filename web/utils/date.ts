export const CURRENT_YEAR = new Date().getFullYear();
export const NEXT_YEAR = new Date().getFullYear() + 1;

// If we are in Q4 (Oct, Nov, Dec), optimize for the next year.
// getMonth() is 0-indexed (0=Jan, 11=Dec). 9=Oct.
export const SEO_YEAR = new Date().getMonth() >= 9 ? NEXT_YEAR : CURRENT_YEAR;
