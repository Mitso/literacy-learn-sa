export interface ReadingSettings {
  speed: number // 1-5 scale
  showPointer: boolean
  autoRead: boolean
  highlightCompleted: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
  voiceEnabled: boolean
  selectedVoice: string | null
}

export interface UserProgress {
  lessonsCompleted: string[]
  articlesRead: string[]
  wordsLearned: number
  readingTime: number // in minutes
  currentStreak: number
  lastActiveDate: string
}

export interface LiteracyStats {
  country: string
  literacyRate: number
  childLiteracyRate: number
  year: number
  source: string
  notes?: string
}

export interface Region {
  id: string
  name: string
  countries: string[]
  color: string
}

export const REGIONS: Region[] = [
  {
    id: 'south-africa',
    name: 'South Africa',
    countries: ['South Africa'],
    color: '#f7941d',
  },
  {
    id: 'southern-africa',
    name: 'Southern Africa',
    countries: ['Botswana', 'Lesotho', 'Namibia', 'Eswatini', 'Zimbabwe', 'Zambia', 'Mozambique', 'Malawi', 'Angola'],
    color: '#28a745',
  },
  {
    id: 'africa',
    name: 'Rest of Africa',
    countries: ['Nigeria', 'Kenya', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'DRC', 'Senegal'],
    color: '#1a5f7a',
  },
]

export const TOPIC_CATEGORIES = [
  { id: 'education', name: 'Education', color: '#1565c0' },
  { id: 'politics', name: 'Politics', color: '#c62828' },
  { id: 'health', name: 'Health', color: '#2e7d32' },
  { id: 'technology', name: 'Technology', color: '#7b1fa2' },
  { id: 'culture', name: 'Culture', color: '#ef6c00' },
  { id: 'economy', name: 'Economy', color: '#00838f' },
]

export const LITERACY_STATISTICS: LiteracyStats[] = [
  {
    country: 'South Africa',
    literacyRate: 87,
    childLiteracyRate: 22, // Grade 4 reading for meaning
    year: 2023,
    source: 'PIRLS 2021',
    notes: '78% of Grade 4 learners cannot read for meaning',
  },
  {
    country: 'Botswana',
    literacyRate: 88,
    childLiteracyRate: 45,
    year: 2023,
    source: 'UNESCO',
  },
  {
    country: 'Zimbabwe',
    literacyRate: 89,
    childLiteracyRate: 40,
    year: 2023,
    source: 'UNESCO',
  },
  {
    country: 'Namibia',
    literacyRate: 91,
    childLiteracyRate: 35,
    year: 2023,
    source: 'UNESCO',
  },
  {
    country: 'Kenya',
    literacyRate: 82,
    childLiteracyRate: 55,
    year: 2023,
    source: 'UNESCO',
  },
  {
    country: 'Nigeria',
    literacyRate: 62,
    childLiteracyRate: 45,
    year: 2023,
    source: 'UNESCO',
  },
]
