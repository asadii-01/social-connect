# 🌐 SocialConnect – A Real-Time Social Media Platform

**SocialConnect** is a full-stack, Instagram-style social media application that enables users to create rich multimedia posts, interact in real time through likes and comments, and build a social network with friend requests — all wrapped in a responsive and accessible UI.

---

## 🚀 Overview

Built with modern technologies, SocialConnect delivers an interactive and real-time experience using:

- 🔒 Secure **JWT-based authentication**
- 💬 Real-time updates via **WebSockets**
- 🖼️ Seamless **image uploads to Cloudinary**
- 🔗 Scalable **Node.js + MongoDB** backend

---

## 🎯 Key Features

### 🔐 User Authentication
- Sign up / log in / logout
- Persistent sessions using **JWT**
- Protected routes for user-specific features

### 📰 Dynamic Feed
- Reverse-chronological post feed from friends
- Real-time updates for new posts via **Socket.IO**

### ✍️ Post Creation & Editing
- Rich text + optional image attachments
- Styled drag-and-drop image uploader with live preview
- Inline modal for editing posts and images

### ❤️ Likes & Comments
- Like/unlike posts with real-time UI updates
- Live comment count updates
- Threaded comment modal with add/delete capability

### 👥 Friend System
- Send/accept/reject friend requests
- Notification dropdown for pending requests (real-time)
- View friend count on profile pages

### 🎨 Theming & Accessibility
- Light/dark mode via **React Context** & **Tailwind’s dark class**
- Fully responsive and accessible UI

---

## ⚙️ Tech Stack

| Layer        | Technology                             |
|--------------|-----------------------------------------|
| **Frontend** | React (Hooks), React Router, Tailwind CSS, Socket.IO-client |
| **Backend**  | Node.js, Express.js, Socket.IO          |
| **Database** | MongoDB with Mongoose ORM               |
| **Storage**  | Cloudinary for image hosting            |
| **Dev Tools**| Vite, ESLint, Prettier, Jest (planned), React Testing Library (planned) |

---

## 🧠 Architecture & Data Flow

### 🔄 Client Initialization
- React app rehydrates from `localStorage`
- Establishes WebSocket connection post-auth

### 🔌 Real-Time Communication
- One Socket.IO connection manages:
  - `newPost`
  - `newLike`
  - `newComment`
  - `friendRequest`

### 🖼️ Image Upload Flow
- Browser → `POST /api/upload/avatar`
- Server (Express + Multer + Streamifier) → Cloudinary
- Returns secure CDN URL saved in MongoDB

---

## 🗂️ Data Models

```js
User {
  username: String,
  email: String,
  passwordHash: String,
  avatarUrl: String,
  friends: [ObjectId]
}

Post {
  author: ObjectId,
  content: String,
  imageUrl: String,
  likers: [ObjectId],
  commentCount: Number,
  createdAt: Date
}

Comment {
  post: ObjectId,
  author: ObjectId,
  content: String,
  createdAt: Date
}

FriendRequest {
  from: ObjectId,
  to: ObjectId,
  status: String, // 'pending', 'accepted', 'rejected'
  createdAt: Date
}
```

---

## 🔮 Future Enhancements

- 💬 Direct messaging & push notifications  
- 🕒 Stories & ephemeral content  
- 🔎 Advanced search (hashtags, fuzzy matching)  
- 🔐 OAuth sign-on (Google, Facebook)  
- ⚡ Performance upgrades (pagination, Redis caching)  
- 📱 Mobile-first enhancements & PWA support  

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/socialconnect.git
cd socialconnect
```

### 2. Install dependencies

```bash
# For both frontend and backend (if separate)
npm install
```

### 3. Set up environment variables

Create a `.env` file with your MongoDB, Cloudinary, and JWT credentials.

### 4. Run the development server & Client Seperately

```bash
npm run dev
```

---

## 📬 Contact

Created by [Asad Tauqeer](https://www.linkedin.com/in/asad-tq)  
📧 asad13022002@gmail.com  

---

**SocialConnect** brings real-time interactivity and user-centered design together in a modern social media experience. Built for connection. Built for scale. 💬🚀

