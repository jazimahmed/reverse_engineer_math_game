import glob

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    # Remove the incorrect import from @react-navigation/native
    content = content.replace('import { NativeStackNavigationProp, RouteProp } from "@react-navigation/native";\n', '')
    content = content.replace('import { NativeStackNavigationProp, RouteProp } from "@react-navigation/native";', '')
    # Add the correct import
    if 'NativeStackNavigationProp' in content and 'from "@react-navigation/native-stack"' not in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('import '):
                lines.insert(i + 1, 'import { NativeStackNavigationProp } from "@react-navigation/native-stack";\nimport { RouteProp } from "@react-navigation/native";')
                break
        content = '\n'.join(lines)
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(content)
    print(f'Fixed {f}')