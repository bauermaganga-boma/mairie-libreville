# Mairie de Libreville — portail municipal, e-Services et back-office

Proposition de site conçue par Rouana (version de démonstration).

## Pages publiques
- `index.html` : accueil (« Que voulez-vous faire ? », programme « 3A », mot du maire, e-Services, démarches, 6 arrondissements, back-office, projets, actualités, application installable)
- `mairie.html` : le maire Eugène Mba et ses 5 adjoints, organisation, Libreville en bref, outils numériques déjà lancés
- `arrondissements.html` : carte schématique cliquable des 6 arrondissements, « Dans quel arrondissement j'habite ? », maires et adjoints installés en novembre 2025, quartiers
- `demarches.html` : 15 démarches (état civil, mariage, vignette, marché, urbanisme, rendez-vous au guichet avec choix du créneau, signalement, audience), paiement Airtel Money / Moov Money / carte ou guichet, suivi, PDF, documents authentifiés
- `payer.html` : e-Services — payer une taxe (vignettes taxi / taxi-bus / marchandises, droits de place, domaine public, publicité), vignette PDF avec QR code, reçu PDF avec QR ; vérifier une vignette (saisie ou scan caméra) ; commerçants & transporteurs (e-Tax, MADIGIPAIE)
- `transparence.html` : budget 2026 (30,77 Md FCFA), dotations 70 → 230 M FCFA par arrondissement, priorités, documents officiels, chronologie
- `projets.html`, `actualites.html` (presse + avis + galerie créditée), `contact.html`

Mobile : barre d'onglets en bas (Accueil, Démarches, **Payer** au centre, Signaler, Suivi), bouton Retour, fenêtres plein écran. Le site s'installe comme une application (`manifest.webmanifest`, `sw.js`).

## Back-office (`espace.html` → `agents.html`)
| Profil | Identifiant / mot de passe (démo) | Modules |
|---|---|---|
| Cabinet du maire | `maire` / `lbv2026` | tout |
| Secrétariat général | `secretariat` / `admin2026` | tout + comptes |
| État civil | `etat.civil` / `agent2026` | demandes, rendez-vous, actes authentifiés, registre, stocks |
| Services techniques | `services.techniques` / `agent2026` | signalements, chantiers, stocks |
| Recettes & e-Tax | `recettes` / `agent2026` | recettes, **vignettes QR** (registre, contrôle terrain par scan), indicateurs |
| Ressources humaines | `rh` / `agent2026` | personnel (suites de l'audit RH) |
| Mairies d'arrondissement | `arr1` … `arr6` / `arr2026` | leurs dossiers, rendez-vous, recettes, dotation, classement parmi les 6 |

Démonstration : vignette `LBV-TX-0001` (plaque `GA 0001 LV`, valide) · dossier `LBV-26-01234` / `077 12 34 56` (document prêt) · acte `0312/2004` / Mengue (authentifié).

Données, personnes et montants de démonstration **fictifs** ; paiements **simulés**. Tarifs indicatifs à fixer par délibération. En production, les paiements se raccordent à la plateforme **e-Tax** (etax-libreville.ga) et à **MADIGIPAIE** plutôt que de les concurrencer.

## Base de données
- `assets/js/config.js` vide = mode démonstration (données dans le navigateur).
- Supabase : exécuter `supabase/install.sql`, puis renseigner l'URL et la clé publique dans `config.js`. Avant la mise en service : changer les mots de passe et passer `showDemo` à `false`.

## À confirmer avec la mairie
Adresse exacte, téléphones, e-mail, horaires de l'hôtel de ville ; liste officielle des quartiers par arrondissement ; délégations des adjoints ; grille des tarifs ; prestataire de la plateforme e-Tax ; page Facebook officielle ; photos officielles (photos d'actualité issues de la presse, photos de la ville sous licence CC BY-SA 4.0, auteurs crédités).

## Test
`node tests/e2e.js http://localhost:8091/` (puppeteer-core + Chrome ; variable `BROWSER` pour un autre navigateur).
