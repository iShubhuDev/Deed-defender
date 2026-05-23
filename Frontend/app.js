document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    
    scanBtn.addEventListener('click', async () => {
        const text = document.getElementById('contractInput').value;
        if (!text) return alert("Please paste a document.");

        // Toggle UI
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');

        try {
            const response = await fetch('https://deed-defender.onrender.com/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentData: text })
            });

            const data = await response.json();
            
            // Update Dashboard
            document.getElementById('safetyScore').innerText = data.score;
            document.getElementById('verdictText').innerText = data.verdict;
            
            // Helper to fill lists
            const fillList = (id, items, countId) => {
                const list = document.getElementById(id);
                list.innerHTML = items.map(i => `<li>🔹 ${i}</li>`).join('');
                document.getElementById(countId).innerText = items.length;
            };

            fillList('highRiskList', data.highRisk, 'highCount');
            fillList('mediumRiskList', data.mediumRisk, 'mediumCount');
            fillList('lowRiskList', data.lowRisk, 'lowCount');

            // Final Reveal
            document.getElementById('loadingSpinner').classList.add('hidden');
            document.getElementById('resultsPanel').classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert("Analysis failed. Check your API Key or Backend logs.");
            document.getElementById('loadingSpinner').classList.add('hidden');
        }
    });
});
