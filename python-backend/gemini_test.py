from google import genai
from gemini_api_key import gemini_api_key
import time
import matplotlib.pyplot as plt



client_gemini = genai.Client(api_key=gemini_api_key)
models = [
    ("gemini-2.0-flash-lite", "2.0 flash lite"),
    ("gemini-2.0-flash", "2.0 flash")
]

prompt = "Explain the difference between symmetric and asymmetric encryption in one sentence."

times = []
responses = []

for model, model_name in models:
    start = time.time()
    response = client_gemini.models.generate_content(
        model=model,
        contents=prompt
    )
    elapsed = time.time() - start
    times.append(elapsed)
    responses.append(response.candidates[0].content.parts[0].text.strip())
    print(f"Model: {model_name}, Time: {elapsed:.2f} seconds, Response: {responses[-1]}")

plt.figure(figsize=(8, 4))
plt.bar([model_name for _, model_name in models], times, color=['blue', 'orange'])
plt.ylabel("Response time (seconds)")
plt.title("Gemini model response time comparison")
plt.tight_layout()
plt.show()
