// Use this pattern in your app.js
fetch('https://deed-defender.onrender.com/api/scan', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }
})
.then(async (response) => {
    if (!response.ok) {
        // If the server sends an error (like 500), read it as text instead of JSON
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} - ${errorText}`);
    }
    return response.json();
})
.then(data => console.log("Success:", data))
.catch(err => console.error("Communication failed:", err));
