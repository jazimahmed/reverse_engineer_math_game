import glob
import os

for f in glob.glob('src/screens/*.tsx'):
    if os.path.basename(f) in ('ModeSelectScreen.tsx', 'SplashScreen.tsx', 'MainMenuScreen.tsx'):
        continue
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'ReactNavigation' in content and 'from "@react-navigation/native"' not in content:
        content = content.replace(
            'from "@react-navigation/native"',
            'from "@react-navigation/native"\nimport { ReactNavigation } from "@react-navigation/native";'
        )
        # If the import doesn't exist, add after first import
        if 'from "@react-navigation/native"' not in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i + 1, 'import { ReactNavigation } from "@react-navigation/native";')
                    break
            content = '\n'.join(lines)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')