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

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is niet geconfigureerd!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('✅ Gemini AI geïnitialiseerd met API key');

// Fitness coach prompt voor Gemini
const FITNESS_COACH_PROMPT = `Je bent Max, Jesse's persoonlijke trainer. Je bent een motiverende, enthousiaste fitness expert die Jesse helpt met zijn fitness doelen.

Jesse's context:
- Jesse traint in Gym Zeewolde
- Hij volgt een 3-dagen split: Borst/Triceps, Rug/Biceps, Benen/Schouders
- Hij is gemotiveerd maar heeft soms wat extra duwtjes nodig
- Hij houdt van directe, motiverende communicatie

Je stijl:
- Gebruik veel emoji's en enthousiasme 💪🔥🚀
- Spreek Jesse direct aan met "Jesse"
- Geef praktische, concrete adviezen als zijn trainer
- Motiveer en inspireer
- Wees positief maar realistisch
- Gebruik Nederlandse fitness termen waar mogelijk
- Je bent Max, zijn trainer, dus wees direct en duidelijk

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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
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
                    parts: [{ text: "Hé Jesse! 💪 Ik ben Max, je trainer! Ik ga je helpen om je doelen te bereiken! Stel me vragen over oefeningen, training, voeding of motivatie - ik ben er voor je! 🔥" }]
                }
            ]
        });

        // Send message to Gemini with timeout
        const result = await Promise.race([
            chat.sendMessage(message),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Gemini API timeout')), 8000)
            )
        ]);
        
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
        
    } catch (error) {
        console.error('❌ Error with Gemini API:', error.message);
        console.error('Full error:', error);
        
        // Fallback responses voor als Gemini niet werkt
        const fallbackResponses = {
            'borst': "💪 Jesse, voor borstspieren: Bankdrukken, Dumbbell Press, Push-ups, Cable Flyes zijn geweldig! Focus op 8-12 reps voor spiergroei.",
            'rug': "🏋️ Jesse, voor rugspieren: Pull-ups, Deadlifts, Barbell Rows, Lat Pulldown. Zorg voor goede vorm!",
            'benen': "🔥 Jesse, voor beenspieren: Squats, Deadlifts, Lunges, Leg Press. Benen zijn je fundament!",
            'schouders': "💪 Jesse, voor schouders: Military Press, Lateral Raises, Arnold Press. Werk alle drie de koppen!",
            'biceps': "💪 Jesse, Biceps: Curls, Hammer Curls. Triceps: Dips, Pushdowns. Armen reageren goed op volume!",
            'motivatie': "🚀 Jesse, jij bent sterker dan je denkt! Elke rep telt. Focus op progressie, niet perfectie!",
            'sets': "📊 Jesse, voor spiergroei: 3-4 sets, 8-12 reps. Voor kracht: 4-5 sets, 4-6 reps. Voor uithouding: 2-3 sets, 15+ reps!"
        };
        
        const messageLower = message.toLowerCase();
        let fallbackResponse = "💪 Jesse, stel me specifieke vragen over spiergroepen, oefeningen, sets/reps, of motivatie! Ik help je graag verder!";
        
        for (const [keyword, response] of Object.entries(fallbackResponses)) {
            if (messageLower.includes(keyword)) {
                fallbackResponse = response;
                break;
            }
        }
        
        res.json({ response: fallbackResponse });
    }
});

// Motivatie endpoint
app.get('/api/motivation', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Geef Jesse een korte, motiverende fitness quote (max 100 woorden) in het Nederlands. 
        Gebruik veel emoji's en spreek Jesse direct aan. 
        Focus op doorzettingsvermogen, progressie, of het overwinnen van uitdagingen.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ motivation: text });
        
    } catch (error) {
        console.error('Error generating motivation:', error);
        
        const fallbackMotivations = [
            "Jesse, jij bent sterker dan je denkt! 💪 Elke dag is een nieuwe kans om te groeien! 🚀",
            "Elke rep brengt je dichter bij je doel! 🔥 Blijf doorgaan!",
            "Geen excuses, alleen resultaten! 💪 Jij kan dit!",
            "Vandaag is de dag om te knallen! 🚀 Focus op je doel!",
            "Zet door, ook als het zwaar wordt! 💪 Jij bent een krijger!"
        ];
        
        const randomMotivation = fallbackMotivations[Math.floor(Math.random() * fallbackMotivations.length)];
        res.json({ motivation: randomMotivation });
    }
});

// Workout suggestie endpoint
app.post('/api/workout-suggestion', async (req, res) => {
    try {
        const { muscleGroup, difficulty } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
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
        
        // Fallback workouts per spiergroep
        const fallbackWorkouts = {
            'chest': [
                '🏋️ Bankdrukken - 4 sets x 8-12 reps',
                '💪 Dumbbell Flyes - 3 sets x 12-15 reps',
                '🔥 Push-ups - 3 sets x max reps',
                '💪 Incline Bench Press - 4 sets x 8-12 reps',
                '🔥 Cable Flyes - 3 sets x 12-15 reps',
                '💪 Decline Push-ups - 3 sets x max reps'
            ],
            'back': [
                '💪 Pull-ups - 4 sets x max reps',
                '🏋️ Barbell Rows - 4 sets x 8-12 reps',
                '🔥 Lat Pulldown - 3 sets x 10-15 reps',
                '💪 Bicep Curls - 3 sets x 12-15 reps',
                '🔥 Hammer Curls - 3 sets x 12-15 reps',
                '💪 Preacher Curls - 3 sets x 10-12 reps'
            ],
            'legs': [
                '🏋️ Squats - 4 sets x 8-12 reps',
                '🔥 Lunges - 3 sets x 12 reps per been',
                '💪 Leg Press - 3 sets x 10-15 reps',
                '🔥 Shoulder Press - 4 sets x 8-12 reps',
                '💪 Side Raises - 3 sets x 12-15 reps',
                '🔥 Rear Delt Flyes - 3 sets x 12-15 reps'
            ]
        };
        
        const workout = fallbackWorkouts[muscleGroup] || fallbackWorkouts['chest'];
        res.json({ workout: workout.join('\n') });
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