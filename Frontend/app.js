// app.js
document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    
    // We use an Event Listener here instead of onclick in the HTML
    scanBtn.addEventListener('click', async () => {
        const textElement = document.getElementById('contractInput');
        const text = textElement ? textElement.value : "";
        
        if (!text) {
            alert("Please paste a document.");
            return;
        }

        // Show loading spinner
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');

        try {
            // Send the request to your Render backend
            const response = await fetch('https://deed-defender.onrender.com/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentData: text })
            });

            if (!response.ok) throw new Error('Server returned an error');

            const data = await response.json();
            
            // Populate the UI
            document.getElementById('safetyScore').innerText = data.score;
            document.getElementById('verdictText').innerText = data.verdict;
            
            // Helper function to update lists
            const updateList = (id, items, countId) => {
                const list = document.getElementById(id);
                if (list) {
                    list.innerHTML = items.map(item => `<li>🔹 ${item}</li>`).join('');
                    document.getElementById(countId).innerText = items.length;
                }
            };

            updateList('highRiskList', data.highRisk, 'highCount');
            updateList('mediumRiskList', data.mediumRisk, 'mediumCount');
            updateList('lowRiskList', data.lowRisk, 'lowCount');

            // Hide loading, show results
            document.getElementById('loadingSpinner').classList.add('hidden');
            document.getElementById('resultsPanel').classList.remove('hidden');

        } catch (err) {
            console.error("Analysis Error:", err);
            alert("Analysis failed. Ensure your Backend is processing JSON correctly.");
            document.getElementById('loadingSpinner').classList.add('hidden');
        }
    });
});
