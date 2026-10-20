import glob

for f in glob.glob('src/components/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    original = content
    content = content.replace('from "../../store/gameSessionStore"', 'from "../../store"')
    content = content.replace('from "../../constants/colors"', 'from "../../constants"')
    content = content.replace('from "../../constants/game"', 'from "../../constants"')
    if content != original:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')