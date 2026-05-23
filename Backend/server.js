import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Check API key
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing in .env file');
    process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check route
app.get('/', (req, res) => {
    res.send('✅ Gemini backend server is running');
});

// Main API route
app.post('/api/scan', async (req, res) => {
    try {
        const { documentData } = req.body;

        // Validate input
        if (!documentData) {
            return res.status(400).json({
                error: 'No document provided'
            });
        }

        // Use latest working Gemini model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash'
        });

        const prompt = `
Analyze this contract for hidden traps and risks.

Return ONLY valid JSON in this exact format:

{
  "score": 80,
  "verdict": "Clear",
  "highRisk": [],
  "mediumRisk": [],
  "lowRisk": []
}

Document:
${documentData}
`;

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown formatting if AI adds it
        const cleanedJson = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            const parsedJson = JSON.parse(cleanedJson);
            res.json(parsedJson);

        } catch (jsonError) {

            console.error('❌ Invalid JSON from AI:', text);

            res.status(500).json({
                error: 'AI returned invalid JSON',
                raw: text
            });
        }

    } catch (error) {

        console.error('❌ Backend Error:', error);

        res.status(500).json({
            error: 'Failed to connect to AI',
            details: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
