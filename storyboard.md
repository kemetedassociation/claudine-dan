# Storyboard — Univers 1 : Le Portfolio Immersif

Logique générale : **tension → révélation**, une scène = une émotion =
une œuvre (ou un motif) = un silence. Le texte est toujours minimal ;
les œuvres et le motif géométrique/fractal portent l'histoire.

Chaque scène est un `<section data-scene="...">` en pleine hauteur (ou
multiple de `100vh` pour les scènes à pin ScrollTrigger). Rythme donné
en "hauteur de scroll" (vh) — pas une durée en secondes, puisque tout
est piloté par la position de scroll (Lenis + ScrollTrigger).

---

### 00 — Silence
**Hauteur** : 100vh · **Scène** : nuit (noir, `data-scene="nuit"`)
**Émotion** : suspens, seuil.
**Contenu** : écran noir, un point de lumière minuscule au centre. Aucun
texte. Curseur personnalisé déjà actif (petit cercle).
**Animation** : rien ne bouge sauf une respiration lente du point
lumineux (scale 1 → 1.08, opacity pulse, `--dur-scene`). Indice de
scroll discret (trait vertical qui s'allonge) apparaît après 1.5s.
**Technique** : pas de ScrollTrigger ici, juste un `IntroLoop` GSAP au
chargement. Lenis désactivé tant que l'intro n'est pas "consommée" par
un premier scroll ou clic.

---

### 01 — Le nombre avant la couleur
**Hauteur** : 150vh (pin) · **Scène** : nuit
**Émotion** : rigueur, froideur maîtrisée — avant la couleur, il y a la
structure.
**Contenu** : une grille géométrique fine (lignes blanches sur noir :
axes de symétrie, cercle, triangle qui se subdivise en fractale simple
type triangle de Sierpiński) se dessine trait par trait. Aucun texte.
**Animation** : tracé SVG progressif (`stroke-dashoffset`) synchronisé
au scroll ; la figure se complexifie (subdivision fractale) à mesure
qu'on avance dans le pin.
**Pourquoi** : pose littéralement le "cerveau gauche" avant qu'il ne
cède la place — cf. brief, symétrie axiale/centrale, projection
orthogonale, fractales comme outils réels de construction de ses
toiles.

---

### 02 — Le visage
**Hauteur** : 100vh · **Scène** : nuit → transition vers jour
**Émotion** : rencontre, humanité.
**Contenu** : portrait de Claudine Dan, en noir et blanc désaturé,
apparaît en fondu depuis le noir (masque de révélation, pas un simple
fade — un balayage de lumière qui découvre le visage progressivement).
**Animation** : `clip-path` circulaire ou linéaire qui s'agrandit,
synchronisé au scroll ; léger parallax de la photo (mouvement plus lent
que le scroll, profondeur).
**Sortie de scène** : le fond vire du noir au sable (`--color-paper`)
dans les dernières 20% de la section — première apparition de la
couleur du site.

---

### 03 — La phrase fondatrice
**Hauteur** : 120vh · **Scène** : jour
**Émotion** : intention, mise en perspective.
**Contenu** (SplitType, caractère par caractère, une seule phrase,
citation directe adaptée du brief) :

> « Des mathématiques à la peinture — ma vision de l'art consiste à
> mettre sur la toile les problématiques de la libération de l'âme. »
> — Claudine Dan

**Animation** : chaque caractère apparaît avec un léger décalage
(`stagger`), opacity + translateY(0.3em), piloté par ScrollTrigger
`scrub`. Rien d'autre à l'écran — fond sable nu.

---

### 04 — Le basculement
**Hauteur** : 200vh (pin) · **Scène** : jour
**Émotion** : bascule, libération — le moment charnière du récit.
**Contenu** : la figure géométrique de la scène 01 réapparaît (fine,
noire, résiduelle), puis se déforme : les lignes se courbent, les
angles droits deviennent organiques, et à la fin de la section la
figure "explose" en une tache de couleur peinte (texture de pigment
réelle, extraite d'une toile — ex. un détail macro d' "Énergie" ou
"ADN").
**Animation** : morph SVG (ligne → courbe) piloté par scrub ; à ~80% du
pin, crossfade vers une texture picturale plein cadre avec un léger
`filter: blur` qui se résout net. Moment le plus "un seul gros effet"
de toute la scène 1 — à ne pas répéter ailleurs.
**Pourquoi** : rend visible, une seule fois et sans le nommer en toutes
lettres, le passage cerveau gauche → cerveau droit.

---

### 05 — Galerie flottante I
**Hauteur** : 250vh (pin, horizontal scroll interne) · **Scène** : jour
**Émotion** : légèreté, première respiration après la bascule.
**Contenu** : 4 à 5 toiles flottent à des profondeurs différentes
(mur infini léger) — *Fleurs du Paradis*, *Jardin d'Été*, *Rose*,
*Océan*. Pas de texte au-dessus des œuvres ; seul le titre apparaît en
petit label Space Grotesk au survol/à l'approche.
**Animation** : parallax multi-couches (les toiles proches bougent
plus vite que les lointaines), légère rotation 3D (`perspective` +
`rotateY` de quelques degrés) au passage du curseur.
**Technique** : GSAP `matchMedia` pour désactiver la profondeur 3D sur
mobile (remplacée par un simple stack vertical avec fade).

---

### 06 — Rapprochement matière
**Hauteur** : 180vh (pin) · **Scène** : jour
**Émotion** : intimité, matière, le geste de la peintre.
**Contenu** : une seule œuvre (ex. *La Ruada* ou *Grains de Folie*)
zoome progressivement jusqu'à ce que la texture du pigment remplisse
tout l'écran — le grain, les coups de brosse, le relief.
**Animation** : `scale` piloté par scrub (1 → 6-8x sur un détail macro
préparé à l'avance, pas un zoom CSS naïf sur l'image basse résolution —
prévoir un crop macro dédié), léger `mouse parallax` sur les 20 derniers
%.
**Note perf** : nécessite une image macro dédiée par œuvre choisie (pas
une simple mise à l'échelle) pour rester net — à anticiper dans les
assets.

---

### 07 — Citation courte (souffle)
**Hauteur** : 90vh · **Scène** : nuit (retour bref au silence)
**Émotion** : pause, respiration.
**Contenu** : fond nuit, une phrase très courte, centrée, petite taille
(pas de grand titre ici — contraste avec la scène 03) :

> « De la couleur naît la joie. »

**Animation** : simple fade + léger tracking qui se resserre
(`letter-spacing` large → normal). Aucune autre sollicitation.

---

### 08 — La Ruada (le corps comme pinceau)
**Hauteur** : 200vh (pin) · **Scène** : jour, énergie
**Émotion** : joie, rythme, célébration — rupture de tempo après le
calme de la scène 07.
**Contenu** : anecdote traitée visuellement — silhouette/trace de pas
de danse (ligne fine, style dessin au trait) qui "peint" en scrollant
la toile *La Ruada* elle-même : le tracé du pas dessine littéralement
les contours de la composition, puis la toile réelle apparaît en pleine
couleur.
**Texte** (court, en incrustation, Space Grotesk small-caps) : « Peinte
en dansant la salsa, à même la toile. »
**Animation** : tracé SVG en rythme (pas de scrub linéaire ici — easing
`--ease-tension`, plus syncopé), puis reveal de l'œuvre par un
`clip-path` qui suit la forme du tracé.

---

### 09 — Racines et mémoire
**Hauteur** : 160vh · **Scène** : nuit (traitement sobre, contrastant
fort avec la scène 08)
**Émotion** : gravité, recueillement — **jamais spectaculaire**.
**Contenu** : fond quasi noir, une seule œuvre de la veine
mémoire/racines (*Racines* ou *Grâce Divine*), très peu de lumière
dessus. Texte minimal, en plusieurs phrases courtes qui apparaissent
une à une avec un silence entre chaque (pas un bloc) :

> Sept navires ont porté ses toiles jusqu'à Ouidah.
>
> Près de la Porte du Non-Retour.
>
> Un geste pour la paix des âmes de ses aïeux.

**Animation** : fades lents uniquement (`--dur-slow` à `--dur-scene`),
aucun zoom, aucun parallax agressif, aucune musique/son ajouté sans
demande explicite. Le rythme ralentit délibérément par rapport au reste
du site (plus de vide entre les lignes).
**Règle stricte** : cette scène ne doit jamais être traitée comme un
"effet" — c'est la scène la plus sobre du site.

---

### 10 — Galerie horizontale — Afrique / Voyage
**Hauteur** : 300vh (pin, scroll horizontal type "mur infini")
**Scène** : jour · **Émotion** : ouverture, horizon, mouvement.
**Contenu** : défilement horizontal d'œuvres — *Savane*, *Rose des
Sables*, *L'Horizon*, *Univers Éthiopie*, *Le Désert*, *L'Aube dans le
Désert* — chaque toile occupe le plein écran en tour, avec son titre en
label discret en bas à gauche.
**Animation** : scroll vertical converti en translation horizontale
(`xPercent` piloté par scrub), vitesse légèrement différente entre
l'image et son label (parallax de profondeur).
**Sortie** : ralentissement progressif en fin de section (easing qui
s'adoucit) pour éviter une fin brutale du mur.

---

### 11 — Transmission
**Hauteur** : 140vh · **Scène** : jour, ton plus chaud/humain
**Émotion** : générosité, don, transmission.
**Contenu** : photo(s) d'atelier (enfants 6-12 ans ou seniors),
texte court sur les ateliers mobiles créatifs et l'art-thérapie.
Traitement volontairement moins "galerie", plus documentaire (bords
moins léchés, grain photo léger) pour marquer un contraste de registre.
**Animation** : reveal simple par bandes (`clip-path` en lattes qui
s'ouvrent), pas de 3D ni de parallax ici — cohérence avec le ton
documentaire.

---

### 12 — Épilogue — retour au silence
**Hauteur** : 130vh · **Scène** : nuit
**Émotion** : boucle bouclée, invitation.
**Contenu** : le point lumineux de la scène 00 réapparaît, seul. Une
dernière phrase, courte :

> « Entrez dans la galerie. »

... qui se transforme (morph de texte ou simple crossfade) en un lien
vers la Boutique — traité comme une porte qui s'ouvre (`clip-path`
vertical qui se sépare en deux, façon rideaux), jamais un bouton nu.
**Animation** : le point lumineux grandit et devient un halo doux
couleur ocre au moment du crossfade — seule fois du site où le point de
la scène 00 change de couleur (marque la fin du voyage).
**Sortie** : transition cinématographique (scène 09 du plan initial)
vers `/boutique/` avec un fondu qui masque le changement de page (voir
`js/main.js` — transition de route custom, pas un simple `<a>` nu).

---

## Récapitulatif rythme (hauteur cumulée indicative)

| # | Scène | vh | Registre |
|---|---|---|---|
| 00 | Silence | 100 | nuit |
| 01 | Le nombre avant la couleur | 150 | nuit |
| 02 | Le visage | 100 | transition |
| 03 | La phrase fondatrice | 120 | jour |
| 04 | Le basculement | 200 | jour |
| 05 | Galerie flottante I | 250 | jour |
| 06 | Rapprochement matière | 180 | jour |
| 07 | Citation courte | 90 | nuit |
| 08 | La Ruada | 200 | jour |
| 09 | Racines et mémoire | 160 | nuit — sobre |
| 10 | Galerie horizontale Afrique | 300 | jour |
| 11 | Transmission | 140 | jour |
| 12 | Épilogue | 130 | nuit → ocre |

Total ≈ 2120vh. Alternance nuit/jour délibérée : 00-01 (nuit) → 02
(bascule) → 03-06 (jour) → 07 (respiration nuit) → 08 (jour, énergie)
→ 09 (nuit, gravité) → 10-11 (jour) → 12 (nuit → ocre). Aucune scène
"jour" ne dépasse deux voisines sans une respiration nuit — le rythme
narratif reste un battement, pas une ligne plate.

## Notes techniques transverses

- **Un seul "gros effet" par scène maximum** — brief : parcimonie.
  Scène 04 est la plus chargée du site ; ne pas rivaliser ailleurs.
- **Assets requis avant la Phase 3** : portrait N&B (scène 02), crops
  macro dédiés par œuvre zoomée (scène 06), photos d'atelier (scène 11).
  À défaut de fichiers réels fournis, la Phase 3 utilisera des
  placeholders identifiés clairement comme tels (pas de stock photo
  générique).
- **Accessibilité** : chaque scène a une version `prefers-reduced-motion`
  qui remplace scrub/pin par un simple fade-in séquentiel (voir
  `--dur-*` déjà neutralisés dans `tokens.css`).
