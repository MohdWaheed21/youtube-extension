from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # ✅ Fixes CORS issue for Chrome extension

# Set up Gemini API
GEMINI_API_KEY = "AIzaSyAwsD84e-8J14PbcnCc_a8tVPxGW_aVlYY"  # 🔥 Replace with your Gemini API Key
genai.configure(api_key=GEMINI_API_KEY)

# Fallback classification based on keywords
def fallback_classification(title, description):
    explicit_keywords = ["sex", "pussy", "nude", "explicit", "18+", "xxx"]
    for keyword in explicit_keywords:
        if keyword in title.lower() or keyword in description.lower():
            return "18+"
    return "Safe"

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    title = data.get("title", "No title")
    description = data.get("description", "No description")
    captions = data.get("captions", "No captions available")

    print("Received data for analysis:")
    print(f"Title: {title}")
    print(f"Description: {description}")
    print(f"Captions: {captions[:2000]}")

    # ✅ Analyze video captions instead of just title/description
    prompt = f"""
    Analyze the following YouTube video and classify it strictly as either:
    - Safe
    - 18+ (Explicit Content)

    Title: {title}
    Description: {description}
    Captions: {captions[:2000]}  # ✅ Limits captions to 2000 characters

    ONLY return either "Safe" or "18+".
    """

    try:
        # Use the correct model name and API version
        model = genai.GenerativeModel("gemini-2.0-flash")  
        response = model.generate_content(prompt)
        contentType = response.text.strip()

        if "18+" in contentType:
            contentType = "18+"
        else:
            contentType = "Safe"

        print(f"Classification: {contentType}")
        return jsonify({"contentType": contentType})

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Fallback to keyword-based classification if Gemini API fails
        contentType = fallback_classification(title, description)
        return jsonify({"contentType": contentType})

if __name__ == "__main__":
    app.run(debug=True)