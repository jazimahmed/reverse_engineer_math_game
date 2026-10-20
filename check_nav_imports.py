import glob

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'NativeStackNavigationProp' in content and 'from "@react-navigation/native-stack"' not in content:
        print(f'{f}: missing import')

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'NativeStackNavigationProp' in content:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'NativeStackNavigationProp' in line or 'from "@react-navigation/native-stack"' in line:
                print(f'  {f}: Line {i}: {line.strip()}')