# AI Economy Forecaster

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

> Transform complex US economic data into actionable insights with real-time charts and AI-powered analysis.

## 📋 Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Requirements](#requirements)
- [Installation and Usage](#installation-and-usage)
- [Project Structure](#project-structure)
- [Authors](#authors)
- [Contributing](#contributing)
- [License](#license)

## 📝 Description

**AI Economy Forecaster** is a modern web application that democratizes economic forecasting by providing accessible and intelligent tools to predict economic trends. Built with cutting-edge technologies, this application leverages Google's Generative AI (Gemini) and real-time economic data from the Federal Reserve Economic Data (FRED) API to deliver comprehensive economic insights.

### The Problem

Traditional economic forecasting models are often complex, require deep expertise, and may not process vast amounts of real-time data efficiently. This creates a barrier for individuals and small businesses to make data-driven economic decisions.

### The Solution

This application simplifies economic analysis by:
- Providing intuitive visualizations of economic indicators
- Offering AI-powered analysis and predictions
- Enabling interactive policy parameter adjustments
- Making complex economic data accessible to everyone

## 🛠️ Tech Stack

### Frontend Framework & Core
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[React](https://reactjs.org/)** (v18.3.1) - JavaScript library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)** (v5.8.3) - Typed superset of JavaScript
- **[React Router DOM](https://reactrouter.com/)** (v6.30.1) - Declarative routing for React

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4.18) - Utility-first CSS framework
- **[Shadcn UI](https://ui.shadcn.com/)** - Re-usable components built with Radix UI and Tailwind CSS
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icon toolkit

### Data Visualization & Charts
- **[Recharts](https://recharts.org/)** (v2.15.4) - Composable charting library
- **[Chart.js](https://www.chartjs.org/)** (v4.5.1) - Simple yet flexible JavaScript charting

### AI & Data Management
- **[Google Generative AI](https://ai.google.dev/)** (@google/generative-ai v0.24.1) - Gemini AI integration
- **[TanStack Query](https://tanstack.com/query)** (v5.83.0) - Powerful data synchronization for React
- **FRED API** - Federal Reserve Economic Data

### Form Handling & Validation
- **[React Hook Form](https://react-hook-form.com/)** (v7.61.1) - Performant forms with easy validation
- **[Zod](https://zod.dev/)** (v3.25.76) - TypeScript-first schema validation

### Additional Libraries
- **[date-fns](https://date-fns.org/)** - Modern JavaScript date utility library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme switching

## ✨ Key Features

### 1. Real-Time Economic Data
- Access live US economic indicators from FRED API:
  - **GDP** (Gross Domestic Product)
  - **Inflation Rate** (Consumer Price Index)
  - **Unemployment Rate**
  - **Federal Funds Rate**
  - **Non-Farm Payrolls**
  - **Retail Sales**
  - **Industrial Production**
  - **Policy Tradeoff Analysis**

### 2. AI-Powered Analysis
- Get context-aware insights powered by Google's Gemini AI
- Interactive AI chat assistant for each chart
- Ask questions and receive instant, understandable answers about economic trends
- Understand complex economic relationships with AI explanations

### 3. Interactive Charts
- Beautiful, responsive data visualizations using Recharts
- Export charts as images
- Real-time data updates
- Historical data trends and forecasting

### 4. Policy Simulation
- Interactive policy parameter adjustments with sliders
- Real-time impact visualization on economic forecasts
- Understand trade-offs between different economic policies

### 5. Modern User Interface
- Clean, intuitive design built with Shadcn UI components
- Responsive layout that works on all devices
- Dark/Light theme support
- Smooth animations and transitions

## 📦 Requirements

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher recommended)
- **npm** (v7.0.0 or higher) or **yarn** (v1.22.0 or higher)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- **Google Gemini API Key** (for AI features)
- **FRED API Key** (optional, for extended data access)

> **Note:** The application uses free-tier APIs, but you may need to sign up for API keys to use certain features.

## 🚀 Installation and Usage

### Step 1: Clone the Repository

```bash
    git clone https://github.com/senipatel/ai-economy-forcaster.git
    cd ai-economy-forcaster
    ```

### Step 2: Install Dependencies

```bash
    npm install
    ```

This will install all required packages listed in `package.json`.

### Step 3: Environment Setup (Optional)

Create a `.env` file in the root directory if you need to configure API keys:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FRED_API_KEY=your_fred_api_key_here
```

> **Note:** The application may work with default/public endpoints, but API keys may be required for extended functionality.

### Step 4: Run the Development Server

```bash
npm run dev
```
    
The application will start on `http://localhost:8080` (or the next available port).

Open your browser and navigate to the displayed URL to view the application.

### Step 5: Build for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist` directory.

### Step 6: Preview Production Build

```bash
npm run preview
```

### Additional Scripts

- `npm run lint` - Run ESLint to check code quality
- `npm run build:dev` - Build in development mode

## 📁 Project Structure

```
ai-economy-forcaster/
│
├── api/                          # FRED API integration files
│   ├── fred-fedfunds.ts         # Federal Funds Rate API
│   ├── fred-gdp.ts              # GDP API
│   ├── fred-industrial.ts       # Industrial Production API
│   ├── fred-inflation.ts        # Inflation API
│   ├── fred-payrolls.ts         # Payrolls API
│   ├── fred-retailsales.ts      # Retail Sales API
│   ├── fred-tradeoff.ts         # Policy Tradeoff API
│   └── fred-unemployment.ts     # Unemployment API
│
├── public/                       # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/                          # Source code
│   ├── components/              # React components
│   │   ├── charts/             # Chart components
│   │   │   ├── CreateChart.tsx
│   │   │   ├── FedFundsChart.tsx
│   │   │   ├── GDPChart.tsx
│   │   │   ├── IndustrialProductionChart.tsx
│   │   │   ├── InflationChart.tsx
│   │   │   ├── PayrollsChart.tsx
│   │   │   ├── PolicyTradeoffChart.tsx
│   │   │   ├── RetailSalesChart.tsx
│   │   │   └── UnemploymentChart.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── AIChat.tsx      # AI chat interface
│   │   │   ├── ChartContainer.tsx
│   │   │   ├── CountryContext.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   └── DashboardSidebar.tsx
│   │   │
│   │   └── ui/                 # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── chart.tsx
│   │       └── ... (other UI components)
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── chartCache.ts       # Chart data caching
│   │   └── utils.ts            # Helper functions
│   │
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx       # Main dashboard page
│   │   ├── Landing.tsx         # Landing/home page
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Global styles
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Base styles
│
├── .gitignore                   # Git ignore rules
├── components.json              # Shadcn UI configuration
├── eslint.config.js             # ESLint configuration
├── index.html                   # HTML entry point
├── package.json                 # Project dependencies
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # App-specific TypeScript config
├── tsconfig.node.json           # Node-specific TypeScript config
├── vercel.json                  # Vercel deployment config
└── vite.config.ts               # Vite configuration
```

## 👥 Authors

This project was created by:

- **[Sapna Sharma](https://github.com/Sapna190/)** ([@Sapna190](https://github.com/Sapna190/))
  - 4th-year Computer Science and Engineering (CSE) student
  - Skills: MERN Stack, Tailwind CSS, JavaScript, React, Node.js
  - Email: sapnasharma8849711@gmail.com

- **[Seni Patel](https://github.com/senipatel/)** ([@senipatel](https://github.com/senipatel/))
  - 4th-year B.Tech student specializing in Information Technology
  - Skills: Full Stack Development, Flutter, React, TypeScript
  - Website: [senipatel.vercel.app](https://senipatel.vercel.app)
  - Email: senipatel017@gmail.com

## 🤝 Contributing

Contributions are welcome! This project encourages collaboration and improvement. Here's how you can contribute:

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm run lint
   npm run build
   npm run dev  # Test locally
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: description of your feature"
   # Use clear, descriptive commit messages
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes clearly

### Contribution Guidelines

- **Code Style**: Follow the existing code formatting (ESLint will help)
- **TypeScript**: Maintain type safety - avoid `any` types when possible
- **Components**: Use functional components with hooks
- **Naming**: Use clear, descriptive names for variables and functions
- **Documentation**: Update README.md if you add new features
- **Testing**: Test your changes thoroughly before submitting

### Areas for Contribution

- 🔧 Bug fixes
- ✨ New features and economic indicators
- 📊 Additional chart types
- 🎨 UI/UX improvements
- 📝 Documentation improvements
- 🌐 Multi-language support
- 🧪 Unit and integration tests
- 🚀 Performance optimizations

## 📄 License

This project is licensed under the **MIT License**.

MIT License is a permissive license that allows anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, as long as the original copyright notice and license are included.

### License Selection

You are free to:
- ✅ Use the software commercially
- ✅ Modify the software
- ✅ Distribute the software
- ✅ Private use
- ✅ Sublicense

With conditions:
- ⚠️ License and copyright notice must be included

For more details, see the full [MIT License](https://opensource.org/licenses/MIT) text.

---

**Made with ❤️ by [Sapna Sharma](https://github.com/Sapna190/) and [Seni Patel](https://github.com/senipatel/)**

If you find this project helpful, please consider giving it a ⭐ on GitHub!
