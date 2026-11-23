"""
Imports a public-domain chess book (an illustrated HTML edition transcribed by the Online
Distributed Proofreading Team, as archived at archive.org) into the app's book reader.
Only the book's own text is kept: the distributor's header, license and transcriber material
are left out.

Usage: python3 tools/import-book.py <path to NNNNN-h.zip> <book id>
Book ids: bluebook  (The Blue Book of Chess, 1910 revised edition, archive.org item thebluebookofche16377gut)
          morphy    (F. M. Edge, The Exploits and Triumphs, in Europe, of Paul Morphy, 1859,
                     archive.org item theexploitsandtr34180gut)
Writes books/<id>/text.json and books/<id>/img/.
"""
import sys, re, json, zipfile, html, subprocess, os

BOOKS = {
    'bluebook': {'start': '<h2>THE CHESS HANDBOOK.', 'end': ['End of the Project Gutenberg', 'End of Project Gutenberg']},
    'morphy': {'start': 'PAUL MORPHY.</h2>', 'start_back': '<h2', 'end': ['End of the Project Gutenberg', 'End of Project Gutenberg']},
}
zpath, book = sys.argv[1], sys.argv[2]
cfg = BOOKS[book]
z = zipfile.ZipFile(zpath)
htm = [n for n in z.namelist() if n.endswith(('.htm', '.html'))][0]
raw = z.read(htm).decode('utf-8') if b'charset=utf-8' in z.read(htm)[:3000].lower() else z.read(htm).decode('cp1252')
out = f'books/{book}'
os.makedirs(f'{out}/img', exist_ok=True)

i = raw.index(cfg['start'])
if cfg.get('start_back'):
    i = raw.rindex(cfg['start_back'], 0, i)
j = min([raw.index(e) for e in cfg['end'] if e in raw] + [len(raw)])
j = raw.rindex('<pre', i, j) if '<pre' in raw[i:j] else j
body = raw[i:j]

def clean(s):
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    s = re.sub(r'<div>\s*<span class="pagenum">.*?</span>\s*</div>', '', s, flags=re.S)
    s = re.sub(r'<span class="pagenum">.*?</span>', '', s, flags=re.S)
    def img(m):
        name = os.path.basename(m.group(1))
        base, ext = os.path.splitext(name)
        return f'<img src="books/{book}/img/{base}{".jpg" if ext.lower() in (".jpg", ".jpeg", ".png") else ext}" alt="" loading="lazy">'
    s = re.sub(r'<p[^>]*>\s*(<a [^>]*>\s*)?<img[^>]*pgn_go[^>]*>\s*(</a>\s*)?</p>', '', s, flags=re.S)  # transcriber's PGN links
    s = re.sub(r'<a [^>]*href="images/[^"]*"[^>]*>\s*(<img[^>]*>)\s*</a>', r'\1', s, flags=re.S)
    s = re.sub(r'<img[^>]*src="([^"]+)"[^>]*>', img, s)
    s = re.sub(r'<div class="figcenter"[^>]*>\s*(<img[^>]*>)\s*</div>', r'<figure>\1</figure>', s, flags=re.S)
    s = re.sub(r'<a name="[^"]*"[^>]*>\s*</a>', '', s)
    s = re.sub(r'<a [^>]*href="#Foot[^"]*"[^>]*>(\[[^\]]*\])</a>', r'<sup>\1</sup>', s)
    s = re.sub(r'<a [^>]*href="#[^"]*"[^>]*>(.*?)</a>', r'\1', s, flags=re.S)
    s = re.sub(r'<a [^>]*href="http[^"]*"[^>]*>(.*?)</a>', r'\1', s, flags=re.S)
    s = re.sub(r'\s(style|width|height|align|valign|border|cellpadding|cellspacing|summary|title|id|name)="[^"]*"', '', s)
    s = re.sub(r"\s(style|align|class)='[^']*'", '', s)
    s = re.sub(r'class="(?!boardno|boardcolor|sectionhead|center|chapcon)[^"]*"', '', s)
    s = re.sub(r'<hr[^>]*>|<br\s*/?>\s*(?=</h\d>)', '', s)
    s = re.sub(r'<div>\s*(<br\s*/?>\s*)*</div>|<p>\s*</p>', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# chapters start at "CHAPTER" headings (anything before the first one is the opening chapter)
pieces = re.split(r'(?=<h2[^>]*>\s*(?:<a [^>]*></a>\s*)?CHAPTER)', body)
chapters = []
for p in pieces:
    h = clean(p)
    if len(re.sub('<[^>]+>', '', h)) < 200:
        continue
    heads = [html.unescape(re.sub('<[^>]+>', '', x)).strip().rstrip('.') for x in re.findall(r'<h[23][^>]*>(.*?)</h[23]>', h)]
    title = heads[0].title() if heads else 'Chapter'
    sub = ''
    if title.upper().startswith('CHAPTER') and len(heads) > 1:
        sub = heads[1].title().replace("'S", "'s").replace(' Of ', ' of ').replace(' The ', ' the ').replace(' And ', ' and ').replace(' In ', ' in ').replace(' De La ', ' de la ')
    chapters.append({'title': re.sub(r'\bChapter ([ivxlc]+)\b', lambda m: 'Chapter ' + m.group(1).upper(), title, flags=re.I), 'sub': sub, 'html': h})
json.dump({'chapters': chapters, 'notes': ''}, open(f'{out}/text.json', 'w'), ensure_ascii=False)

used = set(re.findall(r'books/' + book + r'/img/([^"]+)', ' '.join(c['html'] for c in chapters)))
n = 0
for name in z.namelist():
    base = os.path.basename(name)
    if not base:
        continue
    stem, ext = os.path.splitext(base)
    target = stem + ('.jpg' if ext.lower() in ('.jpg', '.jpeg', '.png') else ext)
    if target not in used:
        continue
    if ext.lower() == '.gif':
        open(f'{out}/img/{target}', 'wb').write(z.read(name))
    else:
        subprocess.run(['convert', '-', '-resize', '420x>', '-strip', '-interlace', 'Plane', '-quality', '65', f'{out}/img/{target}'],
                       input=z.read(name), check=True)
    n += 1
print(book, len(chapters), 'chapters,', n, 'images')
