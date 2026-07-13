import streamlit as st
import requests
from PIL import Image
import io
import base64
import urllib.parse

# -----------------------------
# 🔧 CONFIGURATION
# -----------------------------
OPENROUTER_API_KEY = "XXXXXXX-XXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXX"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

st.set_page_config(page_title="AI Object Detector + Live Resources", layout="centered")

st.title("🤖 AI Object Detector + Smart Resource Finder")
st.write("Upload an image or take a photo. The AI will identify the object, share info, and give **real links** (Wikipedia, YouTube, etc).")

# -----------------------------
# 📸 File Upload / Camera Input
# -----------------------------
uploaded_file = st.file_uploader("📤 Upload an Image", type=["jpg", "jpeg", "png"])
camera_input = st.camera_input("Or take a photo")

# -----------------------------
# 🧩 Helper Functions
# -----------------------------
def image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def detect_object_openrouter(image):
    img_b64 = image_to_base64(image)
    image_url = f"data:image/jpeg;base64,{img_b64}"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a vision-based AI assistant. Analyze the given image, identify the main object, "
                    "and return only the object's name (single line, no explanation)."
                )
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Identify the main object in this image:"},
                    {"type": "image_url", "image_url": image_url}
                ]
            }
        ],
        "max_tokens": 50
    }

    response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    else:
        raise Exception(f"OpenRouter API error {response.status_code}: {response.text}")

def generate_ai_description(object_name):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": "You are an assistant that provides concise, interesting, and structured information."
            },
            {
                "role": "user",
                "content": (
                    f"Give 3–5 interesting facts, recipes, or uses for '{object_name}' in markdown format. "
                    "Keep it clean and easy to read."
                )
            }
        ],
        "max_tokens": 250
    }

    response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        data = response.json()
        return data["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenRouter API error {response.status_code}: {response.text}")

def generate_resource_links(object_name):
    """Generate real-world clickable resource links dynamically."""
    query = urllib.parse.quote(object_name)
    links = {
        "🔹 Wikipedia": f"https://en.wikipedia.org/wiki/{query}",
        "🎥 YouTube Tutorials": f"https://www.youtube.com/results?search_query={query}+uses+or+recipes",
        "🍽️ Google Recipes": f"https://www.google.com/search?q={query}+recipes",
        "🛒 Amazon Products": f"https://www.amazon.in/s?k={query}"
    }

    markdown_links = "\n".join([f"- [{name}]({url})" for name, url in links.items()])
    return markdown_links

# -----------------------------
# 🚀 App Logic
# -----------------------------
if uploaded_file or camera_input:
    if uploaded_file:
        image = Image.open(uploaded_file)
    else:
        image = Image.open(camera_input)

    st.image(image, caption="🖼️ Uploaded Image", use_column_width=True)

    if st.button("🔍 Detect Object"):
        try:
            st.info("🤔 Detecting object...")
            object_name = detect_object_openrouter(image)
            st.success(f"✅ Detected Object: **{object_name}**")

            st.subheader("🧠 AI Insights:")
            ai_info = generate_ai_description(object_name)
            st.markdown(ai_info)

            st.subheader("🌐 Real Resource Links:")
            st.markdown(generate_resource_links(object_name))
        except Exception as e:
            st.error(f"❌ Error: {e}")
else:
    st.info("👆 Upload or capture an image to begin.")

# -----------------------------
# 💬 Footer
# -----------------------------
st.markdown("---")
st.caption("Made with ❤️ using Streamlit + OpenRouter GPT-4o-mini")

st.caption("Note: The AI model may not always be accurate. For best results, use clear images of single objects.")
