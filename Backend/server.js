import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

const app = express();

// Middleware: Enable CORS for your Vercel frontend and allow JSON parsing
app.use(cors({
    origin: 'https://deed-defender.vercel.app' // Replace with your actual frontend URL if different
}));
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Main Scan Endpoint
app.post('/api/scan', async (req, res) => {
    try {
        const { documentData } = req.body;

        if (!documentData) {
            return res.status(400).json({ error: "No document data provided" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Prompting the AI to return structured JSON
        const prompt = `Analyze the following legal document for traps, risks, and standard clauses. 
        Return your analysis ONLY as a valid JSON object with exactly this format:
        { 
          "score": number, 
          "verdict": "string", 
          "highRisk": ["item1", "item2"], 
          "mediumRisk": ["item1", "item2"], 
          "lowRisk": ["item1", "item2"] 
        }
        Document: ${documentData}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean the AI output in case it includes markdown tags
        const jsonString = responseText.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(jsonString);

        res.json(analysis);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Failed to process document" });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('DeedDefend Backend is live.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post('/api/scan', async (req, res) => {
    try {
        const { documentData } = req.body;
        if (!documentData) return res.status(400).json({ error: "Missing data" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Analyze: " + documentData);
        
        // Ensure you return JSON. 
        // If your AI prompt returns markdown, strip it first:
        const rawText = result.response.text().replace(/```json|```/g, '');
        const jsonResponse = JSON.parse(rawText);
        
        res.json(jsonResponse);
    } catch (error) {
        console.error(error); // This will show you the exact error in your Render logs
        res.status(500).json({ error: "Server error" });
    }
});
