import glob

for f in glob.glob('src/components/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'from "../../store/gameSessionStore"' in content:
        content = content.replace('from "../../store/gameSessionStore"', 'from "../../store"')
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')

for f in glob.glob('src/components/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'from "../../constants/colors"' in content:
        content = content.replace('from "../../constants/colors"', 'from "../../constants"')
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed colors {f}')

for f in glob.glob('src/components/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    if 'from "../../constants/game"' in content:
        content = content.replace('from "../../constants/game"', 'from "../../constants"')
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed game {f}')