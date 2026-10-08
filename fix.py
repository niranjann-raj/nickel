import os
import re

directory = 'src/dashboard'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # PROGRESS BARS
    # Example 1: outer container
    content = re.sub(r'bg-gray-100 dark:bg-gray-800 rounded-full', r'bg-gray-200 dark:bg-[#333] rounded-full', content)
    content = re.sub(r'bg-\[\#222\] rounded-full', r'bg-gray-200 dark:bg-[#333] rounded-full', content)
    
    # Inner fill
    def repl_inner(m):
        cls = m.group(1)
        cls = re.sub(r'bg-\[\#111\]|bg-\[\#151515\]|bg-\[\#1a1a1a\]|bg-gray-\d00|gradient-bg', 'bg-black dark:bg-white', cls)
        cls = re.sub(r'from-[^\s]+|to-[^\s]+|border-[#\w]+', '', cls)
        cls = re.sub(r'\s+', ' ', cls).strip()
        return 'className="' + cls + '"' + m.group(2)
        
    content = re.sub(r'className="([^"]*)"(\s*style=\{\{\s*width:[^\}]+\}\})', repl_inner, content)
    
    # Also handle the template literal classNames like in GoalDetailsPage.tsx
    # className={`h-full rounded-full transition-all duration-1000 ${goal.status === 'COMPLETED' ? 'bg-[#111]' : 'bg-[#151515] border border-[#222]'}`} style={{ width: `${progressCapped}%` }}
    def repl_inner_tpl(m):
        cls = m.group(1)
        # Just replace the whole conditional if it has bg-[#111]
        cls = re.sub(r'\$\{.*\}', 'bg-black dark:bg-white', cls)
        return 'className={`' + cls + '`}' + m.group(2)
        
    content = re.sub(r'className=\{`([^`]*)`\}(\s*style=\{\{\s*width:[^\}]+\}\})', repl_inner_tpl, content)

    # BUTTONS
    # We want primary buttons to be black and white. 
    # In light mode: bg-black text-white. In dark mode: bg-white text-black.
    # Currently many buttons are bg-[#111] dark:bg-[#111] text-white.
    
    # Replace common primary button patterns
    content = re.sub(r'bg-\[\#111\]\s+text-white\s+hover:bg-\[\#222\]', 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200', content)
    content = re.sub(r'bg-\[\#1a1a1a\]\s+text-white', 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200', content)
    content = re.sub(r'bg-\[\#222\]\s+hover:bg-\[\#333\]', 'bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-200', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
