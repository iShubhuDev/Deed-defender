const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Ensure this is installed
require('dotenv').config(); // This reads your API key from the environment

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for image/document data

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/scan', async (req, res) => {
    try {
        const { documentData } = req.body; // Adjust this based on your frontend
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // YOUR SPECIFIC GEMINI LOGIC
        const result = await model.generateContent([
            "Analyze this document for legal risks:",
            documentData
        ]);
        
        const response = await result.response;
        res.json({ analysis: response.text() });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
