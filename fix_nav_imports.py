import glob

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'NativeStackNavigationProp' in content or 'RouteProp' in content:
        if 'from "@react-navigation/native-stack"' not in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'from "@react-navigation/native"' in line:
                    lines.insert(i + 1, 'import { NativeStackNavigationProp, RouteProp } from "@react-navigation/native-stack";')
                    break
            content = '\n'.join(lines)
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')