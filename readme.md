# 🧩 ClueFinding

A lightweight web-based **clue hunting game** built for a one-time **IT Day Treasure Hunt event**.

This project focuses on **simplicity, speed, and ease of deployment**, allowing organizers to run a clue-based activity without needing an authentication system. Whereas it is stationed at COMLAB's PC for hunters to use.
---

## 🚀 Features

- 🔐 **Clue Validation**
  - Checks if answers are correct
  - Ensures correct sequence/order

- 🎯 **Sequential Gameplay**
  - Players must solve clues step-by-step
  - Prevents skipping ahead


- 🧠 **Customizable Logic**
  - Easily modify clues and answers

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Django
- **Language:** TypeScript / JavaScript
- **Libraries:** @dnd-kit (drag-and-drop logic), framer-motion(for opening animation)
- **Styling:** Tailwind CSS

---


## Project Structure
```bash

ClueFinding/
├── frontend/                  # React (Vite) application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Images, icons, media
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Main screens/views
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # helper and template for api
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/               # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py / wsgi.py
│   │
│   ├── core/               # Project base reference such as base model and mixin
│   │
│   │
│   └── clue/                  # where the check clue and check order logic is
│
├── .env                      
├── .gitignore
└── README.md

```

---



## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/WareBar/ClueFinding.git
cd ClueFinding

```

### 2. Install dependency and libraries(backend and frontend)

## Backend
```bash
pip install -r requirements.txt
```

## Frontend 
```bash
npm install
```

### 3. Run both frontend and backend

```bash

# go to frontend folder and run this
npm run dev


#go to backend folder and run this
python manage.py runserver

```


! Project structure created from my custom boilerplate, some parts and file are unused
