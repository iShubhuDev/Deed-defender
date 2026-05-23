import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

// Enable CORS for your Vercel frontend
app.use(cors({ origin: '*' })); 
app.use(express.json());

// Initialize Gemini with the API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/scan', async (req, res) => {
    try {
        const { documentData } = req.body;
        if (!documentData) {
            return res.status(400).json({ error: "No document provided" });
        }

        // Using 'gemini-1.5-flash' specifically. 
        // If this 404s, your API key might be limited to 'gemini-pro'.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze this contract for traps. Return ONLY JSON: 
        { "score": 80, "verdict": "Clear", "highRisk": [], "mediumRisk": [], "lowRisk": [] }.
        Document: ${documentData}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean markdown from AI response
        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanedJson));

    } catch (error) {
        console.error("Backend Error:", error);
        // Providing detailed error to help debug why the API call fails
        res.status(500).json({ 
            error: "Failed to connect to AI", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
