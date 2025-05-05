document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup loaded");

    // Read classification from chrome.storage.local
    chrome.storage.local.get(["classification"], function (result) {
        let classification = result.classification || "Analyzing...";
        let warningText = document.getElementById("warning-text");

        console.log("Popup Loaded: Classification:", classification);

        if (warningText) {
            warningText.textContent = `Content Type: ${classification}`;
        }

        if (classification === "18+") {
            document.getElementById("proceed").style.background = "gray";
            document.getElementById("proceed").disabled = true;
        }
    });

    // Go Back button
    document.getElementById("goBack").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.goBack();
        });
    });

    // Proceed button
    document.getElementById("proceed").addEventListener("click", function () {
        window.close();
    });
});