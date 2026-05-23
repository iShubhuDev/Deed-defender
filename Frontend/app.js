// REPLACE your current fetch block with this:
fetch('https://deed-defender.onrender.com/api/scan', {
    method: 'POST',
    body: formData
})
.then(async (response) => {
    // 1. If the server returned an error (404, 500, etc.), 
    // we stop here and read the HTML error page to see what's wrong.
    if (!response.ok) {
        const errorHtml = await response.text(); 
        console.error("Server returned an error page:", errorHtml);
        throw new Error(`Server responded with status ${response.status}`);
    }
    // 2. If it is OK, only then parse as JSON
    return response.json();
})
.then(data => {
    console.log("Success:", data);
    // Update your UI here
})
.catch(err => {
    // This will now show you the specific error in your console
    console.error("Failed to fetch:", err);
    alert("Connection error. Check the browser console (F12) for details.");
});
