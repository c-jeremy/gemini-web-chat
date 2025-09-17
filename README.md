# Gemini Web Chat

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

A modern web application built with Next.js that integrates Google's Gemini AI API for intelligent interactions and responses.

## Features

- 🚀 Built with Next.js for optimal performance
- 💎 TypeScript for type safety
- 🎨 Styled with Tailwind CSS and shadcn/ui
- 🤖 Google Gemini AI integration
- 🔒 Middleware for request handling
- 📱 Responsive design
- 🎯 Custom hooks for state management

## Prerequisites

- Node.js (18.x or later)
- PNPM package manager
- Google Gemini API key

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/c-jeremy/gemini-web-app.git
cd gemini-web-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory with your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000/secret-auth](http://localhost:3000/secret-auth) with your browser to see the result.

## Project Structure

```
├── app/               # Next.js app directory
├── components/        # React components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
├── public/           # Static assets
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

## Deployment

This application can be deployed on Vercel with minimal configuration:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fc-jeremy%2Fgemini-web-app)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT license.
