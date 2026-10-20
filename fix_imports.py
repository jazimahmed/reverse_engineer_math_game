import os
import glob

screens_dir = 'src/screens'
for f in glob.glob(os.path.join(screens_dir, '*.tsx')):
    if os.path.basename(f) in ('ModeSelectScreen.tsx', 'SplashScreen.tsx', 'MainMenuScreen.tsx'):
        continue
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'ReactNavigation' not in content and 'useNavigation' in content:
        if 'from "@react-navigation/native"' in content:
            content = content.replace(
                'from "@react-navigation/native"',
                'from "@react-navigation/native"\nimport { ReactNavigation } from "@react-navigation/native";'
            )
        else:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    lines.insert(i + 1, 'import { ReactNavigation } from "@react-navigation/native";')
                    break
            content = '\n'.join(lines)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')