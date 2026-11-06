# K Explore – Event Management Website

A responsive event management website where users browse upcoming events, search and filter them, read details and register with validated form input.

## Tech stack
- **HTML5** – semantic structure, native `<dialog>` for the event modal
- **CSS3** – custom properties, Grid/Flexbox, media queries, transitions
- **JavaScript (ES6+)** – rendering, search/filter, form validation, countdown, Local Storage
- **Git & GitHub** – version control; **Vercel / Netlify / GitHub Pages** – deployment
- No frameworks or build step. Fonts: Sora and DM Sans (Google Fonts)

## Features
- Hero section with live countdown to the next event
- Event cards: name, date, venue, image banner, short description
- Search by keyword and filter by category
- Event details modal with registration form
- JS validation: name, email, 10-digit phone, event selection, with inline errors
- Confirmation message after successful registration
- Dark/light mode (remembers choice, respects system setting)
- Registrations stored in Local Storage (`kx-registrations`)
- Responsive on mobile, tablet and desktop; keyboard-friendly; respects reduced motion

## Project structure
```
k-explore/
├── index.html
├── css/style.css
├── js/events.js    # event data
├── js/app.js       # app logic
├── README.md
└── .gitignore
```

## Run locally
Open `index.html` in a browser, or run `npx serve .` / VS Code Live Server.

## Add or edit events
Edit `js/events.js`. To use a real photo, add `image: "https://…jpg"` to an event; otherwise a gradient banner with an emoji is shown.

## View registrations
Open DevTools → Console and run: `JSON.parse(localStorage.getItem("kx-registrations"))`

## Deploy
- **GitHub Pages:** Settings → Pages → Deploy from branch `main` / root
- **Netlify / Vercel:** import the repo, no build command, publish directory `.`

## Git commands
```
git init
git add .
git commit -m "Initial commit: K Explore event website"
git branch -M main
git remote add origin https://github.com/<your-username>/k-explore.git
git push -u origin main
```

## Links
- GitHub repo: _add link here_
- Live site: _add link here_
