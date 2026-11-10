export interface CountryCurrency {
  country: string;
  currencyCode: string;
  currencySymbol: string;
  flag: string;
  defaultRateToEur: number; // e.g. 25.2 CZK per 1 EUR
}

export const COUNTRY_CURRENCY_MAP: CountryCurrency[] = [
  // Eurozone
  { country: 'Taliansko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇮🇹', defaultRateToEur: 1 },
  { country: 'Rakúsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇦🇹', defaultRateToEur: 1 },
  { country: 'Španielsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇪🇸', defaultRateToEur: 1 },
  { country: 'Grécko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇬🇷', defaultRateToEur: 1 },
  { country: 'Chorvátsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇭🇷', defaultRateToEur: 1 },
  { country: 'Francúzsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇫🇷', defaultRateToEur: 1 },
  { country: 'Nemecko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇩🇪', defaultRateToEur: 1 },
  { country: 'Portugalsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇵🇹', defaultRateToEur: 1 },
  { country: 'Slovensko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇸🇰', defaultRateToEur: 1 },
  { country: 'Holandsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇳🇱', defaultRateToEur: 1 },
  { country: 'Slovinsko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇸🇮', defaultRateToEur: 1 },
  { country: 'Cyprus', currencyCode: 'EUR', currencySymbol: '€', flag: '🇨🇾', defaultRateToEur: 1 },
  { country: 'Malta', currencyCode: 'EUR', currencySymbol: '€', flag: '🇲🇹', defaultRateToEur: 1 },

  // Non-Euro European & Neighboring
  { country: 'Česko', currencyCode: 'CZK', currencySymbol: 'Kč', flag: '🇨🇿', defaultRateToEur: 25.2 },
  { country: 'Poľsko', currencyCode: 'PLN', currencySymbol: 'zł', flag: '🇵🇱', defaultRateToEur: 4.3 },
  { country: 'Maďarsko', currencyCode: 'HUF', currencySymbol: 'Ft', flag: '🇭🇺', defaultRateToEur: 395 },
  { country: 'Spojené kráľovstvo (UK)', currencyCode: 'GBP', currencySymbol: '£', flag: '🇬🇧', defaultRateToEur: 0.85 },
  { country: 'Švajčiarsko', currencyCode: 'CHF', currencySymbol: 'CHF', flag: '🇨🇭', defaultRateToEur: 0.96 },
  { country: 'Nórsko', currencyCode: 'NOK', currencySymbol: 'kr', flag: '🇳🇴', defaultRateToEur: 11.5 },
  { country: 'Švédsko', currencyCode: 'SEK', currencySymbol: 'kr', flag: '🇸🇪', defaultRateToEur: 11.4 },
  { country: 'Dánsko', currencyCode: 'DKK', currencySymbol: 'kr', flag: '🇩🇰', defaultRateToEur: 7.46 },
  { country: 'Island', currencyCode: 'ISK', currencySymbol: 'kr', flag: '🇮🇸', defaultRateToEur: 150 },
  { country: 'Turecko', currencyCode: 'TRY', currencySymbol: '₺', flag: '🇹🇷', defaultRateToEur: 36.5 },
  { country: 'Rumunsko', currencyCode: 'RON', currencySymbol: 'lei', flag: '🇷🇴', defaultRateToEur: 4.97 },
  { country: 'Bulharsko', currencyCode: 'BGN', currencySymbol: 'лв', flag: '🇧🇬', defaultRateToEur: 1.95 },
  { country: 'Albánsko', currencyCode: 'ALL', currencySymbol: 'Lek', flag: '🇦🇱', defaultRateToEur: 100 },

  // World
  { country: 'Japonsko', currencyCode: 'JPY', currencySymbol: '¥', flag: '🇯🇵', defaultRateToEur: 165 },
  { country: 'USA', currencyCode: 'USD', currencySymbol: '$', flag: '🇺🇸', defaultRateToEur: 1.08 },
  { country: 'Spojené arabské emiráty (Dubaj)', currencyCode: 'AED', currencySymbol: 'AED', flag: '🇦🇪', defaultRateToEur: 3.97 },
  { country: 'Thajsko', currencyCode: 'THB', currencySymbol: '฿', flag: '🇹🇭', defaultRateToEur: 38.5 },
  { country: 'Indonézia (Bali)', currencyCode: 'IDR', currencySymbol: 'Rp', flag: '🇮🇩', defaultRateToEur: 17200 },
  { country: 'Vietnam', currencyCode: 'VND', currencySymbol: '₫', flag: '🇻🇳', defaultRateToEur: 27000 },
  { country: 'Kanada', currencyCode: 'CAD', currencySymbol: 'CA$', flag: '🇨🇦', defaultRateToEur: 1.48 },
  { country: 'Austrália', currencyCode: 'AUD', currencySymbol: 'AU$', flag: '🇦🇺', defaultRateToEur: 1.66 },
  { country: 'Maroko', currencyCode: 'MAD', currencySymbol: 'DH', flag: '🇲🇦', defaultRateToEur: 10.8 },
  { country: 'Egypt', currencyCode: 'EGP', currencySymbol: 'E£', flag: '🇪🇬', defaultRateToEur: 52 },
];

export function getCurrencyForCountry(countryName?: string): CountryCurrency {
  if (!countryName) {
    return { country: 'Slovensko', currencyCode: 'EUR', currencySymbol: '€', flag: '🇸🇰', defaultRateToEur: 1 };
  }
  const clean = countryName.trim().toLowerCase();
  const match = COUNTRY_CURRENCY_MAP.find(
    (c) => c.country.toLowerCase() === clean
  );
  if (match) return match;

  const partial = COUNTRY_CURRENCY_MAP.find((c) =>
    clean.includes(c.country.toLowerCase()) || c.country.toLowerCase().includes(clean)
  );
  if (partial) return partial;

  return { country: countryName, currencyCode: 'EUR', currencySymbol: '€', flag: '🌍', defaultRateToEur: 1 };
}
