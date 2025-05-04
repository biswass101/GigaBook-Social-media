# 📘 GigaBook - A Modern Social Media Web App

## Overview

**GigaBook** is a modern, full-stack social media application built with **Next.js**, designed to offer a seamless and interactive experience for users to connect, share, and engage with each other. It features essential social networking functionalities such as post creation, commenting, likes, following, and real-time notifications — all wrapped in a clean and responsive user interface powered by **shadcn/ui**.

GigaBook also includes robust authentication options like **Google OAuth login** and **OTP verification**, providing a secure and user-friendly sign-up and login flow. All media uploads are handled via **UploadThing**, and data persistence is managed with **Prisma ORM** and **Neon**, a scalable and serverless PostgreSQL database.

---

### ✨ Key Features

- 🔐 **Authentication**
  - Google OAuth sign-up and login
  - OTP (One-Time Password) verification
  - Secure logout

- 📝 **Social Features**
  - Create and share posts with **images and text**
  - Like and comment on posts
  - Delete your own posts and comments

- 🧑‍🤝‍🧑 **User Interactions**
  - Follow and unfollow other users
  - View other users' profiles and bios
  - Edit your own profile bio

- 🔔 **Notifications**
  - Real-time notifications for:
    - New followers
    - Likes on your posts
    - Comments on your posts

- 📄 **Profile Management**
  - Public user profiles
  - Bio editing
  - View posts and interactions

---

### 🛠️ Built With

- **Next.js** – React-based framework for full-stack web development
- **Prisma** – Type-safe ORM for database access
- **Neon** – Serverless PostgreSQL database
- **UploadThing** – File/image upload handler
- **shadcn/ui** – Modern UI component library based on Tailwind CSS

#### After installation this will be necessary
**Environment Variables**
```env
DATABASE_URL=your_neon_database_url
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

```

**Database setup**
```prisma
npx prisma generate
npx prisma migrate dev --name init
```

**Run**
```
npm run dev
```
