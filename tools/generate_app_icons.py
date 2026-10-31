"""Generate MG-6 icon assets from calculator.svg; requires Pillow >= 10.

Run: python tools/generate_app_icons.py
Check committed outputs without writing: python tools/generate_app_icons.py --check
No fonts, downloaded artwork, or application dependencies are required.
"""
from io import BytesIO
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / 'src/assets/brand'
RES = ROOT / 'android/app/src/main/res'
BACKGROUND = '#6543C3'
SCALE = 16
SIZE = 108 * SCALE
art = ET.parse(BRAND / 'calculator.svg').getroot()
foreground = Image.new('RGBA', (SIZE, SIZE))
draw = ImageDraw.Draw(foreground)
paths = []

for element in art:
    tag = element.tag.split('}')[-1]
    attributes = element.attrib
    number = lambda name, default=0: float(attributes.get(name, default))
    fill = attributes.get('fill')
    if tag == 'title':
        continue
    if tag == 'rect':
        x, y, w, h, r = [number(name) for name in ['x', 'y', 'width', 'height', 'rx']]
        draw.rounded_rectangle((x*SCALE, y*SCALE, (x+w)*SCALE, (y+h)*SCALE), radius=r*SCALE, fill=fill)
        data = f'M{x+r},{y} H{x+w-r} Q{x+w},{y} {x+w},{y+r} V{y+h-r} Q{x+w},{y+h} {x+w-r},{y+h} H{x+r} Q{x},{y+h} {x},{y+h-r} V{y+r} Q{x},{y} {x+r},{y} Z'
    elif tag == 'circle':
        x, y, r = [number(name) for name in ['cx', 'cy', 'r']]
        draw.ellipse(((x-r)*SCALE, (y-r)*SCALE, (x+r)*SCALE, (y+r)*SCALE), fill=fill)
        data = f'M{x-r},{y} A{r},{r} 0,1 0,{x+r},{y} A{r},{r} 0,1 0,{x-r},{y} Z'
    elif tag == 'polyline':
        points = [tuple(map(float, pair.split(','))) for pair in attributes['points'].split()]
        width = number('stroke-width')
        stroke = attributes['stroke']
        draw.line([(x*SCALE, y*SCALE) for x, y in points], fill=stroke, width=round(width*SCALE), joint='curve')
        for x, y in points:
            r = width / 2
            draw.ellipse(((x-r)*SCALE, (y-r)*SCALE, (x+r)*SCALE, (y+r)*SCALE), fill=stroke)
        data = 'M' + ' L'.join(f'{x},{y}' for x, y in points)
        paths.append(f'  <path android:pathData="{data}" android:strokeColor="{stroke}" android:strokeWidth="{width}" android:strokeLineCap="round" android:strokeLineJoin="round"/>')
        continue
    else:
        raise ValueError(f'Unsupported SVG shape: {tag}')
    paths.append(f'  <path android:pathData="{data}" android:fillColor="{fill}"/>')

# Adaptive foreground stays inside Android's central safe zone. Legacy icons
# enlarge the same artwork slightly since they do not have adaptive parallax.
legacy = Image.new('RGBA', (SIZE, SIZE), BACKGROUND)
enlarged = foreground.resize((round(SIZE * 1.15), round(SIZE * 1.15)), Image.Resampling.LANCZOS)
offset = (SIZE - enlarged.width) // 2
legacy.alpha_composite(enlarged, (offset, offset))

# A transparent cut-out mask, not a grayscale background: Android tints alpha
# for themed icons. Preserve the face and mathematical symbols as negative space.
mono = Image.new('RGBA', (SIZE, SIZE))
md = ImageDraw.Draw(mono)
md.rounded_rectangle((23*SCALE, 21*SCALE, 85*SCALE, 85*SCALE), radius=12*SCALE, fill='white')
md.rounded_rectangle((30*SCALE, 27*SCALE, 78*SCALE, 49*SCALE), radius=7*SCALE, fill=(0, 0, 0, 0))
for element in list(art)[4:]:
    tag = element.tag.split('}')[-1]
    attrs = element.attrib
    if tag == 'rect':
        continue
    ink = 'white' if float(attrs.get('cy', '99')) < 49 or (tag == 'polyline' and attrs['points'].startswith('47,40')) else (0, 0, 0, 0)
    if tag == 'circle':
        x, y, r = (float(attrs[key]) for key in ('cx', 'cy', 'r'))
        md.ellipse(((x-r)*SCALE, (y-r)*SCALE, (x+r)*SCALE, (y+r)*SCALE), fill=ink)
    elif tag == 'polyline':
        points = [tuple(float(n)*SCALE for n in pair.split(',')) for pair in attrs['points'].split()]
        md.line(points, fill=ink, width=round(float(attrs['stroke-width'])*SCALE), joint='curve')

outputs = {}
def safe_foreground(image):
    # Android's guaranteed safe region is a centered 66dp circle, not a square.
    inset = image.resize((round(SIZE * 0.8), round(SIZE * 0.8)), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', (SIZE, SIZE))
    result.alpha_composite(inset, ((SIZE - inset.width) // 2, (SIZE - inset.height) // 2))
    return result

def image_output(path, image, size, format='PNG'):
    buffer = BytesIO()
    image.resize((size, size), Image.Resampling.LANCZOS).save(buffer, format=format, **({'lossless': True} if format == 'WEBP' else {}))
    outputs[path] = buffer.getvalue()

image_output(BRAND / 'icon.png', legacy, 1024)
image_output(BRAND / 'adaptive-icon.png', safe_foreground(foreground), 1024)
image_output(BRAND / 'monochrome-icon.png', safe_foreground(mono), 1024)
image_output(RES / 'drawable-nodpi/ic_launcher_monochrome.png', safe_foreground(mono), 432)
vector = '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n  <group android:pivotX="54" android:pivotY="54" android:scaleX="0.8" android:scaleY="0.8">\n' + '\n'.join(paths) + '\n  </group>\n</vector>\n'
outputs[RES / 'drawable/ic_launcher_foreground.xml'] = vector.encode()

for density, size, splash_size in [('mdpi', 48, 288), ('hdpi', 72, 432), ('xhdpi', 96, 576), ('xxhdpi', 144, 864), ('xxxhdpi', 192, 1152)]:
    for name, circular in [('ic_launcher', False), ('ic_launcher_round', True)]:
        image = legacy.copy()
        mask = Image.new('L', (SIZE, SIZE))
        painter = ImageDraw.Draw(mask)
        if circular:
            painter.ellipse((0, 0, SIZE-1, SIZE-1), fill=255)
        else:
            painter.rounded_rectangle((0, 0, SIZE-1, SIZE-1), radius=SIZE*0.22, fill=255)
        image.putalpha(mask)
        image_output(RES / f'mipmap-{density}/{name}.webp', image, size, 'WEBP')
    image_output(RES / f'drawable-{density}/splashscreen_logo.png', foreground, splash_size)

check = '--check' in sys.argv
errors = []
for path, content in outputs.items():
    if check:
        actual = path.read_bytes() if path.exists() else None
        if actual is not None and path.suffix == '.xml':
            actual = actual.replace(b'\r\n', b'\n')
        if actual != content:
            errors.append(str(path.relative_to(ROOT)))
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
if errors:
    raise SystemExit('Icon outputs differ; regenerate:\n' + '\n'.join(errors))
print(f'{"Verified" if check else "Generated"} {len(outputs)} icon/splash resources.')
