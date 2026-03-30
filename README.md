# 🛒 CYPHER E-Commerce Store

# 🛒 Modern E-Commerce Store built with Next.js 15 & Clerk Authentication

Welcome to a fully responsive, feature-rich e-commerce platform powered by **Next.js 15**.  
This project simulates a real online shopping experience using data from [DummyJSON](https://dummyjson.com/), allowing developers to build and test with realistic product information.

---

## ✨ Key Features

- 🔐 **Authentication with Clerk** — Seamless sign-up, sign-in, and email verification flows
- 🛍️ **Product showcase** using Swiper for smooth and interactive carousels
- 💳 **Stripe integration** — Simulated checkout process for secure payments
- 🎨 **Framer Motion** for elegant UI animations and transitions
- 📱 **Responsive design** — Mobile-first, built with Tailwind CSS
- ⚡ **Global state management** using lightweight Zustand
- ⏱️ **Live countdowns and timers** with React Timer Hook
- 🖼️ **Optimized image processing** using Sharp
- 🚀 **Modern UI** with reusable components, icon support, and dark-friendly themes

---

## 🧰 Tech Stack

| Tech / Library        | Purpose                                  |
| --------------------- | ---------------------------------------- |
| **Next.js 15.3.2**    | Framework for React & routing            |
| **React 19**          | UI library                               |
| **@clerk/nextjs**     | Authentication and user management       |
| **@stripe/stripe-js** | Stripe frontend SDK for checkout         |
| **stripe**            | Stripe backend SDK                       |
| **axios**             | HTTP requests to DummyJSON               |
| **clsx**              | Conditional className utility            |
| **framer-motion**     | Animation and motion effects             |
| **react-icons**       | Icon packs (FontAwesome, Material, etc.) |
| **react-timer-hook**  | Countdown timers for offers              |
| **sharp**             | Server-side image optimization           |
| **sonner**            | Stylish toast notifications              |
| **swiper**            | Product carousel and sliders             |
| **tailwind-merge**    | Merge Tailwind classes with precision    |
| **zustand**           | Lightweight state management             |

---

## 📦 Data Source

This project uses mock product data from [DummyJSON](https://dummyjson.com/products), including:

- Product names, descriptions, prices, ratings
- Product images and categories
- Simulated stock and discounts

This allows for fast prototyping and UI development without needing a live backend.

## 📁 Folder Structure

The project is organized using a scalable and modular structure to keep code maintainable:

```
MACHIE-PROJECT/
├── .clerk/
├── .next/
├── .vscode/
├── app/
│   ├── _components/
│   │   ├── _auth/           # Auth-related components
│   │   ├── _global/         # Shared/global UI components
│   │   └── _website/        # Website-specific components
│   ├── (auth)/              # Auth routes
│   ├── (pathes)/            # Dynamic/custom route paths
│   ├── api/                 # API route handlers
│   ├── context/             # React context providers
│   ├── helpers/             # Utility helper functions
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state store
│   ├── types/               # TypeScript types
│   ├── utilities/           # General utility functions/files
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx           # Root layout file
│   └── page.tsx             # Root page
├── constants/               # Global constants
├── lib/                     # External libraries/utilities
├── node_modules/
├── public/
├── .env.local               # Environment variables
├── .gitignore
├── eslint.config.mjs
├── middleware.ts            # Next.js Middleware
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## 🧪 Dummy Data

We are currently using [DummyJSON](https://dummyjson.com/products) to simulate the product catalog, which provides:

- 🖼 Product images
- 📦 Product details
- 💲 Pricing & discounts
- 🛒 Inventory data

This allows rapid development and UI testing before backend integration.

---

## 📌 How to Run Locally

1. **Clone the repository:**

   ```bash
   https://github.com/Ahmed-ES-SH/machie-store.git

   # 2. Navigate to the project directory
   cd CYPHER-store
   ```

# 3. Install dependencies

```bash
npm install

```

# 4. Start the development server

```bash
npm run dev
```

## 👨‍💻 Author

Crafted with ❤️ by [Ahmed Ismail]
Feel free to connect with me or contribute to improve this project!
