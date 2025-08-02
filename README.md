# 🔍 Apify Actor Runner (Frontend + API)

This project is a lightweight web interface that lets you run any [Apify actor](https://docs.apify.com/actors/running) (like `contact-detail-scraper` or `web-scraper`) by providing your Apify token, selecting the actor ID, and passing required input fields (like a `url`).

---

## 🚀 Features

- 📌 Input your Apify personal token
- ⚙️ Select any actor (e.g. `contact-detail-scraper`)
- 📝 Automatically send required input such as `url`
- 📬 Submit the request to Apify API and get real-time results
- ✅ Plain HTML + JavaScript frontend (no frameworks)
- 🛠 Backend API proxy built with Node.js/Next.js route at `/api/run-actor`

---

## 📂 Folder Structure

project-root/
├── public/
│ └── index.html # Main frontend interface
├── pages/
│ └── api/
│ └── run-actor.js # API route to run Apify actor via POST
├── README.md # You're reading it :)


---

## 🛠 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/apify-runner-ui.git
cd apify-runner-ui
```
2. Install dependencies (if using Next.js backend)
```
npm install
```
3. Start the development server
```
npm run dev
```
🧾 How It Works
➤ Frontend (index.html)
The form includes:

Apify Token (required)

Actor ID dropdown (e.g. contact-detail-scraper, web-scraper)

URL input (required for contact-detail-scraper)

➤ JavaScript Logic
The frontend sends a POST request to /api/run-actor with:
```
{
  "token": "APIFY_PERSONAL_TOKEN",
  "actorId": "contact-detail-scraper",
  "input": {
    "url": "https://example.com"
  }
}
```
➤ Backend API (/api/run-actor)
This route proxies the request to Apify API:
```
POST https://api.apify.com/v2/acts/apify~ACTOR_ID/runs?token=YOUR_TOKEN
```
With input passed in the body (e.g., { "url": "..." })
