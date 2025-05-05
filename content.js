async function analyzeVideo(title, description, captions) {
    try {
        const response = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, captions })
        });

        const data = await response.json();
        return data.contentType; // "Safe" or "18+"
    } catch (error) {
        console.error("Error analyzing video:", error);
        return "Safe"; // Default fallback
    }
}

async function createForcedPopup(contentType) {
    if (document.getElementById('forced-popup')) return; // Prevent multiple popups

    // Pause the video
    let video = document.querySelector('video');
    if (video) {
        video.pause();
    }

    const message = contentType === "18+" ? "⚠️ Warning! 18+ Content. Proceed?" : "✅ Content Safe. Proceed?";

    // Create popup overlay
    const popup = document.createElement('div');
    popup.id = 'forced-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
    popup.style.zIndex = '9999';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.color = 'white';
    popup.style.fontSize = '24px';

    popup.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; color: black;">
            <h2>Content Analysis Result</h2>
            <p>${message}</p>
            <button id="popup-proceed" style="margin: 10px; padding: 10px 20px; background: green; color: white; border: none; border-radius: 5px;">Proceed</button>
            <button id="popup-go-back" style="margin: 10px; padding: 10px 20px; background: red; color: white; border: none; border-radius: 5px;">Go Back</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Button handlers
    document.getElementById('popup-proceed').onclick = () => {
        let video = document.querySelector('video');
        if (video) {
            video.play();
        }
        popup.remove();
    };

    document.getElementById('popup-go-back').onclick = () => {
        window.history.back();
    };
}

function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const interval = 100;
        let elapsed = 0;

        const check = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else {
                elapsed += interval;
                if (elapsed >= timeout) {
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                } else {
                    setTimeout(check, interval);
                }
            }
        };

        check();
    });
}

async function analyzeAndPopup() {
    try {
        // WAIT properly until title & description are loaded
        const titleElement = await waitForElement('h1.title yt-formatted-string');
        const descriptionElement = await waitForElement('#description yt-formatted-string');

        const title = titleElement ? titleElement.innerText : 'No title';
        const description = descriptionElement ? descriptionElement.innerText : 'No description';
        const captionsElement = document.querySelector('ytd-transcript-body-renderer') || { innerText: '' };
        const captions = captionsElement ? captionsElement.innerText : '';

        console.log("Analyzing video:");
        console.log("Title:", title);
        console.log("Description:", description);

        const contentType = await analyzeVideo(title, description, captions);
        console.log("Content classified as:", contentType);

        createForcedPopup(contentType);
    } catch (error) {
        console.error("Error analyzing and creating popup:", error);
    }
}

function waitForVideo() {
    const video = document.querySelector('video');
    if (video) {
        analyzeAndPopup();
    } else {
        setTimeout(waitForVideo, 1000); // Retry after 1 second
    }
}

// Detect YouTube page navigation (even without reload)
function setupNavigationListener() {
    // Listen for YouTube internal page navigation
    window.addEventListener('yt-navigate-finish', () => {
        console.log('Detected YouTube video navigation!');
        waitForVideo();
    });

    // Initial load
    waitForVideo();
}

setupNavigationListener();
