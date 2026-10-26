# 🎓 CampusFinder — College Lost & Found Portal
**Mahatma Gandhi Mission's College of Engineering and Technology, Noida (Sector 62)**

A clean, modern web application built with **React, TypeScript, and Supabase (PostgreSQL)** that helps college students find, report, and recover lost belongings across the campus.

---

## 🌟 Key Features

### 1. 🔐 Protected Entry (Authentication First)
- When any user opens the website, **only the centered Login & Registration card is visible**.
- The main portal (navbar, feed, search, and chat) is hidden until a student logs in.

### 2. 📋 Student Registration & Rules
- **Official College Email Only**: Only emails ending in `@coet.in` (e.g. `rollnumber@coet.in`) are allowed.
- **Strict Mobile Number**: Contact/WhatsApp number accepts **numbers only** (no letters or symbols, 10 digits).
- **Academic Details**: Name, College Roll Number, Branch/Department, Year, and Section.

### 3. 🎨 Fresh Light Theme & College Branding
- Designed with **light green, crisp white, and soft light accents** (no dark mode).
- Features the official **MGMCET college logo** at the top and real campus photos as background.

### 4. 📦 Report Lost & Found Items
- Upload real photos of the item.
- Select campus locations (Library, Canteen, Block A Labs, Workshop, Sports Ground, Security Cabin, etc.).
- Add an **Anti-Fraud Secret Verification Hint** (e.g., *"Ask the owner what sticker is on the back"*).

### 5. 💬 Student-to-Student Live Chat
- If you lost an item, click **"Chat & Verify"** on the found post.
- Chat directly with the founder to verify ownership and agree on a safe handover spot on campus.

---

## 🗄️ Database: Supabase & PostgreSQL

The app is connected to **PostgreSQL** hosted on **Supabase**:
- **`students` Table**: Stores registered student profiles.
- **`items` Table**: Stores all reported lost and found posts.
- **`messages` Table**: Stores student chat messages.
- **`item-photos` Bucket**: Cloud storage bucket for item photos.

---

## 🚀 How to Run the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Step 1: Clone or Open Project Folder
Open your terminal in the project directory:
```bash
cd c:\Users\navje\Desktop\mini-project
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Database Keys
Open the `.env` file in the project root and ensure your Supabase keys are set:
```env
VITE_SUPABASE_URL=https://dhltzvrxztxzwckwzpov.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 📁 Project Structure

```text
mini-project/
├── public/
│   └── images/                # Official college logo and campus photos
├── src/
│   ├── components/
│   │   ├── AuthPage.tsx       # Centered Login & Register screen (@coet.in & numeric phone)
│   │   ├── Navbar.tsx         # Top navigation bar with logo and profile
│   │   ├── HeroBanner.tsx     # Welcome banner with quick stats
│   │   ├── ItemFeed.tsx       # Lost & Found listings with filters
│   │   ├── ItemCard.tsx       # Individual item card with "Chat & Verify"
│   │   ├── ReportItemModal.tsx# Form to post a lost/found item with photo
│   │   ├── ChatMessenger.tsx  # Direct student-to-student handover chat
│   │   ├── MyActivity.tsx     # Student profile & submitted items
│   │   └── Footer.tsx         # Campus contact info & security cabin hotline
│   ├── lib/
│   │   └── supabase.ts        # Supabase PostgreSQL client initialization
│   ├── services/
│   │   └── dbService.ts       # Database helper functions (Auth, Items, Photos)
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces (User, Item, ChatMessage)
│   ├── App.tsx                # Main application state & screen controller
│   ├── main.tsx               # Application entry point
│   └── index.css              # Light green & crisp white design system
├── supabase-schema.sql        # PostgreSQL SQL script to create tables & storage
├── .env                       # Supabase API keys
└── package.json               # Project dependencies & scripts
```

---

## 🛠️ Built With
- **Frontend**: React 19 + TypeScript + Vite
- **Database & Storage**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Styling**: Vanilla CSS (Custom Light Green & Crisp White Palette)
