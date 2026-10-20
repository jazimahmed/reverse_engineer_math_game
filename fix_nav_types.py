import glob
import os

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'import { ReactNavigation }' in content:
        # Remove the ReactNavigation import
        content = content.replace('import { ReactNavigation } from "@react-navigation/native";\n', '')
        # Replace ReactNavigation.NavigationProp with proper import
        content = content.replace('ReactNavigation.NavigationProp', 'NativeStackNavigationProp')
        content = content.replace('ReactNavigation.RouteProp', 'RouteProp')
        # Add the necessary imports
        if 'from "@react-navigation/native-stack"' not in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'from "@react-navigation/native"' in line:
                    lines.insert(i + 1, 'import { NativeStackNavigationProp, RouteProp } from "@react-navigation/native-stack";')
                    break
            content = '\n'.join(lines)
        # Replace usage
        content = content.replace('useNavigation<ReactNavigation.NavigationProp<RootStackParamList>>()', 'useNavigation<NativeStackNavigationProp<RootStackParamList>>()')
        content = content.replace('useRoute<ReactNavigation.RouteProp<RootStackParamList,', 'useRoute<RouteProp<RootStackParamList,')
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')