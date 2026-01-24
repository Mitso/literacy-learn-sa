import { defineStore } from 'pinia'

export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: 'education' | 'politics' | 'health' | 'technology' | 'culture' | 'economy'
  region: 'south-africa' | 'southern-africa' | 'africa'
  language: string
  author: string
  publishedAt: string
  imageUrl?: string
  readingLevel: 'beginner' | 'intermediate' | 'advanced'
  translations?: Record<string, { title: string; content: string; excerpt: string }>
}

export interface Lesson {
  id: string
  title: string
  description: string
  content: string
  level: 'beginner' | 'intermediate' | 'advanced'
  order: number
  category: string
  language: string
  translations?: Record<string, { title: string; description: string; content: string }>
}

export interface NewsSource {
  id: string
  name: string
  url: string
  region: 'south-africa' | 'southern-africa' | 'africa'
  category: string
  language: string
  iframeAllowed: boolean
}

export const useContentStore = defineStore('content', {
  state: () => ({
    articles: [] as Article[],
    lessons: [] as Lesson[],
    newsSources: [] as NewsSource[],
    currentArticle: null as Article | null,
    currentLesson: null as Lesson | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getArticlesByRegion: (state) => (region: string) => {
      return state.articles.filter(article => article.region === region)
    },

    getArticlesByCategory: (state) => (category: string) => {
      return state.articles.filter(article => article.category === category)
    },

    getLessonsByLevel: (state) => (level: string) => {
      return state.lessons.filter(lesson => lesson.level === level).sort((a, b) => a.order - b.order)
    },

    getNewsSourcesByRegion: (state) => (region: string) => {
      return state.newsSources.filter(source => source.region === region)
    },

    southAfricanArticles: (state) => {
      return state.articles.filter(article => article.region === 'south-africa')
    },

    southernAfricanArticles: (state) => {
      return state.articles.filter(article => article.region === 'southern-africa')
    },

    africanArticles: (state) => {
      return state.articles.filter(article => article.region === 'africa')
    },

    beginnerLessons: (state) => {
      return state.lessons.filter(lesson => lesson.level === 'beginner').sort((a, b) => a.order - b.order)
    },
  },

  actions: {
    async initializeContent() {
      this.isLoading = true
      this.error = null

      try {
        // Initialize with sample content
        this.articles = getSampleArticles()
        this.lessons = getSampleLessons()
        this.newsSources = getSampleNewsSources()
      } catch (e) {
        this.error = 'Failed to load content'
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    setCurrentArticle(article: Article | null) {
      this.currentArticle = article
    },

    setCurrentLesson(lesson: Lesson | null) {
      this.currentLesson = lesson
    },

    addArticle(article: Article) {
      this.articles.push(article)
    },

    addLesson(lesson: Lesson) {
      this.lessons.push(lesson)
    },
  },
})

// Sample data functions
function getSampleArticles(): Article[] {
  return [
    {
      id: '1',
      title: 'Why South Africa Faces Literacy Challenges',
      content: `South Africa faces significant literacy challenges. Many children struggle to read by the age of ten. This is a problem that affects millions of people. The reasons are complex and include poverty, lack of resources, and teacher training issues.

Studies show that about 78 percent of Grade 4 learners cannot read for meaning. This means they can sound out words but do not understand what they read. This is called functional illiteracy.

The problem starts early. Many children do not have books at home. They do not hear stories read to them. When they start school, they are already behind.

Schools in poor areas often lack basic resources. They may not have enough textbooks. Libraries are rare. Teachers may have large classes with forty or more students.

But there is hope. Many organizations are working to improve literacy. They provide books and training. They help parents learn to read with their children. Every small step helps build a better future.`,
      excerpt: 'Understanding the literacy crisis in South Africa and what can be done about it.',
      category: 'education',
      region: 'south-africa',
      language: 'en',
      author: 'Learn to Read SA Team',
      publishedAt: '2024-01-15',
      readingLevel: 'beginner',
      translations: {
        zu: {
          title: 'Kungani iNingizimu Afrika Ibhekene Nezinselelo Zokufunda',
          content: 'INingizimu Afrika ibhekene nezinselelo ezinkulu zokufunda nokubhala...',
          excerpt: 'Ukuqonda inkinga yokufunda nokubhala eNingizimu Afrika.',
        },
        xh: {
          title: 'Kutheni uMzantsi Afrika ujamelene neMingeni yokuFunda',
          content: 'UMzantsi Afrika ujamelene nemingeni emikhulu yokufunda nokubhala...',
          excerpt: 'Ukuqonda ingxaki yokufunda nokubhala eMzantsi Afrika.',
        }
      }
    },
    {
      id: '2',
      title: 'The Importance of Reading in African Languages',
      content: `Reading in your home language is very important. When children learn to read in a language they speak at home, they learn faster. They understand better. They enjoy reading more.

In Africa, there are over two thousand languages. Many children speak one language at home but learn to read in English or French. This makes learning harder.

South Africa has eleven official languages. These include Zulu, Xhosa, Afrikaans, Sotho, and Tswana. Teaching reading in these languages helps children succeed.

Research shows that children who learn to read in their mother tongue do better in school. They also learn additional languages more easily later.

We must create more books in African languages. We need more teachers who can teach in local languages. This will help millions of children learn to read.`,
      excerpt: 'Why learning to read in your home language matters for African children.',
      category: 'education',
      region: 'africa',
      language: 'en',
      author: 'Dr. Naledi Mbeki',
      publishedAt: '2024-01-10',
      readingLevel: 'beginner',
    },
    {
      id: '3',
      title: 'Success Stories from Southern African Literacy Programs',
      content: `Across Southern Africa, literacy programs are changing lives. In Botswana, a new reading initiative has helped thousands of children. In Zimbabwe, community libraries bring books to rural areas. In Namibia, mobile libraries reach remote villages.

One success story comes from a small village in Mozambique. Maria was thirty years old when she learned to read. She joined an adult literacy class. Now she reads to her grandchildren every night. She says reading has changed her life.

In Zambia, a program trains parents to help their children read. Parents learn simple ways to make reading fun. They learn to use everyday objects to teach letters and words.

These programs show that change is possible. When communities work together, literacy improves. Every person who learns to read can teach others. This creates a chain of knowledge that grows and grows.`,
      excerpt: 'How literacy programs across Southern Africa are making a difference.',
      category: 'education',
      region: 'southern-africa',
      language: 'en',
      author: 'James Moyo',
      publishedAt: '2024-01-08',
      readingLevel: 'intermediate',
    },
    {
      id: '4',
      title: 'Technology and Literacy in South Africa',
      content: `Technology is helping more South Africans learn to read. Smartphones and tablets can be powerful learning tools. Many apps teach reading skills in fun ways.

In South Africa, more people have phones than have running water. This creates an opportunity. Reading apps can reach people who live far from schools and libraries.

Some apps use games to teach letters and sounds. Others read stories aloud while highlighting each word. This helps learners connect written words with sounds.

The government is working to provide tablets to schools. Free WiFi spots in communities help people access online learning. Digital libraries let people read books without buying them.

But technology is not enough on its own. People still need teachers and mentors. They need encouragement and support. Technology is a tool that works best when combined with human connection.`,
      excerpt: 'How technology is being used to improve literacy in South Africa.',
      category: 'technology',
      region: 'south-africa',
      language: 'en',
      author: 'Thabo Nkosi',
      publishedAt: '2024-01-05',
      readingLevel: 'intermediate',
    },
    {
      id: '5',
      title: 'Health Literacy: Understanding Medicine Labels',
      content: `Being able to read is important for your health. When you can read, you can understand medicine labels. You can read instructions from your doctor. You can learn about healthy habits.

In South Africa, many people cannot read their medicine bottles. They may take the wrong amount of medicine. They may not know about side effects. This can be dangerous.

Health literacy means understanding health information. It includes knowing how to read a prescription. It includes understanding food labels. It includes being able to follow health advice.

Hospitals and clinics are working to help. They use pictures and simple words. They train staff to explain things clearly. They provide information in local languages.

You can start by learning common health words. Words like dose, twice daily, and warning are important. Ask your doctor or pharmacist to explain anything you do not understand. Your health depends on it.`,
      excerpt: 'Why reading skills are essential for understanding health information.',
      category: 'health',
      region: 'south-africa',
      language: 'en',
      author: 'Dr. Sarah van der Merwe',
      publishedAt: '2024-01-03',
      readingLevel: 'beginner',
    }
  ]
}

function getSampleLessons(): Lesson[] {
  return [
    {
      id: 'lesson-1',
      title: 'The Alphabet: Learning Your Letters',
      description: 'Start your reading journey by learning the 26 letters of the alphabet.',
      content: `A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

Let us learn the alphabet together. Each letter has a name and a sound.

A is for Apple. The letter A makes the sound ah.

B is for Ball. The letter B makes the sound buh.

C is for Cat. The letter C makes the sound kuh.

D is for Dog. The letter D makes the sound duh.

E is for Egg. The letter E makes the sound eh.

Practice saying each letter. Look at the shape. Say the sound. This is how we begin to read.`,
      level: 'beginner',
      order: 1,
      category: 'alphabet',
      language: 'en',
      translations: {
        zu: {
          title: 'I-Alphabet: Ukufunda Izinhlamvu Zakho',
          description: 'Qala uhambo lwakho lokufunda ngokufunda izinhlamvu ezingu-26 ze-alphabet.',
          content: 'Masifunde i-alphabet ndawonye...',
        }
      }
    },
    {
      id: 'lesson-2',
      title: 'Simple Words: Three Letter Words',
      description: 'Learn to read your first words using three letters.',
      content: `Now we will read simple words. These words have three letters each.

CAT - C A T - This is a cat.

DOG - D O G - This is a dog.

SUN - S U N - The sun is bright.

MOM - M O M - I love my mom.

DAD - D A D - I love my dad.

CUP - C U P - The cup has water.

Practice reading each word slowly. Sound out each letter. Then say the whole word.`,
      level: 'beginner',
      order: 2,
      category: 'words',
      language: 'en',
    },
    {
      id: 'lesson-3',
      title: 'Simple Sentences',
      description: 'Put words together to make simple sentences.',
      content: `A sentence tells us something. It starts with a big letter. It ends with a full stop.

The cat is big.

The dog can run.

I see the sun.

Mom has a cup.

Dad is at home.

The cup is red.

Each sentence has a meaning. Read each word. Think about what the sentence tells you.`,
      level: 'beginner',
      order: 3,
      category: 'sentences',
      language: 'en',
    },
    {
      id: 'lesson-4',
      title: 'Common Sight Words',
      description: 'Learn words you will see often when reading.',
      content: `Some words appear very often in reading. We call these sight words. Learn to recognize them quickly.

THE - The most common word in English.

AND - Used to join words together.

IS - Tells us about something now.

IT - Replaces a thing or animal.

TO - Shows direction or purpose.

A - Means one of something.

Practice: The cat and the dog. It is a big dog. I want to go.`,
      level: 'beginner',
      order: 4,
      category: 'sight-words',
      language: 'en',
    },
    {
      id: 'lesson-5',
      title: 'Reading Short Stories',
      description: 'Practice reading with a simple story.',
      content: `The Big Dog

Tom has a dog. The dog is big. The dog is brown. The dog can run fast.

One day, Tom and his dog go to the park. The sun is bright. The sky is blue.

Tom throws a ball. The dog runs to get it. The dog brings the ball back to Tom.

Tom is happy. The dog is happy too. They play until the sun goes down.

Then they go home. Mom has food ready. Tom and his dog eat. Then they sleep.

The end.`,
      level: 'beginner',
      order: 5,
      category: 'stories',
      language: 'en',
    }
  ]
}

function getSampleNewsSources(): NewsSource[] {
  return [
    {
      id: 'news24',
      name: 'News24',
      url: 'https://www.news24.com',
      region: 'south-africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
    {
      id: 'daily-maverick',
      name: 'Daily Maverick',
      url: 'https://www.dailymaverick.co.za',
      region: 'south-africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
    {
      id: 'sabc-news',
      name: 'SABC News',
      url: 'https://www.sabcnews.com',
      region: 'south-africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
    {
      id: 'iol',
      name: 'IOL News',
      url: 'https://www.iol.co.za',
      region: 'south-africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
    {
      id: 'africa-news',
      name: 'Africa News',
      url: 'https://www.africanews.com',
      region: 'africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
    {
      id: 'all-africa',
      name: 'AllAfrica',
      url: 'https://allafrica.com',
      region: 'africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
    {
      id: 'southern-times',
      name: 'Southern Times',
      url: 'https://southerntimesafrica.com',
      region: 'southern-africa',
      category: 'general',
      language: 'en',
      iframeAllowed: false,
    },
  ]
}
