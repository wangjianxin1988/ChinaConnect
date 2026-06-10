#!/usr/bin/env python3
"""Update Pexels API key in .env file"""
import os

env_path = "D:/suoyouxiangmu/chinaconnect/.env"
new_key = "2Uf29HlNIP9cbdaqQRRi5lizUjwQjs7x43x6pv2pab1EtyXkHvYFY3tT"

with open(env_path, 'r') as f:
    content = f.read()

# Update existing key
if 'VITE_PEXELS_API_KEY=' in content:
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('VITE_PEXELS_API_KEY='):
            lines[i] = f'VITE_PEXELS_API_KEY={new_key}'
            break
    content = '\n'.join(lines)
else:
    content += f'\nVITE_PEXELS_API_KEY={new_key}\n'

with open(env_path, 'w') as f:
    f.write(content)

print("Pexels API key updated")

# Verify
with open(env_path, 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            print(f"  {line.strip()[:40]}...")
