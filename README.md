# Misqui

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6)](https://www.typescriptlang.org/)

Misqui is an interactive educational platform where kids can develop essential skills through gamified learning experiences. The application offers engaging modules for mathematics, logic puzzles like Sudoku, strategy games like chess, and more—all designed to make learning fun and effective.

<div style="text-align: center;">
  <img src="public/mascot.svg" alt="Misqui Logo" width="200" />
</div>

## ✨ Features

- **Interactive Learning Games** — Engaging educational content for mathematics, puzzles, and strategic thinking
- **Progress Tracking** — Monitor learning achievements and skill development over time
- **Kid-Friendly Interface** — Intuitive design optimized for young learners
- **Adaptive Learning Paths** — Content that adjusts to each child's skill level and progress
- **Dark/Light Mode** — Comfortable viewing experience in any environment
- **Authentication** — Secure accounts for students and parents

## 🛠️ Tech Stack

Misqui is built with modern web technologies, organized by category:

- **Frontend**:
  - Next.js 15 with React 19
  - Zustand (state management)
- **Styling & UI**:
  - Tailwind CSS v4 with shadcn/ui
  - Radix UI (primitives)
  - Vaul (drawers)
  - Sonner (toasts)
  - Lucide React & React Icons (icons)
  - React Circular Progressbar (progress visualization)
  - React Confetti (celebratory effects)
  - Tailwind CSS animations
- **Authentication**:
  - AuthJS v5
- **Database**:
  - Neon PostgreSQL with Drizzle ORM
- **Payments**:
  - Stripe
- **Logging**:
  - Winston
- **Markdown Processing**:
  - Marked
- **Type Safety**:
  - TypeScript
- **Deployment**:
  - Vercel

## 📚 Documentation

For detailed information about the project, please refer to the following documentation:

- [Security Policy](docs/SECURITY.md) - Security guidelines and vulnerability reporting
- [Optimization Guide](docs/OPTIMIZATION.md) - Performance optimization and code quality guidelines
- [Workflow Guide](WORKFLOW.md) - Git workflow and contribution guidelines

## 📦 Installation

To set up the development environment:

1. Clone the repository:
   ```bash
   git clone https://github.com/schandillia/Misqui.git
   ```
2. Navigate to the project directory:
   ```bash
   cd misqui
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your specific configuration values.
5. Set up the database:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

## 💳 Stripe Setup

To test the payment integration with Stripe:

1. Run the Stripe CLI webhook listener in a terminal:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. While keeping the first terminal running, open a separate terminal and trigger a test payment event:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

These commands will help you verify that your Stripe payment processing is correctly configured.

## ▶️ Development

Run the development server with Turbopack:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Building for Production

```bash
pnpm build
pnpm start
```

## 📱 Screenshots

[To be added later]

## 🧪 Testing

```bash
pnpm test
```

## 🤝 Contributing

Contributions are welcome! For detailed Git workflow instructions, see [WORKFLOW.md](WORKFLOW.md). To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE.md) file for details.

## 📬 Contact

Amit Schandillia - amit@schandillia.com  
Misqui, Inc.

Project Link: [https://github.com/schandillia/Misqui](https://github.com/schandillia/Misqui)

---

Built with ❤️ for the next generation of learners
