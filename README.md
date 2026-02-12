# Voting App

A simple voting web app built with Node.js, Express, MongoDB, and vanilla JavaScript.

This project supports two roles:
- **Voter**: can view candidates and vote once
- **Admin**: can manage candidates and view user/candidate data in the browser

---

## What this app does

- User signup and login using Aadhar number + password
- JWT-based authentication
- Role-based access (admin vs voter)
- Candidate CRUD for admin
- One-time voting for voters
- Live vote count view
- Browser dashboard for admin to inspect users, candidates, and votes

---

## Tech stack

- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Token (`jsonwebtoken`)
- Frontend: HTML, CSS, JS (no framework)

---

## Project structure

- `server.js` -> Express app entry
- `db.js` -> MongoDB connection
- `jwt.js` -> JWT helpers and auth middleware
- `routes/` -> user and candidate APIs
- `models/` -> Mongoose models
- `public/` -> frontend pages and scripts

---

## Setup

### 1) Clone and install

```bash
git clone https://github.com/just9in/voting_app.git
cd voting_app
npm install
```

### 2) Configure environment

Create a `.env` file in project root with:

```env
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/vote?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_long_random_secret
```

You can also use local MongoDB:

```env
MONGODB_URL_LOCAL=mongodb://127.0.0.1:27017/vote
JWT_SECRET=your_long_random_secret
```

> Note: if your password has special characters (`@`, `#`, `%`, etc.), URL-encode it in the connection string.

### 3) Run

```bash
npm run dev
```

or

```bash
npm start
```

Open: `http://localhost:3000`

---

## How to use

1. Open the app and sign up (first admin can be created once).
2. Login.
3. After login, you are redirected to the main dashboard.
4. Admin can add/update/delete candidates.
5. Voter can vote once.
6. Vote count updates in the dashboard.

---

## Main API routes

### User
- `POST /user/signup`
- `POST /user/login`
- `GET /user/profile` (auth required)
- `PUT /user/profile/password` (auth required)
- `GET /user/admin/users` (admin only)

### Candidate
- `GET /candidate`
- `GET /candidate/vote/count`
- `POST /candidate/vote/:candidateID` (auth required, voter only)
- `POST /candidate` (admin only)
- `PUT /candidate/:candidateID` (admin only)
- `DELETE /candidate/:candidateID` (admin only)
- `GET /candidate/admin/details` (admin only)

> Legacy compatibility: `GET /candidate/vote/:candidateID` is also accepted.

---

## Notes

- `.env` is ignored by git for security.
- If database is unreachable, APIs return a clear `503` message.
- If MongoDB auth fails, recheck Atlas user password and network access IP whitelist.

---

## License

ISC

