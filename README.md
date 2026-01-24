# Learn to Read SA

A literacy learning platform designed to help South Africans learn to read with voice-guided, word-by-word highlighting in multiple languages.

## The Problem

South Africa faces a severe literacy crisis:
- **78% of Grade 4 learners** cannot read for meaning (PIRLS 2021)
- South Africa ranks last among 57 countries in international reading assessments
- Millions of adults have low literacy skills

## Stats & Resources

Learn more about South Africa's literacy crisis:

### Key Studies & Reports
- [PIRLS 2021 South Africa Report](https://pirls2021.org/results/south-africa/) - Progress in International Reading Literacy Study showing SA ranked last among 57 countries
- [PIRLS 2021 International Results](https://pirls2021.org/) - Full international comparison of Grade 4 reading achievement
- [UNESCO Institute for Statistics - Literacy Data](http://uis.unesco.org/en/topic/literacy) - Global literacy rates and trends

### South African Government & Research
- [Department of Basic Education](https://www.education.gov.za/) - Official education policies and reports
- [NEEDU Reports](https://www.education.gov.za/NEEDU.aspx) - National Education Evaluation & Development Unit assessments
- [Human Sciences Research Council (HSRC)](https://www.hsrc.ac.za/) - South African education research

### Organizations Working on Literacy
- [Room to Read](https://www.roomtoread.org/countries/south-africa/) - Literacy and girls' education programs
- [Nal'ibali](https://nalibali.org/) - National reading-for-enjoyment campaign in South Africa
- [Wordworks](https://www.wordworks.org.za/) - Early literacy development organization
- [The Reading Trust](https://www.readingtrust.org.za/) - Children's literacy NGO in South Africa

### Academic Research
- [South African Journal of Childhood Education](https://sajce.co.za/) - Peer-reviewed research on early education
- [World Bank Education Data](https://data.worldbank.org/topic/education) - International education statistics

## The Solution

Learn to Read SA provides free, accessible literacy education with:

- **Word-by-word highlighting** with animated pointer showing reading direction
- **Text-to-speech** that reads each word aloud
- **Adjustable speed** from very slow (for beginners) to fast
- **Multiple languages** including isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, Kiswahili, and Hausa
- **Structured lessons** from alphabet basics to short stories
- **Regional news** for reading practice with real-world content

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Nuxt 3** - Vue.js framework
- **Vue 3** - Composition API
- **Pinia** - State management
- **@nuxtjs/i18n** - Internationalization
- **Microsoft Azure Speech** - High-quality text-to-speech for South African languages
- **Web Speech API** - Browser fallback for text-to-speech

## Azure Speech Setup (Optional)

For the best text-to-speech experience with native South African voices:

1. Create an Azure Speech resource at [portal.azure.com](https://portal.azure.com)
2. Copy `.env.example` to `.env`
3. Add your Azure Speech key and region

```bash
cp .env.example .env
# Edit .env with your Azure credentials
```

Without Azure configured, the app falls back to the browser's native Web Speech API.

## Features

### Reading Display
The core component provides:
- Visual word highlighting with scale animation
- Animated pointer below current word
- Completed words marked in green
- Click any word to jump to it
- Progress bar tracking

### Languages
- English (default)
- isiZulu
- isiXhosa
- Afrikaans
- Sesotho
- Setswana
- Kiswahili
- Hausa

### Content Categories
- Education
- Health
- Technology
- Politics
- Culture
- Economy

### Regional Coverage
- South Africa
- Southern Africa (SADC)
- Rest of Africa

## Project Structure

```
├── components/
│   └── ReadingDisplay.vue    # Core reading component
├── pages/
│   ├── index.vue             # Home
│   ├── learn.vue             # Practice reading
│   ├── lessons.vue           # Browse lessons
│   └── news.vue              # Regional news
├── stores/
│   └── content.ts            # Content management
├── locales/                  # Translation files
└── assets/css/main.css       # Global styles
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Quick reference for AI assistants
- [Onboarding Guide](./docs/ONBOARDING.md) - Detailed developer onboarding

## Contributing

We welcome contributions! Please read the [Onboarding Guide](./docs/ONBOARDING.md) to get started.

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Together, we can improve literacy across South Africa and beyond.**
