# Misqui

Misqui is an interactive educational platform where kids can develop essential skills through gamified learning experiences. The application offers engaging modules for mathematics, logic puzzles like Sudoku, strategy games like chess, and more—all designed to make learning fun and effective.

![Misqui Logo](public/mascot.svg)

## ✨ Features

- **Interactive Learning Games** — Engaging educational content for mathematics, puzzles, and strategic thinking
- **Progress Tracking** — Monitor learning achievements and skill development over time
- **Kid-Friendly Interface** — Intuitive design optimized for young learners
- **Adaptive Learning Paths** — Content that adjusts to each child's skill level and progress
- **Dark/Light Mode** — Comfortable viewing experience in any environment
- **Authentication** — Secure accounts for students and parents

## 🛠️ Tech Stack

Misqui is built with modern web technologies:

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4.1 with shadcn/ui components
- **Authentication**: AuthJS v5
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Deployment**: [TBA]

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

[Consider adding screenshots of your application here]

## 🧪 Testing

```bash
pnpm test
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

## 📄 License

This project is licensed under a proprietary license - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Amit Schandillia - amit@schandillia.com  
Misqui, Inc.

Project Link: [https://github.com/schandillia/Misqui](https://github.com/schandillia/Misqui)

---

Built with ❤️ for the next generation of learners
