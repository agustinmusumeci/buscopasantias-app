### ETL Pipeline

Internships and companies data is collected through an automated ETL pipeline:

- **Extract** — A scraper built in Puppeteer pulls raw internship listings from university sources on a scheduled basis.
- **Transform** — The raw data is processed and structured using **Gemini** 3 Flash Agent, which normalizes fields according to the schemas provided in "internship.response.schema", infers missing values, and ensures consistency across listings.
- **Load** — The cleaned data is stored in a **PostgreSQL** database managed with **Prisma**, making it instantly available through the web app.
