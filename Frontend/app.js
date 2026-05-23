document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    
    scanBtn.addEventListener('click', async () => {
        const text = document.getElementById('contractInput').value;
        if (!text) return alert("Please paste a document.");

        // Show loading state
        document.getElementById('loadingSpinner').classList.remove('hidden');

        try {
            const response = await fetch('https://api-backend-c8pk.onrender.com/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentData: text }) // Correctly defining the body
            });

            if (!response.ok) throw new Error('Server error');

            const data = await response.json();
            
            // Populate your dashboard elements
            document.getElementById('safetyScore').innerText = data.score;
            document.getElementById('verdictText').innerText = data.verdict;
            
            // ... (populate your lists here using the updateList logic)

            document.getElementById('loadingSpinner').classList.add('hidden');
        } catch (err) {
            console.error("Analysis Error:", err);
            alert("Analysis failed. Check your Backend logs.");
            document.getElementById('loadingSpinner').classList.add('hidden');
        }
    });
});
