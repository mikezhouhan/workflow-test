import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-bWqdExNFces6NnW5Ea29C76d5f7349C2A096B0164bB4Fc24",
    base_url="http://34.73.28.53:7091/v1"
)

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Getting the base64 string
base64_image = encode_image("/Users/jasper/Desktop/截屏2025-04-14 07.19.15.png")

response = client.chat.completions.create(
  model="gemini-2.0-flash",
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is in this image?",
        },
        {
          "type": "image_url",
          "image_url": {
            "url":  f"data:image/jpeg;base64,{base64_image}"
          },
        },
      ],
    }
  ],
)

print(response.choices[0])