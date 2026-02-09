# AuthDemo 🔐

AuthDemo is a premium, modern authentication playground built with **Next.js 16**, **Firebase**, and **Framer Motion**. It features a beautiful, responsive UI with smooth transitions and robust authentication flows.

## ✨ Features

- **Firebase Authentication**: Email/Password login and registration.
- **Modern UI/UX**: Built with React 19, Tailwind CSS 4, and Framer Motion for premium animations.
- **Glassmorphism Design**: Sleek, modern aesthetics with blurred backgrounds and crisp typography.
- **Responsive Layout**: Works seamlessly across mobile, tablet, and desktop.
- **Protected Routes**: Secure access to user-only content.
- **Real-time Feedback**: Interactive notifications and loading states.

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ 
- A Firebase Project (setup at [console.firebase.google.com](https://console.firebase.google.com/))

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd authdemo
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your Firebase configuration:

```bash
cp .env.example .env.local
```

Then, fill in your credentials from the Firebase Console.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Built With

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Radix UI & custom Glassmorphism components

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
