import re
import subprocess

# Read the issues file
with open('issues.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all issues
pattern = r'### \[Issue #(\d+)\] (.+?)\n(\*\*Description\*\*.*?)(?=### \[Issue|\Z)'
matches = list(re.finditer(pattern, content, re.DOTALL))

print(f"Found {len(matches)} issues total")

for match in matches:
    issue_num = int(match.group(1))
    
    # Only process issues 22-40
    if 22 <= issue_num <= 40:
        title = match.group(2).strip()
        full_issue_body = match.group(3).strip()
        
        print(f'\nCreating Issue #{issue_num}: {title}')
        
        # Create the issue with gh command
        result = subprocess.run([
            'gh', 'issue', 'create',
            '--title', f'[Issue #{issue_num}] {title}',
            '--body', full_issue_body,
            '--repo', 'Ogstevyn/payeasy'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f'✓ Successfully created Issue #{issue_num}')
            print(result.stdout.strip())
        else:
            print(f'✗ Failed to create Issue #{issue_num}')
            print(result.stderr)

print("\nFinished creating issues #22-40")
