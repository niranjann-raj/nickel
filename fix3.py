import os
import re

directory = 'src/dashboard'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Buttons
    content = re.sub(r'bg-black dark:bg-white text-white dark:text-black', 'bg-white text-black', content)
    content = re.sub(r'text-white dark:text-black bg-black dark:bg-white', 'bg-white text-black', content)
    
    # Leftover dark text or backgrounds
    content = re.sub(r'dark:bg-white', 'bg-white', content)
    content = re.sub(r'dark:text-black', 'text-black', content)
    
    # If a button has 'bg-black text-white', let's make it 'bg-white text-black' if it's meant to be primary.
    # Wait, in my fix2.py I did: `gradient-bg` -> `bg-black dark:bg-white text-white dark:text-black`
    # So they currently are `bg-black dark:bg-white text-white dark:text-black`
    
    # 2. Progress bars
    # In UserSummaryCard
    content = re.sub(r'bg-black dark:bg-white', 'bg-white', content)
    
    # Let's completely remove dark: from primary buttons to force white buttons with black text on all modes.
    # Because :root and .dark both have dark backgrounds now.
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
