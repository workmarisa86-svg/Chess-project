"""
Imports Capablanca's "Chess Fundamentals" (1921 text, public domain) into the app's book reader.

Source: the illustrated HTML edition transcribed by the Online Distributed Proofreading Team,
as archived at archive.org (item chessfundamental33870gut, file 33870-h.zip).
The 1934 preface, the publisher's page and the distributor's header and license are left out:
only the 1921 text of the book is used.

Usage: python3 tools/import-fundamentals.py <path to 33870-h.zip>
Writes books/fundamentals/text.json (chapters as simple HTML) and books/fundamentals/img/*.jpg
(diagrams, resized). Run tools/convert-descriptive.js afterwards for the Part II games.
"""
import sys, re, json, zipfile, html, subprocess

src = zipfile.ZipFile(sys.argv[1])
raw = src.read('33870-h/33870-h.htm').decode('cp1252')
out_dir = 'books/fundamentals'

body = raw[raw.index('<h2>CHESS FUNDAMENTALS</h2>'):raw.index('<h3>Notes</h3>')]
notes = raw[raw.index('<h3>Notes</h3>'):]
notes = notes[:notes.index('</div>')]

# The contents page lists section titles; the body is split at PART / CHAPTER headings and games.
def clean(fragment):
    s = re.sub(r'<!--.*?-->', '', fragment, flags=re.S)
    s = re.sub(r'<span\s+class="pagenum">.*?</span>', '', s, flags=re.S)       # page numbers
    s = re.sub(r'<a href="images/(Fig\d+)\.jpg">\s*<img[^>]*>\s*</a>',
               lambda m: f'<img src="books/fundamentals/img/{m.group(1)}.jpg" alt="Diagram" loading="lazy">', s, flags=re.S)
    s = re.sub(r'<div class="figcenter"[^>]*>\s*(<img[^>]*>)\s*</div>', r'<figure>\1</figure>', s, flags=re.S)
    s = re.sub(r'<a name="[^"]*"></a>', '', s)
    s = re.sub(r'<a [^>]*href="#Nt[^>]*>(\[\d+\])</a>', r'<sup>\1</sup>', s)       # note markers
    s = re.sub(r'<a href="#page\d+">(\d+)</a>', r'\1', s)
    s = re.sub(r'\s(style|width|align|valign)="[^"]*"', '', s)
    s = re.sub(r'<td class="nspcsingle">\s*&nbsp;</td>', '', s)                     # empty first column of move tables
    s = re.sub(r'class="(?!cenhead|sc|nobctr)[^"]*"', '', s)
    s = re.sub(r'<p>\s*</p>|<p>\s*<br\s*/?>\s*</p>', '', s)
    s = re.sub(r'<hr[^>]*>', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

parts = re.split(r'(<h3>[^<]*</h3>)', body)
chapters, cur = [], None
part = ''
for piece in parts:
    m = re.match(r'<h3>([^<]*)</h3>', piece)
    if m:
        title = html.unescape(m.group(1)).strip()
        if title.startswith('PART'):
            part = title
            continue
        cur = {'part': part, 'title': title, 'html': ''}
        chapters.append(cur)
        continue
    if cur is None:
        if part == 'PART II' or 'GAME 1.' in piece:
            pass
        continue
    cur['html'] += piece

# Part II has no CHAPTER headings: its games become chapters of their own.
part2 = body[body.index('<h3>PART II</h3>') + len('<h3>PART II</h3>'):]
chapters = [c for c in chapters if c['part'] != 'PART II']
games = re.split(r'(?=<p class="cenhead">GAME \d+\.)', part2)
for g in games:
    m = re.match(r'<p class="cenhead">(GAME \d+\.[^<]*)</p>', g)
    if not m:
        continue
    chapters.append({'part': 'PART II', 'title': html.unescape(m.group(1)).strip(), 'html': g})

for c in chapters:
    h = clean(c['html'])
    # chapter subtitle (first centred heading) becomes the display name
    m = re.match(r'<p class="cenhead">(?:<span class="sc">)?(.*?)(?:</span>)?</p>', h)
    c['sub'] = html.unescape(re.sub('<[^>]+>', '', m.group(1))).strip() if m and c['part'] == 'PART I' else ''
    c['html'] = h

notes_html = clean(notes.replace('<h3>Notes</h3>', ''))

json.dump({'chapters': chapters, 'notes': notes_html}, open(f'{out_dir}/text.json', 'w'), ensure_ascii=False)

# Diagrams: grayscale, 300 px wide, small JPEGs (ImageMagick).
n = 0
for name in src.namelist():
    m = re.match(r'33870-h/images/(Fig\d+)\.jpg$', name)
    if not m:
        continue
    # ImageMagick: grayscale, 300 px wide, quality 60
    subprocess.run(['convert', 'jpg:-', '-colorspace', 'Gray', '-resize', '300x', '-strip', '-interlace', 'Plane',
                    '-quality', '60', f'{out_dir}/img/{m.group(1)}.jpg'], input=src.read(name), check=True)
    n += 1
print(len(chapters), 'chapters,', n, 'diagrams')
