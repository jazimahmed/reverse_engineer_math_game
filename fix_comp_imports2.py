import glob

for f in glob.glob('src/components/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    original = content
    content = content.replace('../../store/gameSessionStore', '../../store')
    content = content.replace('../../constants/colors', '../../constants')
    content = content.replace('../../constants/game', '../../constants')
    if content != original:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'Fixed {f}')