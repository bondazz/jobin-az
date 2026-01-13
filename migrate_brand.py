
import os
import re

def replace_branding(content):
    # 1. Jooble.az -> Jobin.az
    # 2. Jooble Azərbaycan -> Jobin Azərbaycan
    # 3. Jooble Haqqında -> Jobin Haqqında
    # 4. Jooble -> Jobin
    # 5. jooble.az -> jobin.az
    
    # We want to avoid changing hrefs if they point to jooble.az (user rule)
    # Strategy: Replace all, then fix hrefs back.
    
    # Custom replacements for specific case variations found in grep
    replacements = [
        (r'Jooble\.az', 'Jobin.az'),
        (r'Jooble Azərbaycan', 'Jobin Azərbaycan'),
        (r'Jooble Haqqında', 'Jobin Haqqında'),
        (r'Jooble', 'Jobin'),
        (r'jooble\.az', 'jobin.az'),
        (r'jooble', 'jobin') # case insensitive fallback
    ]
    
    # But wait, we should skip 'jooble' if it's part of a path in an href we want to keep?
    # Actually, let's do the broad replace and then surgical fix.
    
    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)
        
    # FIX: Restore hrefs that should stay as jooble.az
    # The user said "sadece jooble.az a nofollow linkler veya dofollow linkler oldugu kimi qalsin"
    # This refers to <a href="...">
    
    # Pattern to find jobin.az in hrefs and change back to jooble.az
    # We'll target href="https://jobin.az..." 
    new_content = re.sub(r'href=["\']https?://jobin\.az', lambda m: m.group(0).replace('jobin', 'jooble'), new_content)
    
    # Also fix lowercase jobin.az in hrefs
    new_content = re.sub(r'href=["\']https?://www\.jobin\.az', lambda m: m.group(0).replace('jobin', 'jooble'), new_content)

    return new_content

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.json', '.html', '.css')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = replace_branding(content)
                    
                    if new_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated: {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    process_directory('src')
