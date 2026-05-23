import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize the Gemini AI Engine
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware Configuration (Handles massive file uploads up to 100MB safely)
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// -------------------------------------------------------------------------
// CORE DUAL ROUTE DOCUMENT SCAN PIPELINE
// -------------------------------------------------------------------------
app.post('/api/scan', async (req, res) => {
    try {
        const { contractText, fileData, mimeType } = req.body;

        // Initialize empty content structure array for Gemini engine payload
        let contentsPayload = [];

        // Determine if we are analyzing raw text or reading a full native PDF structure
        if (fileData && mimeType) {
            contentsPayload = [
                {
                    inlineData: {
                        data: fileData,
                        mimeType: mimeType
                    }
                },
                "Analyze this uploaded legal document file thoroughly."
            ];
        } else if (contractText && contractText.trim() !== "") {
            contentsPayload = [`Analyze this text structure:\n\n${contractText}`];
        } else {
            return res.status(400).json({ error: "No usable document data or text sent to analysis gateway." });
        }

        // System Legal AI Analysis Directives
        const systemInstruction = `
            You are a ruthless, world-class corporate contract lawyer acting as a consumer advocate. 
            Analyze the provided legal document, deed, image, or PDF text. Ignore generic boilerplate definitions.
            Identify hidden traps, predatory clauses, financial liabilities, sneaky automatic renewals, or severe forfeitures of rights.
            
            You MUST return your analysis STRICTLY as a valid JSON object matching this schema structure exactly, with NO markdown formatting, NO backticks, and NO conversational text wrapper:
            {
              "score": <Integer between 1 and 100 representing overall safety. 100 is completely safe, 1 is extremely dangerous>,
              "verdict": "<A short, high-impact structural warning sentence summarizing the safety status>",
              "verdictClass": "<Either 'high-risk', 'medium-risk', or 'low-risk' depending on the score threshold>",
              "high": [
                { "clause": "Section Name / Reference", "desc": "Plain-English translation of why this specific clause is a dangerous trap." }
              ],
              "medium": [
                { "clause": "Section Name / Reference", "desc": "Plain-English translation of a sneaky, unfavorable provision." }
              ],
              "low": [
                { "clause": "Section Name / Reference", "desc": "Standard safe point or consumer-friendly clause found." }
              ]
            }
        `;

        // Execute processing stream via Gemini 2.5 Flash API with multi-modal content arrays
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsPayload,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                temperature: 0.15
            }
        });

        // Strip structural syntax blocks if leaking, then return pure JSON downstream
        const cleanJsonString = response.text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanJsonString));

    } catch (error) {
        console.error("Critical Engine Disruption:", error);
        res.status(500).json({ error: "DeedDefend Analysis Node Error: Critical pipeline execution error." });
    }
});

// Start listening for network signals
app.listen(PORT, () => {
    console.log(`DeedDefend Backend running perfectly on port ${PORT}`);
});