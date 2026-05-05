<div align="center">

<a href="https://www.fifa.com" target="_blank" title="Go to FIFA website"><img width="100px" alt="fifa logo" src="https://www.buscopasantias.com.ar/icons/favicon.svg"></a>

# BuscoPasantías App

**Busco Pasantías** is a web app built in w/Astro & Prisma that centralizes and tracks internship listings from multiple universities, making it easier for students to find opportunities that match their profile and get notified when new ones appear.

</div>

## 📖 Essential Documentation

All users that want to contribute should be aware and familiar with:

- Project DB structure
- Project architecture and flow
- Project ETL System
- License

The documentation can be found in `/docs`

## 🚀 Project structure

```text
/
├── public/
├── prisma/
│   ├── migrations/
│   ├── zod/
│   ├── schema.prisma
│   └── seed.ts
│
├── src
│   ├── actions/
│   ├── agents/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── images/
│   ├── interfaces/
│   ├── layouts/
│   ├── lib/
│   ├── mock/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── acerca.astro
│   │   ├── 404.astro
│   │   ├── pasantias/
│   │   │   ├── [id].astro
│   │   │   └── index.astro
│   │   ├── alertas/
│   │   │   └── index.astro
│   │   ├── terminos-y-condiciones/
│   │   │   ├── [term].astro
│   │   │   ├── index.astro
│   │   │   └── termsLayout.astro
│   │   └── api/
│   │       └── cron/
│   │           └── index.ts
│   │
│   ├── schemas/
│   ├── styles/
│   ├── tests/
│   ├── templates/
│   ├── utils/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   └── middleware.ts
│
└── package.json
└── .env
└── astro.config.mjs
└── components.json
└── prisma-config.ts
└── tsconfig.ts
```

## ⚙️ Stack

| Tech                         | Purpose                         | Version          |
| ---------------------------- | ------------------------------- | ---------------- |
| Astro                        | Fullstack framework             | ^6.0.6           |
| React (as Astro integration) | Frontend framework              | ^5.0.2           |
| TailwindCSS                  | Styles                          | ^4.2.2           |
| ShadCS                       | Components Library              | ^4.1.1           |
| TypeScript                   | Static Typing                   | Not specified    |
| Zod                          | Dynamic Typing                  | ^4.3.6           |
| Postgresql                   | DBMS                            | Not specified    |
| Prisma                       | ORM                             | ^7.5.0           |
| Puppeteer                    | Bot & Web Scraper               | ^24.39.1         |
| Gemini Agent                 | Data processing of scraped data | Gemini 2.5 Flash |
| Clerk (as Astro integration) | Auth and user handling          | ^3.0.6           |

## 💻 Enviroment Variables

| Var                          | Description                                                              | Usage            |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------- |
| DATABASE_URL                 | URL for PostgreSQL connection                                            | postgresql://... |
| SCRAPER_URL                  | URL for web internship scraper                                           | https://...      |
| PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk Auth public API key                                                | pk*...*...       |
| CLERK_SECRET_KEY             | Clerck Auth private/secret API key                                       | sk*...*...       |
| GEMINI_API_KEY               | Gemini API key for raw internships text processing                       | ...              |
| EMAILJS_SERVICE_ID           | Mail service ID from EmailJS                                             | ...              |
| EMAILJS_TEMPLATE_ID          | Mail template ID from EmailJS                                            | ...              |
| EMAILJS_PUBLIC_KEY           | Public API key from EmailJS                                              | ...              |
| EMAILJS_PRIVATE_KEY          | Private API key from EmailJS                                             | ...              |
| CRON_SECRET                  | Cron job API key for scraping internships and notifying suscripted users | ...              |

## 🧞 Available commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
