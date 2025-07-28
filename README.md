# Jesse's Fitness Website met Google Gemini AI 🏋️‍♂️

Een motiverende fitness website voor Jesse met geïntegreerde Google Gemini AI voor persoonlijke coaching!

## ✨ Features

- **AI Chat Coach**: Persoonlijke fitness coach powered by Google Gemini
- **AI Workout Suggesties**: Dynamische workout schema's gegenereerd door AI
- **AI Motivatie**: Persoonlijke motivatie quotes gegenereerd door AI
- **Responsive Design**: Werkt perfect op alle apparaten
- **Interactieve UI**: Animaties en moderne interface

## 🚀 Setup

### 1. Installeer Dependencies

```bash
npm install
```

### 2. Google Gemini API Key

1. Ga naar [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Maak een nieuwe API key aan
3. Kopieer de API key

### 3. Environment Variables

Maak een `.env` bestand aan in de root van het project:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Start de Server

```bash
# Development mode (met auto-reload)
npm run dev

# Production mode
npm start
```

### 5. Open de Website

Ga naar `http://localhost:3000` in je browser!

## 🎯 Hoe het Werkt

### AI Chat Coach
- Stel vragen over oefeningen, technieken, voeding
- Krijg persoonlijke adviezen van Coach Jesse
- Real-time AI responses via Google Gemini

### AI Workout Suggesties
- Klik op "🔄 Bedenk Alternatief" bij elk trainingsschema
- AI genereert nieuwe oefeningen op basis van spiergroep
- Dynamische workout variaties

### AI Motivatie
- Klik op "🚀 Krijg AI Motivatie!" 
- AI genereert persoonlijke motivatie quotes
- Nieuwe motivatie wordt toegevoegd aan de pagina

## 🛠️ Technische Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini Pro API
- **Styling**: Custom CSS met animaties
- **Responsive**: Mobile-first design

## 📁 Project Structuur

```
Website Jesse/
├── index.html          # Frontend website
├── server.js           # Express backend server
├── package.json        # Node.js dependencies
├── env.example         # Environment variables template
├── header-bg.jpg       # Header achtergrond
└── README.md          # Deze file
```

## 🔧 API Endpoints

- `POST /api/chat` - AI chat responses
- `GET /api/motivation` - AI motivatie quotes
- `POST /api/workout-suggestion` - AI workout suggesties
- `GET /api/health` - Server health check

## 💪 Voor Jesse

Jesse, deze website is speciaal voor jou gemaakt! De AI coach kent jouw trainingsschema en geeft persoonlijke adviezen. Stel vragen over:

- Oefeningen en technieken
- Trainingsschema's en splits
- Voeding en herstel
- Motivatie en mindset
- Progressie en doelen

## 🚀 Deployment

Voor productie deployment:

1. Zet je `.env` bestand op de server
2. Installeer dependencies: `npm install`
3. Start de server: `npm start`
4. Configureer een reverse proxy (nginx/apache) indien nodig

## 📝 Licentie

MIT License - Vrij te gebruiken en aan te passen!

---

**💪 KOM OP JESSE! JIJ GAAT DIT KILLEN! 🚀** 