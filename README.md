# Outerspace Fullstack Starter 🚀

A modern, opinionated starter kit for building full-stack applications with Next.js and Nest.js.

## Features

- **Next.js** - For a powerful and optimized frontend
- **Nest.js** - For a robust and scalable backend
- **Monorepo Structure** - Using npm workspaces for better code organization
- **Hot Reload** - For both frontend and backend

## Prerequisites

- Node.js 18.0 or later
- npm 7.0 or later
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Alien6-Studio/outerspace-fullstack-starter.git
cd outerspace-fullstack-starter
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Start Development Server

```bash
npm run dev
```

This will start:

- Frontend at `http://localhost:3000`
- Backend at `http://localhost:4000`

## Project Structure

```shell
outerspace-fullstack-starter/
├── packages/
│   ├── backend/        # Nest.js application
│   │   ├── src/
│   │   └── package.json
│   └── frontend/       # Next.js application
│       ├── src/
│       └── package.json
├── package.json        # Root package.json
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts both frontend and backend in development mode |
| `npm run dev:frontend` | Starts only the frontend in development mode |
| `npm run dev:backend` | Starts only the backend in development mode |
| `npm run build` | Builds both applications for production |
| `npm run test` | Runs tests for both applications |
| `npm run clean` | Removes all node_modules directories |

## Environment Variables

Create a `.env` file in both frontend and backend directories:

```env
# Backend (.env)
PORT=4000
NODE_ENV=development

# Frontend (.env)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Contributing

Contributions are always welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you're having any problem, please raise an issue on GitHub.

## Acknowledgments

Thanks to all contributors who helped make this starter kit possible!

---

Created with ❤️ by Alien6 Studio
