# coRoute Frontend

Modern trip planning application built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## 🎨 Features

- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** for utility-first styling with custom color palette
- **Framer Motion** for smooth animations and transitions
- **Axios** for API requests with interceptors
- **Dark/Light/System Theme** support with automatic detection
- **Responsive Design** that works on all devices
- **Custom animated Logo component**
- **Beautiful Loading states**

## 🎨 Color Palette

| Usage      | Color Name      | Hex Code  | Purpose                                      |
| ---------- | --------------- | --------- | -------------------------------------------- |
| Primary    | Electric Violet | `#8B5CF6` | Primary buttons, active "Editor" indicators  |
| Secondary  | Mango Tango     | `#FB923C` | Fun, "Add Activity" buttons, budget warnings |
| Accent     | Malibu Blue     | `#38BDF8` | Links, comment bubbles, "Viewer" role badges |
| Background | Ghost White     | `#F8FAFC` | Clean canvas to make activity cards pop      |
| Success    | Emerald Mint    | `#10B981` | Completed checklists, "Under Budget" status  |
| Text/Deep  | Slate Abyss     | `#1E293B` | Main headings and serious logistics/data     |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Logo.tsx        # Animated coRoute logo
│   ├── Loading.tsx     # Loading spinner component
│   ├── ThemeToggle.tsx # Theme switcher button
│   └── index.ts        # Component exports
├── contexts/           # React contexts
│   └── ThemeContext.tsx # Theme management context
├── lib/                # Third-party configurations
│   └── axios.ts        # Axios instance with interceptors
├── utils/              # Utility functions
│   └── helpers.ts      # Helper functions (formatting, debounce, etc.)
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind directives
```

## 🎯 Available Scripts

- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌙 Theme System

The app supports three theme modes:

- **Light**: Clean, bright interface with Ghost White background
- **Dark**: Easy on the eyes with dark backgrounds
- **System**: Automatically matches OS preference

Toggle between themes using the button in the header. Your preference is saved in localStorage.

## 🔌 API Configuration

Configure the API endpoint in `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

The axios instance in `src/lib/axios.ts` automatically:

- Adds authentication tokens from localStorage
- Handles 401/403/404/500 errors
- Provides timeout configuration

## 📦 Dependencies

### Core

- `react` - UI library
- `react-dom` - DOM renderer for React
- `typescript` - Type safety

### UI & Styling

- `tailwindcss` - Utility-first CSS framework
- `framer-motion` - Animation library
- `postcss` & `autoprefixer` - CSS processing

### HTTP Client

- `axios` - Promise-based HTTP client

### Development

- `vite` - Build tool and dev server
- `eslint` - Code linting

## 🎨 Tailwind Custom Classes

The project includes custom utility classes defined in `src/index.css`:

- `.btn-primary` - Primary button with Electric Violet background
- `.btn-secondary` - Secondary button with Mango Tango background
- `.card` - Card container with shadow and padding
- `.input` - Form input style with focus states

## 🎭 Components Guide

### Logo Component

```tsx
import { Logo } from './components';

// Default medium size with animation
<Logo />

// Custom size without animation
<Logo size="lg" animated={false} />
```

### Loading Component

```tsx
import { Loading } from './components';

// Full screen loading
<Loading fullScreen message="Loading..." />

// Inline loading
<Loading message="Processing..." />
```

### ThemeToggle Component

```tsx
import { ThemeToggle } from "./components";

// Simple toggle button
<ThemeToggle />;
```

### Using Theme Context

```tsx
import { useTheme } from "./contexts/ThemeContext";

function MyComponent() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  // theme: 'light' | 'dark' | 'system'
  // effectiveTheme: 'light' | 'dark'
  // setTheme: (theme) => void
}
```

## 🔧 Customization

### Adding New Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      'my-color': '#123456',
    },
  },
}
```

### Adding New Components

1. Create component in `src/components/`
2. Export it in `src/components/index.ts`
3. Import and use: `import { MyComponent } from './components'`

## 📱 Responsive Design

The app uses Tailwind's responsive classes:

- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is part of the coRoute application.
