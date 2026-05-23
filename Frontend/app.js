document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    scanBtn.addEventListener('click', async () => {
        const text = document.getElementById('contractInput').value;
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');

        try {
            const res = await fetch('https://deed-defender.onrender.com/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentData: text })
            });
            const data = await res.json();

            document.getElementById('safetyScore').innerText = data.score;
            document.getElementById('verdictText').innerText = data.verdict;
            
            updateList('highRiskList', data.highRisk, 'highCount');
            updateList('mediumRiskList', data.mediumRisk, 'mediumCount');
            updateList('lowRiskList', data.lowRisk, 'lowCount');

            document.getElementById('loadingSpinner').classList.add('hidden');
            document.getElementById('resultsPanel').classList.remove('hidden');
        } catch (e) {
            alert("Analysis failed.");
        }
    });
});

function updateList(id, items, countId) {
    const list = document.getElementById(id);
    list.innerHTML = items.map(i => `<li>${i}</li>`).join('');
    document.getElementById(countId).innerText = items.length;
}
