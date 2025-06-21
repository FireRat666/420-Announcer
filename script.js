const NETLIFY_FUNCTION_URL = '/.netlify/functions/check-blazing'; // Relative path to your Netlify function

const statusMessageElement = document.getElementById('status-message');
const audioLinksContainer = document.getElementById('audio-links-container');
const lastUpdatedElement = document.getElementById('last-updated');

let lastFetchedData = null; // Store the last data to prevent redundant updates

async function fetchBlazingData() {
    try {
        const response = await fetch(NETLIFY_FUNCTION_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data);

        // Only update if the data is different from the last fetch
        // This is a simple check, you might want a more robust comparison
        if (JSON.stringify(data) === JSON.stringify(lastFetchedData)) {
            console.log("Data unchanged, skipping update.");
            return;
        }
        lastFetchedData = data;

        updateDisplay(data);

    } catch (error) {
        console.error("Error fetching blazing data:", error);
        statusMessageElement.textContent = "Error fetching data. Please try again later.";
        audioLinksContainer.innerHTML = "";
    } finally {
        lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        if (lastFetchedData.timeRemainingSeconds < 60) {
          // Poll every second with less than a minute until 420
          setTimeout(fetchBlazingData, 1000);
        } else {
          // Poll every (30 seconds)
          setTimeout(fetchBlazingData, 30000);
        }
    }
}

function updateDisplay(data) {
    const { next420Time, timeRemainingMinutes, location, messageType, messageLinks } = data;

    let messageText = "";
    let linksHtml = "";

    switch (messageType) {
        case "nextBlaze":
            messageText = `Next 4:20 is in ${timeRemainingMinutes} minutes in ${location}.`;
            break;
        case "blazeItWarning":
            messageText = `Warning! 4:20 is almost here in ${location} (in ${timeRemainingMinutes} mins)!`;
            break;
        case "blazeItNow":
            messageText = `It's 4:20 in ${location} right now!`;
            break;
        default:
            messageText = `Upcoming 4:20 information.`;
    }

    statusMessageElement.textContent = messageText;

    linksHtml += `<p><strong>Audio Sequence:</strong></p>`;
    if (messageLinks && messageLinks.length > 0) {
        messageLinks.forEach((link) => {
            linksHtml += `<p><a class="audio-link" href="${link}" target="_blank">${link}</a></p>`;
        });
    } else {
        linksHtml += `<p>No audio links available.</p>`;
    }

    // You can also display the raw links if needed for debugging
    // linksHtml += `<p><strong>Raw Links Generated:</strong></p>`;
    // linksHtml += `<p>Time Mins Link: <a class="audio-link" href="${data.rawTimeMinsLink}" target="_blank">${data.rawTimeMinsLink}</a></p>`;
    // linksHtml += `<p>Location Link: <a class="audio-link" href="${data.rawLocationLink}" target="_blank">${data.rawLocationLink}</a></p>`;

    audioLinksContainer.innerHTML = linksHtml;
}

// Initial fetch when the page loads
fetchBlazingData();