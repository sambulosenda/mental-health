import { Platform, NativeModules } from 'react-native';

export interface CrisisResource {
  name: string;
  description: string;
  phone?: string;
  text?: { number: string; message: string };
  website?: string;
  available: string; // e.g., "24/7", "7am-11pm"
}

export interface CountryResources {
  country: string;
  countryCode: string;
  flag: string;
  resources: CrisisResource[];
}

// Get device locale
export function getDeviceLocale(): string {
  try {
    if (Platform.OS === 'ios') {
      return (
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        'en-GB'
      );
    }
    return NativeModules.I18nManager?.localeIdentifier || 'en-GB';
  } catch {
    return 'en-GB';
  }
}

// Get country code from locale
export function getCountryFromLocale(locale: string): string {
  const parts = locale.replace('_', '-').split('-');
  return parts[parts.length - 1]?.toUpperCase() || 'GB';
}

export const CRISIS_RESOURCES: CountryResources[] = [
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    resources: [
      {
        name: 'Samaritans',
        description: 'Emotional support for anyone in distress',
        phone: '116 123',
        website: 'https://samaritans.org',
        available: '24/7, free',
      },
      {
        name: 'SHOUT',
        description: 'Crisis text line for when you need support',
        text: { number: '85258', message: 'SHOUT' },
        website: 'https://giveusashout.org',
        available: '24/7, free',
      },
      {
        name: 'CALM',
        description: 'Campaign Against Living Miserably (men\'s support)',
        phone: '0800 58 58 58',
        website: 'https://thecalmzone.net',
        available: '5pm-midnight, free',
      },
      {
        name: 'Papyrus HOPELINEUK',
        description: 'For young people under 35',
        phone: '0800 068 4141',
        text: { number: '07860 039967', message: 'your message' },
        website: 'https://papyrus-uk.org',
        available: '9am-midnight, free',
      },
      {
        name: 'Childline',
        description: 'For children and young people under 19',
        phone: '0800 1111',
        website: 'https://childline.org.uk',
        available: '24/7, free',
      },
      {
        name: 'Anxiety UK',
        description: 'Support for anxiety disorders',
        phone: '03444 775 774',
        website: 'https://anxietyuk.org.uk',
        available: 'Mon-Fri 9:30am-5:30pm',
      },
      {
        name: 'Beat Eating Disorders',
        description: 'Support for eating disorders',
        phone: '0808 801 0677',
        website: 'https://beateatingdisorders.org.uk',
        available: '365 days, 9am-8pm weekdays',
      },
      {
        name: 'Switchboard LGBT+',
        description: 'LGBTQ+ support helpline',
        phone: '0300 330 0630',
        website: 'https://switchboard.lgbt',
        available: '10am-10pm daily',
      },
      {
        name: 'National Domestic Abuse Helpline',
        description: 'Support for domestic abuse',
        phone: '0808 2000 247',
        website: 'https://nationaldahelpline.org.uk',
        available: '24/7, free',
      },
    ],
  },
  {
    country: 'Ireland',
    countryCode: 'IE',
    flag: '🇮🇪',
    resources: [
      {
        name: 'Samaritans Ireland',
        description: 'Emotional support for anyone in distress',
        phone: '116 123',
        website: 'https://samaritans.org',
        available: '24/7, free',
      },
      {
        name: '50808',
        description: 'Crisis text line',
        text: { number: '50808', message: 'HELLO' },
        website: 'https://text50808.ie',
        available: '24/7, free',
      },
      {
        name: 'Pieta House',
        description: 'Suicide and self-harm crisis support',
        phone: '1800 247 247',
        website: 'https://pieta.ie',
        available: '24/7, free',
      },
      {
        name: 'Aware',
        description: 'Depression and bipolar support',
        phone: '1800 80 48 48',
        website: 'https://aware.ie',
        available: '10am-10pm daily',
      },
    ],
  },
  {
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        description: 'National crisis support',
        phone: '988',
        text: { number: '988', message: 'HELLO' },
        website: 'https://988lifeline.org',
        available: '24/7, free',
      },
      {
        name: 'Crisis Text Line',
        description: 'Text-based crisis support',
        text: { number: '741741', message: 'HOME' },
        website: 'https://crisistextline.org',
        available: '24/7, free',
      },
      {
        name: 'SAMHSA National Helpline',
        description: 'Substance abuse and mental health',
        phone: '1-800-662-4357',
        website: 'https://samhsa.gov/find-help/national-helpline',
        available: '24/7, free',
      },
      {
        name: 'Trevor Project',
        description: 'LGBTQ+ youth crisis support',
        phone: '1-866-488-7386',
        text: { number: '678-678', message: 'START' },
        website: 'https://thetrevorproject.org',
        available: '24/7, free',
      },
    ],
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    resources: [
      {
        name: '988 Suicide Crisis Helpline',
        description: 'National crisis support',
        phone: '988',
        website: 'https://988.ca',
        available: '24/7, free',
      },
      {
        name: 'Crisis Services Canada',
        description: 'National crisis line',
        phone: '1-833-456-4566',
        text: { number: '45645', message: 'your message' },
        website: 'https://crisisservicescanada.ca',
        available: '24/7, free',
      },
      {
        name: 'Kids Help Phone',
        description: 'For young people',
        phone: '1-800-668-6868',
        text: { number: '686868', message: 'CONNECT' },
        website: 'https://kidshelpphone.ca',
        available: '24/7, free',
      },
    ],
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    resources: [
      {
        name: 'Lifeline Australia',
        description: 'Crisis support and suicide prevention',
        phone: '13 11 14',
        text: { number: '0477 13 11 14', message: 'your message' },
        website: 'https://lifeline.org.au',
        available: '24/7',
      },
      {
        name: 'Beyond Blue',
        description: 'Anxiety and depression support',
        phone: '1300 22 4636',
        website: 'https://beyondblue.org.au',
        available: '24/7',
      },
      {
        name: 'Kids Helpline',
        description: 'For young people 5-25',
        phone: '1800 55 1800',
        website: 'https://kidshelpline.com.au',
        available: '24/7, free',
      },
    ],
  },
  {
    country: 'New Zealand',
    countryCode: 'NZ',
    flag: '🇳🇿',
    resources: [
      {
        name: 'Lifeline Aotearoa',
        description: 'Crisis support',
        phone: '0800 543 354',
        text: { number: '4357', message: 'HELP' },
        website: 'https://lifeline.org.nz',
        available: '24/7, free',
      },
      {
        name: 'Youthline',
        description: 'For young people',
        phone: '0800 376 633',
        text: { number: '234', message: 'your message' },
        website: 'https://youthline.co.nz',
        available: '24/7, free',
      },
    ],
  },
];

// Emergency numbers by country
export const EMERGENCY_NUMBERS: Record<string, { number: string; display: string }> = {
  GB: { number: '999', display: '999' },
  IE: { number: '999', display: '999' },
  US: { number: '911', display: '911' },
  CA: { number: '911', display: '911' },
  AU: { number: '000', display: '000' },
  NZ: { number: '111', display: '111' },
  // EU countries use 112
  DE: { number: '112', display: '112' },
  FR: { number: '112', display: '112' },
  ES: { number: '112', display: '112' },
  IT: { number: '112', display: '112' },
  NL: { number: '112', display: '112' },
  BE: { number: '112', display: '112' },
  AT: { number: '112', display: '112' },
  CH: { number: '112', display: '112' },
  SE: { number: '112', display: '112' },
  NO: { number: '112', display: '112' },
  DK: { number: '112', display: '112' },
  FI: { number: '112', display: '112' },
  PL: { number: '112', display: '112' },
  PT: { number: '112', display: '112' },
};

// Get emergency number for user's locale
export function getEmergencyNumber(locale?: string): { number: string; display: string } {
  const deviceLocale = locale || getDeviceLocale();
  const countryCode = getCountryFromLocale(deviceLocale);
  return EMERGENCY_NUMBERS[countryCode] || { number: '112', display: '112' };
}

// International fallback resource
export const INTERNATIONAL_RESOURCE: CrisisResource = {
  name: 'Find a Helpline',
  description: 'International directory of crisis lines',
  website: 'https://findahelpline.com',
  available: 'Varies by country',
};

export const BEFRIENDERS_RESOURCE: CrisisResource = {
  name: 'Befrienders Worldwide',
  description: 'International emotional support',
  website: 'https://befrienders.org/find-a-helpline',
  available: 'Varies by country',
};

// Get resources for user's locale
export function getResourcesForLocale(locale?: string): CountryResources | null {
  const deviceLocale = locale || getDeviceLocale();
  const countryCode = getCountryFromLocale(deviceLocale);

  return CRISIS_RESOURCES.find(r => r.countryCode === countryCode) || null;
}

// Get all resources with user's country first
export function getAllResourcesSorted(locale?: string): CountryResources[] {
  const userCountry = getResourcesForLocale(locale);

  if (!userCountry) {
    return CRISIS_RESOURCES;
  }

  return [
    userCountry,
    ...CRISIS_RESOURCES.filter(r => r.countryCode !== userCountry.countryCode),
  ];
}
