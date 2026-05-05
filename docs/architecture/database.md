```mermaid
erDiagram
  Company ||--o{ Internship : "HasMany"
  University |o--o{ Internship : "HasMany"
  Internship ||--o{ InternshipCareer : "HasMany"
  Career ||--o{ InternshipCareer : "HasMany"
  University ||--o{ UniversityCareer : "HasMany"
  Career ||--o{ UniversityCareer : "HasMany"
  User ||--o{ UserCareer : "HasMany"
  Career ||--o{ UserCareer : "HasMany"
  User ||--o{ UserKeyword : "HasMany"
  User ||--o{ UserNotification : "HasMany"
  Internship ||--o{ UserNotification : "Generates"
  User ||--o{ UserSaveInternship : "HasMany"
  Internship ||--o{ UserSaveInternship : "HasMany"
```

## Entities

- **Company** — Companies that offers the internships.
- **Internship** — Published and available internship.
- **Career** — Current asked careers of the internships (Sistemas, Civil, etc.).
- **University** — Available universities.
- **UniversityCareer** — N:1 relation between careers and university.
- **InternshipCareer** — N:1 relation between careers and internship.
- **User** — Registered vía Clerk.
- **UserCareer** — Careers of intertest of the registered users.
- **UserKeyword** — Keywords of intertest of the registered users for custom recomendations.
- **UserNotification** — Log of sent alerts to the users with 'seen' flag.
- **UserSaveInternship** — Internships saved by the users.
