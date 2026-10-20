import glob
import os

for f in glob.glob('src/screens/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    has_nav = 'useNavigation' in content
    has_react_nav = 'ReactNavigation' in content
    has_import = 'from "@react-navigation/native"' in content
    print(f'{os.path.basename(f):30s} useNavigation={has_nav} ReactNavigation={has_react_nav} import={has_import}')