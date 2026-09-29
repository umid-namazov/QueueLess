import urllib.request
import json

BASE_URL = "https://queueless-prod.onrender.com/api/v1"

print("Starting script...")

try:
    import httpx
    print("httpx imported successfully")
except ImportError:
    print("httpx not found")

