import os
import re

directory = 'src/dashboard'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Buttons
    content = re.sub(r'\bbg-white\s+text-black\b', 'bg-[#ffffff] text-[#000000]', content)
    content = re.sub(r'\bbg-black\s+text-white\b', 'bg-[#000000] text-[#ffffff]', content)
    
    # In case there are buttons that are just text-black or bg-white
    # It's safer to just replace any remaining 'bg-white text-black' or similar that we introduced.
    
    # Progress bars inside StreakCard, GoalDetailsPage, GoalCard, UserSummaryCard
    # They might just be `bg-white`.
    content = re.sub(r'h-full rounded-full transition-all duration-1000 bg-white', 'h-full rounded-full transition-all duration-1000 bg-[#ffffff]', content)
    content = re.sub(r'duration-1000 ease-out bg-white', 'duration-1000 ease-out bg-[#ffffff]', content)
    content = re.sub(r'h-full bg-black dark:bg-white rounded-full', 'h-full bg-[#ffffff] rounded-full', content)
    content = re.sub(r'h-full bg-black dark:bg-white', 'h-full bg-[#ffffff]', content)
    content = re.sub(r'bg-white dark:text-black', 'bg-[#ffffff] text-[#000000]', content)
    content = re.sub(r'dark:bg-white', 'bg-[#ffffff]', content)
    
    # Let's ensure any naked bg-white for buttons or progress bars we touched becomes bg-[#ffffff]
    # For example, in GoalsPage.tsx, we have "bg-white text-black"
    content = re.sub(r'bg-white text-black', 'bg-[#ffffff] text-[#000000]', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
