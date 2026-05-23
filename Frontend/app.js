// Utility function to convert a browser file handle into a base64 data string
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Extract the pure base64 string out of the data URL header
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

// Main processing engine execution point triggered by the scan button
async function processContractScan() {
    const textInput = document.getElementById('contractInput');
    const fileInput = document.getElementById('fileInput');
    const scanButton = document.getElementById('scanBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultsPanel = document.getElementById('resultsPanel');

    const contractText = textInput.value;
    const uploadedFile = fileInput.files[0];

    // Safety check: Ensure at least one input system is populated
    if ((!contractText || contractText.trim() === "") && !uploadedFile) {
        alert("Please paste document text or select a PDF file first before analyzing.");
        return;
    }

    // Adjust UI state into processing mode
    scanButton.disabled = true;
    scanButton.innerText = "Processing Document Files...";
    loadingSpinner.classList.remove('hidden');
    resultsPanel.classList.add('hidden');

    try {
        let requestBody = {};

        // If a file is selected, process it as raw binary data stream
        if (uploadedFile) {
            const base64Data = await fileToBase64(uploadedFile);
            requestBody = {
                fileData: base64Data,
                mimeType: uploadedFile.type
            };
        } else {
            // Otherwise, fall back cleanly to your original text string method
            requestBody = {
                contractText: contractText
            };
        }

        // Send payload directly to our local port 5000 server instance
        const response = await fetch('http://localhost:5000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Critical error reported by analysis node.");
        }

        // Display the perfectly structured analysis metrics
        displayResultsToUI(data);

    } catch (error) {
        console.error("Pipeline breakdown connection error:", error);
        alert("Failed to communicate with local AI Backend: " + error.message);
    } finally {
        scanButton.disabled = false;
        scanButton.innerText = "Analyze Document Structure";
        loadingSpinner.classList.add('hidden');
    }
}

// Sub-engine to format and update elements on the HTML template interface
function displayResultsToUI(analysisResult) {
    const resultsPanel = document.getElementById('resultsPanel');
    const scoreElement = document.getElementById('safetyScore');
    const verdictText = document.getElementById('verdictText');
    
    const highRiskList = document.getElementById('highRiskList');
    const mediumRiskList = document.getElementById('mediumRiskList');
    const lowRiskList = document.getElementById('lowRiskList');

    // Clear previous results lists entirely
    highRiskList.innerHTML = "";
    mediumRiskList.innerHTML = "";
    lowRiskList.innerHTML = "";

    // Set core text stats elements
    scoreElement.innerText = analysisResult.score;
    verdictText.innerText = analysisResult.verdict;

    // Dynamically tweak the color profile based on danger status levels
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.className = "score-circle " + analysisResult.verdictClass;

    // Render severe high-risk items
    document.getElementById('highCount').innerText = analysisResult.high.length;
    analysisResult.high.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.clause}:</strong> ${item.desc}`;
        highRiskList.appendChild(li);
    });

    // Render medium-risk unfavorable items
    document.getElementById('mediumCount').innerText = analysisResult.medium.length;
    analysisResult.medium.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.clause}:</strong> ${item.desc}`;
        mediumRiskList.appendChild(li);
    });

    // Render clean low-risk points
    document.getElementById('lowCount').innerText = analysisResult.low.length;
    analysisResult.low.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.clause}:</strong> ${item.desc}`;
        lowRiskList.appendChild(li);
    });

    // Smoothly reveal the entire results dashboard panel
    resultsPanel.classList.remove('hidden');
}