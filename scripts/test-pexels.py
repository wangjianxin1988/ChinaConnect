#!/usr/bin/env python3
"""Test Pexels API connection"""
import json
import os
import urllib.request
import urllib.parse

# Read API key from env file
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
api_key = ""
with open(env_path) as f:
    for line in f:
        if line.startswith('PEXELS_API_KEY='):
            api_key = line.strip().split('=', 1)[1]
            break

print(f"API Key found: {api_key[:10]}...")

url = "https://api.pexels.com/v1/search?query=Chinese+food&per_page=2&orientation=landscape"
req = urllib.request.Request(url, headers={"Authorization": api_key})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
        photos = data.get("photos", [])
        print(f"Total results: {data.get('total_results', 0)}")
        for p in photos:
            print(f"  Photo: {p['src']['large2x'][:80]}...")
except Exception as e:
    print(f"Error: {e}")
