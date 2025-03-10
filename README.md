# درخت خرد (Derakhte Kherad)

Educational Platform for a Farsi/German Language Institution in Shiraz, Iran.

## Project Overview

"درخت خرد" is a bilingual (Farsi & German) physical language institution platform that provides students with detailed information about physical courses, progress tracking, and appointment-based consultations for learning German and immigration guidance.

## Core Features

- Introduction of Teachers & Courses (Teacher profiles, experience, and teaching methods)
- Student Dashboard (Class status, progress tracking, downloadable textbooks, notifications)
- Course Listings (Detailed course descriptions, pricing, filtering by level/start date/teacher)
- Consultation Booking System (Appointment-based for language learning and immigration)
- Blog System (Institution news, updates, and educational articles with categorization)
- Admin Panel (Full control over users, courses, notifications, and data exports)
- Bilingual & RTL Support (Default: Farsi, switchable to German)
- Dark Mode & Light Mode Toggle
- Secure JWT Authentication (Admins, Teachers, Students)

## Tech Stack

- Frontend: Next.js (TypeScript) + TailwindCSS
- State Management: Context API / Zustand
- Backend: Node.js (Express) + Prisma ORM + MongoDB
- Authentication: JWT-based login
- Admin Panel: Tailwind UI / ShadCN
- Database: MongoDB with Prisma ORM
- Deployment: Vercel (Frontend) & Railway/Supabase (Backend)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/derakhtekheradd.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── styles/             # Global styles and Tailwind configurations
└── types/              # TypeScript type definitions
```

## Color Palette

- Primary Red: #990607
- Primary Green: #139253
- Primary Blue: #0D6A97

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
