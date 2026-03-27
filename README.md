# Digital Heroes - MERN Stack Challenge

A professional golf charity platform featuring secure authentication, role-based redirection, and a dynamic scoring system.

##  Live Links
- **Frontend (Vercel):** [https://digital-heroes-mu.vercel.app/](https://digital-heroes-mu.vercel.app/)
- **Backend (Render):** [https://digitalheroes-bkdq.onrender.com/](https://digitalheroes-bkdq.onrender.com/)

##  Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Deployment:** Vercel (Client) & Render (Server)

##  Key Features
- **Role-Based Access:** Automatic redirection for `Administrators` (Admin Panel) vs `Golfers` (Dashboard).
- **Secure Auth:** JWT-based authentication and protected API routes.
- **Leaderboard Logic:** Implemented 5-score rolling average and winner verification logic as per PRD.
- **Responsive UI:** Modern, mobile-friendly design using Tailwind CSS.

##  Infrastructure & Troubleshooting
During deployment, I successfully resolved the following production hurdles:
- **Dependency Resolution:** Fixed Vite 8 / React environment conflicts using `--legacy-peer-deps`.
- **Permission Fixes:** Resolved Vercel Error 126 by optimizing the repository structure and removing local `node_modules` from Git tracking.
- **CORS Configuration:** Established secure cross-origin communication between Vercel and Render.

##  Installation
1. Clone the repo: `git clone https://github.com/vivek7941/DigitalHeroes.git`
2. Install Frontend: `cd frontend && npm install`
3. Install Backend: `npm install` (in root)
4. Start development: `npm run dev`

---
*Developed by Vivek*
