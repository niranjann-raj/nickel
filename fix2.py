import os
import re

directory = 'src/dashboard'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Replace gradient-bg text-white with high-contrast black and white
    content = re.sub(r'gradient-bg text-white|text-white gradient-bg|gradient-bg', 'bg-black dark:bg-white text-white dark:text-black', content)
    
    # 2. Replace bg-[#111] dark:bg-[#111] text-white (and variants) for primary buttons
    # GoalsPage line 259
    content = re.sub(r'bg-\[\#1a1a1a\] text-gray-400 dark:bg-\[\#111\] dark:text-white', 'bg-black dark:bg-white text-white dark:text-black', content)
    
    # GoalsPage line 373
    content = re.sub(r'text-white bg-\[\#111\] hover:bg-\[\#111\]', 'text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200', content)
    
    # SavingWalletCard
    content = re.sub(r'bg-\[\#111\] text-white', 'bg-black dark:bg-white text-white dark:text-black', content)
    
    # Replace other leftover dark primary buttons to white.
    # Like bg-[#111] text-gray-500 -> bg-black dark:bg-white text-white dark:text-black
    content = re.sub(r'bg-\[\#111\] text-gray-500(.*?hover:bg-\[\#111\])', r'bg-gray-100 dark:bg-white text-black\1', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
