import glob

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'from "@react-navigation/native-stack"' in content:
        content = content.replace(
            'import { NativeStackNavigationProp, RouteProp } from "@react-navigation/native-stack";',
            'import { NativeStackNavigationProp } from "@react-navigation/native-stack";\nimport { RouteProp } from "@react-navigation/native";'
        )
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')