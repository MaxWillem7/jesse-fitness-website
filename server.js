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

// Test API key
async function testGeminiAPI() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test");
        console.log('✅ Gemini API werkt correct!');
        return true;
    } catch (error) {
        console.error('❌ Gemini API test failed:', error.message);
        console.log('⚠️  Gebruik fallback responses');
        return false;
    }
}

// Test API bij startup
testGeminiAPI();

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

        // Try Gemini API first, fallback to local responses
        try {
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
        } catch (geminiError) {
            console.log('⚠️  Gemini API failed, using fallback');
            throw new Error('Use fallback');
        }
        
    } catch (error) {
        console.error('❌ Error with Gemini API:', error.message);
        console.error('Full error:', error);
        
        // Fallback responses voor als Gemini niet werkt
        const fallbackResponses = {
            'borst': "💪 JESSE, VOOR BORSTSPIEREN: BANKD RUKKEN, DUMBBELL PRESS, PUSH-UPS, CABLE FLYES ZIJN GEWELDIG! FOCUS OP 8-12 REPS VOOR SPIERGROEI! 🏋️‍♂️",
            'rug': "🏋️ JESSE, VOOR RUGSPIEREN: PULL-UPS, DEADLIFTS, BARBELL ROWS, LAT PULLDOWN. ZORG VOOR GOEDE VORM! 💪",
            'benen': "🔥 JESSE, VOOR BEENSPIEREN: SQUATS, DEADLIFTS, LUNGES, LEG PRESS. BENEN ZIJN JE FUNDAMENT! ⚡",
            'schouders': "💪 JESSE, VOOR SCHOUDERS: MILITARY PRESS, LATERAL RAISES, ARNOLD PRESS. WERK ALLE DRIE DE KOPPEN! 🚀",
            'biceps': "💪 JESSE, BICEPS: CURLS, HAMMER CURLS. TRICEPS: DIPS, PUSHDOWNS. ARMEN REAGEREN GOED OP VOLUME! 🔥",
            'motivatie': "🚀 JESSE, JIJ BENT STERKER DAN JE DENKT! ELKE REP TELT. FOCUS OP PROGRESSIE, NIET PERFECTIE! 💪",
            'sets': "📊 JESSE, VOOR SPIERGROEI: 3-4 SETS, 8-12 REPS. VOOR KRACHT: 4-5 SETS, 4-6 REPS. VOOR UITHOUDING: 2-3 SETS, 15+ REPS! 🏋️‍♂️"
        };
        
        const messageLower = message.toLowerCase();
        let fallbackResponse = "💪 Jesse, je moet niet zoveel vragen stellen! HOU GEWOON JE BEK EN GA DOOR MET TRAINEN!";
        
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
        console.log('⚠️  Gemini API failed for motivation, using fallback');
        console.error('Error generating motivation:', error);
        
        const fallbackMotivations = [
            "JESSE, JIJ BENT STERKER DAN JE DENKT! 💪 ELKE DAG IS EEN NIEUWE KANS OM TE GROEIEN! 🚀",
            "ELKE REP BRENGT JE DICHTER BIJ JE DOEL! 🔥 BLIJF DOORGAAN! 💪",
            "GEEN EXCUSES, ALLEEN RESULTATEN! 💪 JIJ KAN DIT! 🏋️‍♂️",
            "VANDAAG IS DE DAG OM TE KNALLEN! 🚀 FOCUS OP JE DOEL! 💪",
            "ZET DOOR, OOK ALS HET ZWAAR WORDT! 💪 JIJ BENT EEN KRIJGER! ⚡",
            "PUSH JE LIMIETEN! 🔥 JIJ BENT EEN BEAST! 💪",
            "ELKE REP TELT! ⚡ BLIJF DOORGAAN! 🏆",
            "GEEN TERUGVAL! 💪 JIJ KAN DIT! 🚀",
            "FOCUS OP JE DOEL! 🎯 JIJ WORDT STERKER! 💪",
            "JIJ BENT ONSTOPPABLE! 🔥 BLIJF DOORGAAN! ⚡"
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
        console.log('⚠️  Gemini API failed for workout, using fallback');
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