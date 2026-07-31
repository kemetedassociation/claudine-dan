# Claudine Dan — Site officiel

Site statique (HTML/CSS/JS, sans build step — cohérent avec les autres
projets du dossier). GSAP, Lenis et SplitType chargés en CDN.

## Architecture

```
claudine-dan/
├── index.html              Univers 1 — portfolio immersif (scrollytelling)
├── boutique/
│   └── index.html          Univers 2 — boutique
├── css/
│   ├── tokens.css          Charte graphique : couleurs, typo, espacements, easing
│   ├── base.css            Reset, styles de base, accessibilité
│   ├── portfolio.css       Styles propres à l'Univers 1
│   └── boutique.css        Styles propres à l'Univers 2
├── js/
│   ├── main.js             Init Lenis, curseur, routing léger entre univers
│   ├── portfolio.js        Séquences GSAP/ScrollTrigger de l'Univers 1
│   └── boutique.js         Interactions de la boutique
├── assets/
│   ├── images/oeuvres/     Reproductions des toiles (source : archives artiste)
│   ├── images/portrait/    Portraits de Claudine Dan
│   └── fonts/              Fraunces + Space Grotesk (self-hosted, woff2)
└── README.md
```

## Charte graphique — résumé

- **Fond** : sable/papier (`--color-paper`), jamais blanc plat.
- **Texte** : noir encre chaud (`--color-ink`), jamais #000.
- **Accents rares** : ocre (terre, Ouidah), indigo (teinture, traversée),
  rouge terre cuite — utilisés avec parcimonie, jamais comme fond.
- **Typographie** : Fraunces (voix éditoriale/émotionnelle, citations,
  titres d'œuvres) + Space Grotesk (structure, nav, légendes — clin
  d'œil géométrique au passé de mathématicienne de l'artiste).
- **Espacement** : grille 8px, marges de section fluides (`clamp()`).
- **Mouvement** : trois easings nommés (organique, doux, tension) pour
  garder une cohérence de "texture" d'animation dans tout le site.
- **Scène nuit** (`[data-scene="nuit"]`) : inversion ponctuelle
  fond/texte pour les séquences d'intro/silence/transition — jamais un
  vrai dark mode système.

Détails complets dans `css/tokens.css`.

## Sources factuelles utilisées pour le contenu

- meetartconcept.com (biographie, œuvres, expositions)
- creations-dan.blogspot.com (titres d'œuvres, dimensions réelles)
- lumieresdafrique.com (parcours mathématiques → peinture, démarche,
  citations de l'artiste)

Voir le brief complet fourni par l'utilisateur pour la banque de titres
d'œuvres et le fil narratif de l'Univers 1.
