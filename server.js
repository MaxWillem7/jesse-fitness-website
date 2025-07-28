const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is niet geconfigureerd!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('✅ Gemini AI geïnitialiseerd met API key');

// Fitness coach prompt voor Gemini
const FITNESS_COACH_PROMPT = `Je bent Jesse's persoonlijke fitness coach. Je naam is "Coach Jesse" en je bent een motiverende, enthousiaste fitness expert die Jesse helpt met zijn fitness doelen.

Jesse's context:
- Jesse traint in Gym Zeewolde
- Hij volgt een 3-dagen split: Borst/Triceps, Rug/Biceps, Benen/Schouders
- Hij is gemotiveerd maar heeft soms wat extra duwtjes nodig
- Hij houdt van directe, motiverende communicatie

Je stijl:
- Gebruik veel emoji's en enthousiasme 💪🔥🚀
- Spreek Jesse direct aan met "Jesse"
- Geef praktische, concrete adviezen
- Motiveer en inspireer
- Wees positief maar realistisch
- Gebruik Nederlandse fitness termen waar mogelijk

Beantwoord vragen over:
- Oefeningen en technieken
- Trainingsschema's en splits
- Voeding en herstel
- Motivatie en mindset
- Progressie en doelen

Houd je antwoorden relatief kort maar informatief. Focus op praktische tips die Jesse direct kan toepassen.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Bericht is vereist' });
        }

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Create chat session
        const chat = model.startChat({
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
            history: [
                {
                    role: "user",
                    parts: [{ text: FITNESS_COACH_PROMPT }]
                },
                {
                    role: "model",
                    parts: [{ text: "Hé Jesse! 💪 Ik ben je persoonlijke fitness coach en ik ga je helpen om je doelen te bereiken! Stel me vragen over oefeningen, training, voeding of motivatie - ik ben er voor je! 🔥" }]
                }
            ]
        });

        // Send message to Gemini
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
        
    } catch (error) {
        console.error('❌ Error with Gemini API:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ 
            response: "Sorry Jesse, er ging iets mis met mijn AI brein! 💭 Probeer het over een paar minuten opnieuw, of stel me een andere vraag! 💪" 
        });
    }
});

// Motivatie endpoint
app.get('/api/motivation', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const prompt = `Geef Jesse een korte, motiverende fitness quote (max 100 woorden) in het Nederlands. 
        Gebruik veel emoji's en spreek Jesse direct aan. 
        Focus op doorzettingsvermogen, progressie, of het overwinnen van uitdagingen.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ motivation: text });
        
    } catch (error) {
        console.error('Error generating motivation:', error);
        res.json({ 
            motivation: "Jesse, jij bent sterker dan je denkt! 💪 Elke dag is een nieuwe kans om te groeien! 🚀" 
        });
    }
});

// Workout suggestie endpoint
app.post('/api/workout-suggestion', async (req, res) => {
    try {
        const { muscleGroup, difficulty } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const prompt = `Jesse vraagt om een ${difficulty || 'gemiddeld'} niveau workout voor ${muscleGroup}. 
        Geef 6 oefeningen met sets en reps in het Nederlands. 
        Gebruik emoji's en spreek Jesse direct aan. 
        Format: "🏋️ Oefening - X sets x Y reps"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ workout: text });
        
    } catch (error) {
        console.error('Error generating workout:', error);
        res.status(500).json({ 
            workout: "Sorry Jesse, ik kon geen workout genereren. Probeer het later opnieuw! 💪" 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Jesse\'s Fitness Coach is online! 💪' });
});

app.listen(PORT, () => {
    console.log(`🚀 Jesse's Fitness Website draait op poort ${PORT}`);
    console.log(`💪 Gemini AI Coach is klaar om Jesse te helpen!`);
}); 