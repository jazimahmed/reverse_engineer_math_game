import glob

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    # Remove duplicate imports
    lines = content.split('\n')
    seen_imports = set()
    new_lines = []
    for line in lines:
        if line.strip().startswith('import { NativeStackNavigationProp'):
            if 'NativeStackNavigationProp' in seen_imports:
                continue
            seen_imports.add('NativeStackNavigationProp')
        elif line.strip().startswith('import { RouteProp'):
            if 'RouteProp' in seen_imports:
                continue
            seen_imports.add('RouteProp')
        new_lines.append(line)
    content = '\n'.join(new_lines)
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(content)
    print(f'Fixed {f}')