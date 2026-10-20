import glob

for f in glob.glob('src/components/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    content = content.replace("from '../../constants'", "from '@constants/index'")
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(content)
    print(f'Fixed {f}')