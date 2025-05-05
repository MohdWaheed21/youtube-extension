chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube Content Analyzer Installed!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "log") {
        console.log("Message from content script:", message.data);
        sendResponse({ status: "logged" });
    }
});