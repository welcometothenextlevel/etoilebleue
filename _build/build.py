#!/usr/bin/env python3
"""Builds index.html from template.html + the price list below.

Prices come from the salon's Salonkee page (salonkee.ch/salon/l-etoile-bleue),
read on 2026-10-08. Run:  python3 _build/build.py
"""
import html
import pathlib

V = '1'
ROOT = pathlib.Path(__file__).resolve().parent.parent
HERE = ROOT / '_build'

# (name, price, from_price)   price None = sur devis
CARTE = [
    ('laser', 'Épilation laser', 'Laser',
     'Une épilation durable, zone par zone. Prix par séance&nbsp;; le nombre de séances se discute au premier rendez-vous.', [
        ('Visage complet', 120, False),
        ('Lèvre supérieure', 66, False),
        ('Lèvre supérieure & menton', 100, False),
        ('Menton', 60, False),
        ('Aisselles', 90, True),
        ('Bras', 140, True),
        ('Ligne abdominale', 60, False),
        ('Ventre', 150, False),
        ('Bikini', 60, True),
        ('Fesses', 140, False),
        ('Jambes', 180, True),
        ('Mains', 60, False),
        ('Pieds', 60, False),
        ('Forfait demi-jambes + aisselles + bikini classique', 380, True),
    ]),
    ('visage', 'Soins du visage', 'Visage',
     'Du nettoyage de peau à la radiofréquence&nbsp;: des soins ciblés, choisis selon ce dont votre peau a besoin.', [
        ('Nettoyage de peau', 120, False),
        ('Soin à la vitamine C', 130, False),
        ('Soin au collagène', 140, False),
        ('Soin anti-rides', 140, False),
        ('Soin anti-âge', 140, False),
        ('Soin hydratant profond', 150, False),
        ('Microneedling', 150, False),
        ('Radiofréquence visage', 180, False),
        ('Drainage lymphatique du visage', 50, False),
        ('Soin visage homme', 140, False),
        ('Teinture de barbe', 80, False),
    ]),
    ('regard', 'Beauté du regard', 'Regard',
     'Rehaussement, teinture et extensions de cils, du plus naturel au volume russe.', [
        ('Rehaussement de cils (lash lift)', 100, False),
        ('Rehaussement de cils + teinture', 120, False),
        ('Extensions de cils · classique 1:1', 140, False),
        ('Extensions de cils · hybride', 160, False),
        ('Extensions de cils · volume russe', 180, False),
        ('Remplissage d’extensions', 80, False),
        ('Teinture de cils', 30, False),
        ('Dépose d’extensions', 30, False),
    ]),
    ('pigmentation', 'Maquillage permanent & micropigmentation', 'Maquillage permanent',
     'Sourcils, regard et lèvres redessinés par micropigmentation, avec retouche à 4–8 semaines puis chaque année.', [
        ('Microblading sourcils', 450, False),
        ('Powder brows', 450, False),
        ('Combo brows', 490, False),
        ('Eye-liner permanent', 390, False),
        ('Micropigmentation des lèvres (lip blush)', 490, False),
        ('Taches de rousseur', 250, False),
        ('Retouche 4–8 semaines', 150, False),
        ('Retouche annuelle', 250, False),
        ('Correction / éclaircissement', None, False),
        ('Micropigmentation capillaire (cuir chevelu)', None, False),
    ]),
    ('cire', 'Épilation à la cire & au fil', 'Cire & fil',
     'Pour les zones délicates ou entre deux séances de laser, à la cire ou au fil.', [
        ('Sourcils au fil', 35, False),
        ('Lèvre supérieure', 20, False),
        ('Sourcils + lèvre', 45, False),
        ('Visage complet au fil', 65, False),
        ('Aisselles', 40, False),
        ('Maillot', 50, True),
        ('Jambes', 60, True),
    ]),
    ('corps', 'Massages & corps', 'Massages',
     'Le temps d’une vraie pause&nbsp;: massage relaxant, à l’huile d’argan ou aux pierres chaudes.', [
        ('Massage du corps', 120, False),
        ('Massage à l’huile d’argan', 130, False),
        ('Massage bien-être', 150, False),
        ('Massage aux pierres chaudes', 95, False),
    ]),
    ('beaute', 'Maquillage & cheveux', 'Maquillage & cheveux',
     'Pour un événement, un mariage, ou simplement une envie&nbsp;: maquillage, coiffure, couleur et lissage.', [
        ('Maquillage jour / soirée', 100, False),
        ('Maquillage événement', 130, False),
        ('Maquillage mariée + essai', 220, False),
        ('Coiffure événement', 100, False),
        ('Tresses', 100, False),
        ('Tresses avec kanekalon', 180, False),
        ('Coloration', 120, False),
        ('Mèches', 180, False),
        ('Balayage', 250, False),
        ('Transformation couleur', None, False),
        ('Soin capillaire profond', 90, False),
        ('Botox capillaire', 180, False),
        ('Lissage', 250, False),
        ('Lissage brésilien', 300, False),
    ]),
]

# laser zones offered in the composer (taken from CARTE['laser'])
GALLERY = [
    ('laser-detail', 1400, 933, 'land', 'Épilation laser · bras', 'Séance d’épilation laser sur le bras'),
    ('simone-laser', 900, 1338, 'port', 'Simone et le laser de l’institut', 'Simone à côté de l’appareil d’épilation laser'),
    ('cabine-pierres', 1200, 923, 'land', 'La cabine, prête pour un massage aux pierres chaudes', 'Table de massage avec pierres chaudes, serviette roulée et huile'),
    ('soin-appareil', 900, 1352, 'port', 'Soin à l’appareil', 'Soin du corps réalisé à l’appareil par une esthéticienne'),
    ('laser-jambes', 900, 1401, 'port', 'Épilation laser · jambes', 'Épilation laser des jambes, lunettes de protection'),
    ('soin-corps', 1200, 800, 'land', 'Soin du corps', 'Soin du corps à l’appareil sur le bas du dos'),
    ('accueil', 900, 1359, 'port', 'L’accueil', 'L’accueil de l’institut, présentoir de maquillage et miroir doré'),
    ('laser-visage', 1286, 723, 'land', 'Épilation laser · visage', 'Épilation laser du visage, cliente allongée'),
    ('cabine-lys', 1200, 800, 'land', 'Une cabine de soins', 'Cabine de soins avec bouquet de lys et appareil'),
]
SMALL = {'laser-detail': 800, 'simone-laser': 520, 'cabine-pierres': 700, 'soin-appareil': 520,
         'laser-jambes': 520, 'soin-corps': 700, 'accueil': 520, 'laser-visage': 700, 'cabine-lys': 700}


def esc(s):
    return html.escape(s, quote=True)


def price_html(p, frm):
    if p is None:
        return '<span class="mi__price mi__price--q">Sur devis</span>'
    pre = '<small>dès</small> ' if frm else ''
    return f'<span class="mi__price">{pre}{p}.–</span>'


def soin_label(cat_short, name):
    return f'{cat_short} · {name}'


tabs, panels, options = [], [], []
for i, (key, title, short, intro, items) in enumerate(CARTE):
    sel = 'true' if i == 0 else 'false'
    tabs.append(f'          <button class="tab" type="button" role="tab" id="t-{key}" aria-controls="p-{key}" '
                f'aria-selected="{sel}" tabindex="{0 if i == 0 else -1}" data-tab="{key}">{esc(short)}</button>')
    priced = [p for _, p, _ in items if p]
    rng = f'de {min(priced)}.– à {max(priced)}.–' if priced else ''
    lis = []
    for name, p, frm in items:
        label = soin_label('Laser' if key == 'laser' else short, name)
        lis.append(
            f'            <li><button class="mi" type="button" data-soin="{esc(label)}">'
            f'<span class="mi__name">{esc(name)}</span><span class="mi__dots" aria-hidden="true"></span>'
            f'{price_html(p, frm)}<span class="mi__add" aria-hidden="true"><svg><use href="#i-plus"/></svg></span>'
            f'<span class="sr">, réserver ce soin</span></button></li>')
    hidden = '' if i == 0 else ' hidden'
    panels.append(
        f'        <div class="panel" role="tabpanel" id="p-{key}" aria-labelledby="t-{key}" data-panel="{key}"{hidden}>\n'
        f'          <div class="panel__intro">\n'
        f'            <span class="panel__num">{i + 1:02d}</span>\n'
        f'            <h3>{esc(title)}</h3>\n'
        f'            <p>{intro}</p>\n'
        f'            <p class="panel__meta">{len(items)} soins · {rng} CHF</p>\n'
        f'          </div>\n'
        f'          <ul class="mlist">\n' + '\n'.join(lis) + '\n          </ul>\n'
        f'        </div>')
    opts = '\n'.join(f'                  <option value="{esc(soin_label("Laser" if key == "laser" else short, n))}">'
                     f'{esc(n)}{" · dès " if f else " · "}{str(p) + ".–" if p else "sur devis"}</option>'
                     for n, p, f in items)
    options.append(f'                <optgroup label="{esc(title)}">\n{opts}\n                </optgroup>')

zones = []
for name, p, frm in CARTE[0][4]:
    cls = ' zone--pack' if name.startswith('Forfait') else ''
    label = 'Forfait 3 zones' if name.startswith('Forfait') else name
    sub = '<em>demi-jambes + aisselles + bikini</em>' if name.startswith('Forfait') else ''
    zones.append(
        f'          <button class="zone{cls}" type="button" aria-pressed="false" data-zone="{esc(name)}" data-price="{p}" data-from="{1 if frm else 0}">'
        f'<span class="zone__name">{esc(label)}{sub}</span><span class="zone__price">{"dès " if frm else ""}{p}.–</span>'
        f'<span class="zone__tick" aria-hidden="true"><svg><use href="#i-check"/></svg></span></button>')

gallery = []
for n, (name, w, h, shape, cap, alt) in enumerate(GALLERY, 1):
    sw = SMALL[name]
    sh = round(h * sw / w)
    gallery.append(
        f'        <figure class="shot shot--{shape}" data-shot data-full="assets/img/{name}-{w}.webp">\n'
        f'          <button class="shot__btn" type="button" aria-label="Agrandir la photo : {esc(cap)}">\n'
        f'            <span class="shot__img"><img src="assets/img/{name}-{sw}.webp" srcset="assets/img/{name}-{sw}.webp {sw}w, assets/img/{name}-{w}.webp {w}w" '
        f'sizes="(min-width: 1024px) 40vw, 78vw" width="{sw}" height="{sh}" alt="{esc(alt)}" loading="lazy"></span>\n'
        f'          </button>\n'
        f'          <figcaption><span>{n:02d}</span>{esc(cap)}</figcaption>\n'
        f'        </figure>')

out = (HERE / 'template.html').read_text()
out = out.replace('<!--SPRITE-->', (HERE / 'sprite.html').read_text().strip())
out = out.replace('<!--TABS-->', '\n'.join(tabs))
out = out.replace('<!--PANELS-->', '\n'.join(panels))
out = out.replace('<!--OPTIONS-->', '\n'.join(options))
out = out.replace('<!--ZONES-->', '\n'.join(zones))
out = out.replace('<!--GALLERY-->', '\n'.join(gallery))
out = out.replace('__V__', V)
(ROOT / 'index.html').write_text(out)
print('index.html', len(out) // 1024, 'KB')
