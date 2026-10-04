/* Mairie de Libreville — couche de données.
   • Mode réel : base Supabase (PostgreSQL + authentification + temps réel), activé dès que
     assets/js/config.js contient l'URL et la clé publique du projet.
   • Mode démonstration : données enregistrées dans le navigateur (localStorage).
   Toutes les pages utilisent la même interface : un cache en mémoire (lecture synchrone)
   chargé par init(), et des méthodes asynchrones pour les écritures. */
const Store = (() => {
  const CFG = window.ESM_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const KEY = "lbv_db_v1", SKEY = "lbv_session";
  const EMAIL = login => String(login).trim().toLowerCase() + "@mairie-lbv.local";
  const COLS = ["authentifications","demandes","signalements","actes","vignettes","agenda","recettes","agents","stocks","chantiers","publications","contacts","journal"];

  /* ---------- Rôles et droits ---------- */
  const ROLES = {
    maire:{l:"Cabinet du maire", mods:"*"},
    sg:{l:"Secrétariat général", mods:"*"},
    etatcivil:{l:"État civil", mods:["tableau","authentifications","demandes","rendezvous","actes","stocks","journal","compte"]},
    technique:{l:"Services techniques", mods:["tableau","signalements","chantiers","stocks","compte"]},
    finances:{l:"Recettes & e-Tax", mods:["tableau","indicateurs","recettes","vignettes","chantiers","stocks","compte"]},
    rh:{l:"Ressources humaines", mods:["tableau","agents","compte"]},
    arrondissement:{l:"Mairie d'arrondissement", mods:["tableau","indicateurs","authentifications","demandes","rendezvous","signalements","actes","agenda","recettes","chantiers","stocks","publications","contacts","compte"]},
  };
  const STATUTS = {
    demandes:["Nouvelle","En traitement","Pièce manquante","Prête","Remise","Rejetée"],
    signalements:["Nouveau","Pris en charge","En intervention","Résolu"],
    chantiers:["À l'étude","Programmé","En cours","Réalisé","Suspendu"],
  };
  const NATURES = ["Vignettes de transport","Droits de place (marchés)","Occupation du domaine public","Frais d'actes d'état civil","Permis de construire","Taxe sur la publicité","Location de salles"];
  const MODES = ["Espèces","Airtel Money","Moov Money","Carte bancaire","Virement"];
  const ONLINE_RE = /Airtel|Moov|Carte/;
  const natureDe = typeId => ({permis:"Permis de construire", domaine:"Occupation du domaine public", place:"Droits de place (marchés)", vignette:"Vignettes de transport"})[typeId] || "Frais d'actes d'état civil";
  const telKey = t => String(t || "").replace(/\D/g, "").slice(-6);
  const normPlaque = s => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const trPrefix = mode => ({"Airtel Money":"AM","Moov Money":"MM"})[mode] || "CB";

  let db = {users:[]}; COLS.forEach(c => db[c] = []);
  let me = null, sb = null, readyP = null;

  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = () => new Date().toISOString();
  const quittanceNo = () => "Q-" + String(new Date().getFullYear()).slice(2) + "-" + String(Date.now()).slice(-6);

  /* =========================================================
     DONNÉES DE DÉMONSTRATION (personnes et chiffres fictifs)
     ========================================================= */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seed() {
    const r = rng(2026), pick = a => a[Math.floor(r() * a.length)], ago = d => new Date(Date.now() - d * 864e5).toISOString();
    const P = "Jean-Pierre Marie-Claire Ghislain Prisca Arsène Nadège Rodrigue Sylvie Landry Murielle Fabrice Christelle Hervé Laetitia Yannick Gisèle Brice Carine Ulrich Stessy Davy Ornella Serge Pélagie Cédric Merveille Junior Félicité Loïc Bertrande".split(" ");
    const N = "Moussavou Nzé Ondo Mba Obiang Ndong Mabika Boussougou Koumba Mouele Ella Oyane Mapangou Bivigou Engone Ntoutoume Mengue Assoumou Makaya Ekomi Ibinga Nkoghe Ango Mboumba Ogoula Rapontchombo Ndjave Okoumba Nguema Essono".split(" ");
    const Q = {}; ARRONDISSEMENTS.forEach(a => Q[a.n] = a.reperes.map(q => q.replace(/ \(.*\)$/, "")));
    // Profil d'activité par arrondissement (indicateurs contrastés mais réalistes)
    const W = {1:.95, 2:1.3, 3:1.1, 4:1.05, 5:.8, 6:1.2}, SPEED = {1:1.0, 2:.85, 3:1.1, 4:.95, 5:1.35, 6:1.15}, ONLINE = {1:.5, 2:.68, 3:.55, 4:.5, 5:.38, 6:.45};
    const WT = ARR_N.map(a => W[a]), WS = WT.reduce((s, x) => s + x, 0);
    const arrPick = () => { let t = r() * WS; for (let i = 0; i < ARR_N.length; i++) { t -= WT[i]; if (t <= 0) return ARR_N[i]; } return ARR_N[ARR_N.length - 1]; };
    const person = () => ({prenom:pick(P), nom:pick(N)});
    const tel = () => "0" + pick(["74","77","76","62","65","66"]) + " " + String(Math.floor(r()*90+10)) + " " + String(Math.floor(r()*90+10)) + " " + String(Math.floor(r()*90+10));
    const ord = a => a + (a === 1 ? "er" : "e");
    const DIGIT = 114; // lancement du paiement électronique à Mont-Bouët (12 juin 2026) : la part payée en ligne grimpe ensuite
    const mobile = () => pick(["Airtel Money","Airtel Money","Moov Money"]);

    const users = [
      {id:"u1", role:"maire", arr:0, login:"maire", pwd:"lbv2026", prenom:"Cabinet", nom:"du Maire", titre:"Cabinet du maire"},
      {id:"u2", role:"sg", arr:0, login:"secretariat", pwd:"admin2026", prenom:"Secrétariat", nom:"Général", titre:"Administrateur"},
      {id:"u3", role:"etatcivil", arr:0, login:"etat.civil", pwd:"agent2026", prenom:"Gisèle", nom:"Ondo", titre:"Chef du service central de l'état civil"},
      {id:"u4", role:"technique", arr:0, login:"services.techniques", pwd:"agent2026", prenom:"Rodrigue", nom:"Mabika", titre:"Directeur des services techniques"},
      {id:"u5", role:"finances", arr:0, login:"recettes", pwd:"agent2026", prenom:"Carine", nom:"Boussougou", titre:"Directrice des recettes municipales"},
      {id:"u6", role:"rh", arr:0, login:"rh", pwd:"agent2026", prenom:"Hervé", nom:"Koumba", titre:"Responsable des ressources humaines"},
    ];
    ARR_N.forEach(a => users.push({id:"ua" + a, role:"arrondissement", arr:a, login:"arr" + a, pwd:"arr2026", prenom:"Mairie", nom:"du " + ord(a) + " arrondissement", titre:"Mairie du " + ord(a) + " arrondissement"}));

    const recettes = [];
    let qn = 4800;
    const addRec = (nature, arr, montant, payeur, mode, date, agent, extra) => { const q = "Q-26-" + String(++qn).padStart(6, "0"); recettes.push({id:"r" + qn, quittance:q, nature, arr, montant, payeur, mode, agent:agent || "Guichet central", date, ...(extra || {})}); return q; };

    // Registre des documents authentifiés (original vérifié une fois au guichet)
    const authentifications = [];
    const mkAuth = (o) => { const a = {id:"au" + authentifications.length, historique:[], ...o}; a.num = normNum(a.numAff); authentifications.push(a); return a; };
    mkAuth({numAff:"0312/2004", type:"naissance", nom:"Mengue", prenoms:"Prisca", naissance:"2004-03-12", lieu:"Libreville", arr:2, tel:"077 12 34 56", statut:"Authentifié", source:"guichet", date:ago(40), authDate:ago(40), agent:"Gisèle Ondo",
      historique:[{date:ago(40), t:"Original présenté au guichet de la mairie du 2e arrondissement et vérifié dans le registre 2004, volume 3."}]});
    mkAuth({numAff:"1187/1998", type:"naissance", nom:"Ogoula", prenoms:"Landry", naissance:"1998-07-21", lieu:"Libreville", arr:6, tel:"074 55 66 77", statut:"En attente", source:"en ligne", date:ago(1), authDate:null, agent:"",
      historique:[{date:ago(1), t:"Numéro déclaré en ligne lors de la demande LBV-26-01235 : l'original doit être présenté une fois au guichet."}]});
    for (let i = 0; i < 60; i++) {
      const p = person(), arr = arrPick(), y = 1965 + Math.floor(r() * 45), ty = r() < .78 ? "naissance" : r() < .6 ? "mariage" : pick(["diplome","residence","deces"]);
      const st = r() < .8 ? "Authentifié" : r() < .75 ? "En attente" : "Rejeté", d0 = ago(5 + r() * 170);
      mkAuth({numAff:String(Math.floor(r() * 2400) + 1).padStart(4, "0") + "/" + (ty === "diplome" ? "BAC" + y : y), type:ty, nom:p.nom, prenoms:p.prenom, naissance:y + "-" + String(1 + Math.floor(r() * 12)).padStart(2, "0") + "-" + String(1 + Math.floor(r() * 28)).padStart(2, "0"), lieu:pick(["Libreville","Libreville","Libreville","Owendo","Lambaréné","Oyem","Franceville"]), arr, tel:tel(), statut:st, source:r() < .5 ? "guichet" : "en ligne", date:d0, authDate:st === "En attente" ? null : d0, agent:st === "En attente" ? "" : pick(["Gisèle Ondo","Agent d'état civil – " + ord(arr) + " arr."]),
        historique:[{date:d0, t:st === "Authentifié" ? "Original présenté et vérifié au guichet." : st === "Rejeté" ? "Document présenté non conforme au registre (surcharge)." : "Numéro déclaré en ligne : en attente de présentation de l'original."}]});
    }
    const authOk = authentifications.filter(a => a.statut === "Authentifié" && a.type === "naissance");

    // Demandes (6 mois)
    const demandes = [], types = DEMARCHES.filter(d => !d.signal && !d.rdv);
    for (let i = 0; i < 210; i++) {
      const t = pick(types), p = person(), arr = arrPick(), age = Math.pow(r(), 0.85) * 180, sp = SPEED[arr];
      let k = age > 25 ? (r() < .78 ? 4 : r() < .5 ? 5 : 3) : age > 8 ? Math.floor(r() * 5) : (r() < .55 ? 0 : 1);
      if (!t.doc && k === 3 && age > 25) k = 4;
      const st = STATUTS.demandes[k], d0 = ago(age);
      const hist = [{date:d0, statut:"Nouvelle", note:"Demande reçue " + (r() < .7 ? "en ligne" : "au guichet") + ".", pub:true}];
      const step = x => ago(Math.max(0, age - x * sp));
      if (k >= 1) hist.push({date:step(.6 + r()), statut:"En traitement", note:"Dossier pris en charge par le service " + t.service + ".", pub:true});
      if (k === 2) hist.push({date:step(2), statut:"Pièce manquante", note:"Merci de fournir une copie lisible de votre pièce d'identité.", pub:true});
      let ready = null;
      if (k >= 3 && k !== 5) { ready = step(2 + r() * 5); hist.push({date:ready, statut:"Prête", note:t.doc ? "Votre document est prêt : téléchargez-le en ligne ou retirez-le au guichet." : "Votre dossier est prêt : présentez-vous au guichet avec votre pièce d'identité.", pub:true}); }
      if (k === 4) hist.push({date:step(4 + r() * 6), statut:"Remise", note:t.doc ? "Document téléchargé / remis au demandeur." : "Dossier remis au demandeur.", pub:true});
      if (k === 5) hist.push({date:step(3 + r() * 3), statut:"Rejetée", note:"Acte introuvable dans les registres de la commune : rapprochez-vous du lieu d'enregistrement.", pub:true});
      const ref = "LBV-26-" + String(1000 + i).padStart(5, "0"), montant = t.prix || 0;
      let paiement = {statut:"Gratuit"};
      if (montant) {
        const online = r() < ONLINE[arr] + (age < DIGIT ? .2 : -.1);
        if (online && k !== 5) { const mode = r() < .7 ? mobile() : "Carte bancaire", pd = ago(Math.max(0, age - .02)); paiement = {choix:"en ligne", statut:"Payé", mode, date:pd, quittance:addRec(natureDe(t.id), arr, montant, p.prenom + " " + p.nom, mode, pd, "Paiement en ligne"), transaction:({"Airtel Money":"AM","Moov Money":"MM"}[mode] || "CB") + Math.floor(r() * 1e9)}; hist.push({date:pd, statut:hist[hist.length - 1].statut, note:`Paiement reçu (${mode}) : ${fcfa(montant)}.`, pub:true}); }
        else if (k === 4) { const pd = hist[hist.length - 1].date, mode = pick(["Espèces","Espèces","Airtel Money","Carte bancaire"]); paiement = {choix:"guichet", statut:"Payé", mode, date:pd, quittance:addRec(natureDe(t.id), arr, montant, p.prenom + " " + p.nom, mode, pd, "Guichet")}; }
        else paiement = {choix:"guichet", statut:"À régler"};
      }
      let acte = null;
      if (t.acte && r() < .85) { const au = r() < .75 ? pick(authOk) : pick(authentifications); acte = {num:au.num, numAff:au.numAff, type:au.type, nom:au.nom, statut:au.statut, authDate:au.authDate}; Object.assign(p, {prenom:au.prenoms, nom:au.nom}); }
      demandes.push({id:"d" + i, ref, acte, type:t.id, typeLabel:t.t, service:t.service, arr, ...p, tel:tel(), email:"", quartier:pick(Q[arr]), details:t.id === "audience" ? "Présentation d'un projet associatif de quartier." : "", statut:st, date:d0, montant, paiement, pj:[], document:ready && t.doc ? {type:"auto", date:ready} : null, historique:hist.sort((a, b) => a.date.localeCompare(b.date))});
    }
    // Rendez-vous au guichet (à venir)
    for (let i = 0; i < 14; i++) {
      const p = person(), arr = arrPick(), j = 1 + Math.floor(r() * 6), d0 = ago(r() * 3);
      const jour = new Date(Date.now() + j * 864e5); if (jour.getDay() === 0) jour.setDate(jour.getDate() + 1); if (jour.getDay() === 6) jour.setDate(jour.getDate() + 2);
      demandes.push({id:"rv" + i, ref:"LBV-26-" + String(1300 + i).padStart(5, "0"), acte:null, type:"rdv", typeLabel:"Rendez-vous au guichet", service:"Accueil", arr, ...p, tel:tel(), email:"", quartier:pick(Q[arr]), details:pick(["Retrait d'un acte de naissance","Dépôt d'un dossier de mariage","Légalisation de documents","Déclaration de naissance"]),
        rdv:{jour:jour.toISOString().slice(0, 10), heure:pick(CRENEAUX)}, statut:"Nouvelle", date:d0, montant:0, paiement:{statut:"Gratuit"}, pj:[], document:null, historique:[{date:d0, statut:"Nouvelle", note:"Rendez-vous réservé en ligne.", pub:true}]});
    }
    demandes.push({id:"dx", ref:"LBV-26-01234", acte:{num:"0312/2004", numAff:"0312/2004", type:"naissance", nom:"Mengue", statut:"Authentifié", authDate:ago(40)}, type:"naissance", typeLabel:"Copie ou extrait d'acte de naissance", service:"État civil", arr:2, prenom:"Prisca", nom:"Mengue", tel:"077 12 34 56", email:"", quartier:"Nkembo", details:"Copie intégrale pour dossier de passeport.", statut:"Prête", date:ago(3), montant:2000,
      paiement:{choix:"en ligne", statut:"Payé", mode:"Airtel Money", date:ago(2.98), quittance:addRec("Frais d'actes d'état civil", 2, 2000, "Prisca Mengue", "Airtel Money", ago(2.98), "Paiement en ligne"), transaction:"AM482913077"}, pj:[], document:{type:"auto", date:ago(1)},
      historique:[{date:ago(3), statut:"Nouvelle", note:"Demande reçue en ligne.", pub:true},{date:ago(2.98), statut:"Nouvelle", note:"Paiement reçu (Airtel Money) : 2 000 FCFA.", pub:true},{date:ago(2), statut:"En traitement", note:"Dossier pris en charge par le service État civil.", pub:true},{date:ago(1.6), statut:"En traitement", note:"Acte retrouvé dans le registre 2004, volume 3.", pub:false},{date:ago(1), statut:"Prête", note:"Votre document est prêt : téléchargez-le en ligne ou retirez-le au guichet.", pub:true}]});
    demandes.push({id:"dy", ref:"LBV-26-01235", acte:{num:"1187/1998", numAff:"1187/1998", type:"naissance", nom:"Ogoula", statut:"En attente", authDate:null}, type:"residence", typeLabel:"Certificat de résidence", service:"État civil", arr:6, prenom:"Landry", nom:"Ogoula", tel:"074 55 66 77", email:"", quartier:"Nzeng-Ayong", details:"", statut:"En traitement", date:ago(1), montant:2000, paiement:{choix:"guichet", statut:"À régler"}, pj:[], document:null,
      historique:[{date:ago(1), statut:"Nouvelle", note:"Demande reçue en ligne. Paiement prévu au guichet. Acte de naissance n° 1187/1998 non encore authentifié : présentez l'original une seule fois au guichet.", pub:true},{date:ago(.5), statut:"En traitement", note:"Dossier pris en charge par le service État civil.", pub:true}]});

    // Signalements (5 mois)
    const signalements = [], STS = STATUTS.signalements;
    const DESC = {ordures:"Dépôt sauvage d'ordures qui grossit depuis plusieurs jours, les odeurs deviennent insupportables.", caniveau:"Le caniveau est bouché par les déchets, l'eau envahit la route à chaque pluie.", eclairage:"Plusieurs lampadaires éteints, la rue est dans le noir la nuit.", voirie:"Nid-de-poule profond qui oblige les taxis à monter sur le trottoir.", eau:"La borne-fontaine du quartier ne donne plus d'eau depuis une semaine.", anarchique:"Étals installés sur la chaussée, la circulation est bloquée aux heures de pointe.", autre:"Arbre tombé qui bloque une partie de la voie."};
    for (let i = 0; i < 110; i++) {
      const [ty, lbl] = pick(TYPES_SIGNAL), arr = arrPick(), age = r() * 150, sp = SPEED[arr];
      const k = age > 20 * sp ? (r() < .85 ? 3 : 2) : Math.floor(r() * 4), p = person(), d0 = ago(age);
      const hist = [{date:d0, statut:"Nouveau", note:"Signalement reçu.", pub:true}];
      if (k) hist.push({date:ago(Math.max(0, age - .5 * sp)), statut:"Pris en charge", note:"Équipe des services techniques informée.", pub:true});
      if (k === 3) hist.push({date:ago(Math.max(0, age - (2 + r() * 8) * sp)), statut:"Résolu", note:"Intervention terminée.", pub:true});
      signalements.push({id:"s" + i, ref:"SIG-26-" + String(300 + i).padStart(4, "0"), type:ty, typeLabel:lbl, arr, quartier:pick(Q[arr]), lieu:pick(["Près du marché","Carrefour principal","Derrière l'école","Le long du caniveau","Face à la pharmacie","Entrée du quartier","Arrêt de taxis"]), description:DESC[ty], ...p, tel:tel(), priorite:ty === "caniveau" || ty === "eau" ? "Haute" : pick(["Normale","Normale","Haute"]), statut:STS[k], date:d0, historique:hist});
    }

    // Registre d'état civil
    const actes = [];
    for (let i = 0; i < 110; i++) {
      const ty = r() < .62 ? "naissance" : r() < .55 ? "mariage" : "deces", arr = arrPick(), age = r() * 175, p = person();
      const a = {id:"a" + i, type:ty, arr, num:"", nom:p.nom, prenoms:p.prenom, sexe:pick(["M","F"]), dateEvt:ago(age + 2).slice(0, 10), lieu:"Libreville", officier:"Officier d'état civil — " + ord(arr) + " arrondissement", date:ago(age)};
      if (ty === "naissance") { a.pere = pick(P) + " " + p.nom; a.mere = pick(P) + " " + pick(N); a.lieu = pick(["CHU de Libreville","Maternité Joséphine Bongo","Centre de santé de Nzeng-Ayong","Domicile"]); }
      if (ty === "mariage") { const q = person(); a.conjoint = q.prenom + " " + q.nom; a.regime = pick(["Monogamie","Monogamie","Polygamie"]); }
      if (ty === "deces") a.lieu = pick(["CHU de Libreville","Domicile"]);
      actes.push(a);
    }
    actes.sort((x, y) => x.date.localeCompare(y.date)).forEach((a, i) => a.num = {naissance:"N", mariage:"M", deces:"D"}[a.type] + "-2026-" + String(i + 101).padStart(5, "0"));

    // Vignettes de transport à QR code (lancées le 28 mai 2026)
    const vignettes = [], VIGQ = {TX:0, TB:0, TM:0};
    const plaque = () => "GA " + String(1000 + Math.floor(r() * 8999)) + " " + "ABCDEFGHJKLMNPRSTUVWXYZ"[Math.floor(r() * 23)] + "ABCDEFGHJKLMNPRSTUVWXYZ"[Math.floor(r() * 23)];
    const mkVig = (cat, o) => { const n = ++VIGQ[cat]; const v = {id:"v" + vignettes.length, num:"LBV-" + cat + "-" + String(n).padStart(4, "0"), cat, statut:"Active", controles:[], arr:0, ...o}; vignettes.push(v); return v; };
    const v1 = mkVig("TX", {plaque:"GA 0001 LV", proprio:"Jean-Pierre Nguema", tel:"077 00 00 01", debut:"2026-05-28", fin:"2027-05-27", date:"2026-05-28T10:00:00.000Z"});
    v1.controles.push({date:ago(6), agent:"Brigade de contrôle – 2e arr.", lieu:"Carrefour Mont-Bouët", res:"Valide"});
    for (let i = 0; i < 170; i++) {
      const cat = r() < .72 ? "TX" : r() < .7 ? "TB" : "TM", p = person(), age = r() < .85 ? r() * 128 : 300 + r() * 160;
      const deb = new Date(Date.now() - age * 864e5), fin = new Date(deb); fin.setFullYear(fin.getFullYear() + 1); fin.setDate(fin.getDate() - 1);
      const v = mkVig(cat, {plaque:plaque(), proprio:p.prenom + " " + p.nom, tel:tel(), debut:deb.toISOString().slice(0, 10), fin:fin.toISOString().slice(0, 10), date:deb.toISOString(), statut:r() < .03 ? "Suspendue" : "Active"});
      const prix = TAXES.find(t => t.cat === cat).prix, mode = age < 128 ? (r() < .75 ? mobile() : "Espèces") : "Espèces";
      v.quittance = addRec("Vignettes de transport", 0, prix, p.prenom + " " + p.nom + " · " + v.plaque, mode, deb.toISOString(), mode === "Espèces" ? "Guichet des transports" : "Paiement en ligne", {refTaxe:v.num});
      for (let c = 0; c < Math.floor(r() * 3); c++) v.controles.push({date:ago(Math.min(age, r() * age)), agent:"Brigade de contrôle – " + ord(arrPick()) + " arr.", lieu:pick(["Rond-point de la Démocratie","Carrefour Nkembo","Gare routière","PK8","Carrefour Rio","Akébé-Ville"]), res:"Valide"});
    }

    // Autres recettes (6 mois) : marchés, domaine public, publicité, permis…
    const RANGE = {"Droits de place (marchés)":[500,15000],"Occupation du domaine public":[15000,250000],"Permis de construire":[150000,1500000],"Taxe sur la publicité":[50000,800000],"Location de salles":[50000,300000]};
    for (let i = 0; i < 300; i++) {
      const nat = r() < .45 ? "Droits de place (marchés)" : pick(Object.keys(RANGE)), arr = nat === "Droits de place (marchés)" && r() < .45 ? 2 : arrPick(), age = r() * 182, p = person(), b = RANGE[nat];
      const growth = 0.75 + (182 - age) / 182 * 0.5; // recettes en hausse depuis la digitalisation
      const online = r() < (age < DIGIT ? .5 + (arr === 2 ? .4 : 0) : .14 + (arr === 2 ? .1 : 0));
      addRec(nat, arr, Math.round((b[0] + r() * (b[1] - b[0])) * growth * W[arr] / 500) * 500 || 500, nat === "Droits de place (marchés)" ? "Commerçant · " + p.nom + (arr === 2 ? " · Mont-Bouët" : "") : p.prenom + " " + p.nom, online ? (r() < .8 ? mobile() : "Carte bancaire") : pick(["Espèces","Espèces","Virement"]), ago(age), online ? "Paiement en ligne (e-Tax)" : pick(["Agent de recouvrement 1","Agent de recouvrement 2","Guichet central"]));
    }

    // Personnel (échantillon) — suites de l'audit RH
    const SERV = [["État civil","Agent d'état civil"],["Services techniques","Agent de voirie"],["Services techniques","Chef d'équipe propreté"],["Recettes municipales","Agent de recouvrement"],["Recettes municipales","Contrôleur des vignettes"],["Secrétariat général","Secrétaire"],["Police municipale","Agent de police municipale"],["Marchés & domaine public","Placier"],["Ressources humaines","Gestionnaire RH"],["Hygiène & salubrité","Agent d'hygiène"]];
    const agents = [];
    for (let i = 0; i < 72; i++) {
      const [service, poste] = pick(SERV), p = person(), pieces = {};
      ["Acte de naissance","Pièce d'identité","Diplôme","Contrat / arrêté","RIB","Photo"].forEach(x => pieces[x] = r() < .74);
      agents.push({id:"g" + i, matricule:"LBV-" + String(2040 + i * 7).padStart(5, "0"), ...p, service, poste, arr:r() < .4 ? 0 : 1 + (i % 6), categorie:pick(["A","B","B","C","C","C"]), entree:String(1994 + Math.floor(r() * 32)), statut:r() < .93 ? "Actif" : pick(["En congé","Retraité"]), pieces});
    }

    // Stocks (mairie centrale + chaque arrondissement)
    const stocks = [
      {id:"k1", article:"Papier sécurisé pour actes d'état civil", unite:"rame", qte:7, seuil:12, service:"État civil", arr:0},
      {id:"k2", article:"Registres d'état civil (naissances)", unite:"registre", qte:18, seuil:6, service:"État civil", arr:0},
      {id:"k3", article:"Cartouches d'encre imprimantes", unite:"cartouche", qte:11, seuil:8, service:"État civil", arr:0},
      {id:"k4", article:"Vignettes QR vierges (planches de 50)", unite:"planche", qte:9, seuil:6, service:"Recettes municipales", arr:0},
      {id:"k5", article:"Sacs poubelles grande contenance", unite:"carton", qte:42, seuil:20, service:"Services techniques", arr:0},
      {id:"k6", article:"Gants et bottes de curage", unite:"paire", qte:18, seuil:25, service:"Services techniques", arr:0},
      {id:"k7", article:"Lampes d'éclairage public LED", unite:"lampe", qte:64, seuil:30, service:"Services techniques", arr:0},
      {id:"k8", article:"Carnets de quittances", unite:"carnet", qte:22, seuil:10, service:"Recettes municipales", arr:0},
    ];
    [[1,8],[2,12],[3,6],[4,9],[5,4],[6,10]].forEach(([a, q]) => stocks.push({id:"kp" + a, article:"Papier sécurisé pour actes d'état civil", unite:"rame", qte:q, seuil:5, service:"État civil", arr:a}));
    stocks.forEach(s => s.hist = [{date:ago(20), delta:s.qte + 12, motif:"Inventaire initial", by:"Magasin"}, {date:ago(6), delta:-12, motif:"Sortie pour le service", by:s.service}]);

    // Chantiers : 2 par arrondissement, financés sur la dotation de 230 M FCFA (montants fictifs)
    const CH = [
      [1,"Forage d'eau potable – Gros Bouquet","Eau",65e6,30e6,45,"En cours"],
      [1,"Curage des caniveaux de Louis et Batterie IV","Assainissement",38e6,38e6,100,"Réalisé"],
      [2,"Aménagement des allées du marché de Mont-Bouët","Marchés",90e6,52e6,55,"En cours"],
      [2,"Éclairage public – Nkembo et Montagne Sainte","Éclairage",48e6,12e6,20,"En cours"],
      [3,"Points de collecte des déchets – Akébé","Propreté",42e6,30e6,70,"En cours"],
      [3,"Réfection de la voirie de desserte – Petit Paris","Voirie",70e6,9e6,10,"Programmé"],
      [4,"Forage d'eau potable – Lalala","Eau",62e6,44e6,65,"En cours"],
      [4,"Curage des caniveaux de Glass et Oloumi","Assainissement",35e6,35e6,100,"Réalisé"],
      [5,"Forage d'eau potable – Awendjé","Eau",64e6,8e6,10,"Programmé"],
      [5,"Voirie de desserte – Kinguélé","Voirie",55e6,22e6,35,"En cours"],
      [6,"Forages d'eau potable – PK8 et PK10","Eau",110e6,60e6,50,"En cours"],
      [6,"Points de collecte des déchets – Nzeng-Ayong","Propreté",40e6,26e6,60,"En cours"],
      [0,"Acquisition d'engins lourds de collecte des déchets","Propreté",1.6e9,4.8e8,30,"En cours"],
      [0,"Village culturel","Culture",8e8,0,0,"À l'étude"],
    ];
    const chantiers = CH.map(([arr, titre, theme, budget, engage, avancement, statut], i) => ({id:"c" + i, titre, arr, theme, budget, engage, avancement, statut, debut:ago(40 + i * 9).slice(0, 10), fin:ago(-30 - i * 15).slice(0, 10), entreprise:i % 3 ? "Entreprise à désigner" : "Régie municipale", notes:[]}));

    const at = (d, h, m = 0) => { const x = new Date(Date.now() + d * 864e5); x.setHours(h, m, 0, 0); return x.toISOString(); };
    const agenda = [
      {id:"e1", titre:"Audience – Association des commerçants de Mont-Bouët", type:"Audience", date:at(1, 10), lieu:"Cabinet du maire", arr:0},
      {id:"e2", titre:"Point d'étape e-Tax et MADIGIPAIE avec l'adjoint chargé de la digitalisation", type:"Réunion", date:at(2, 11), lieu:"Hôtel de ville", arr:0},
      {id:"e3", titre:"Opération de contrôle des vignettes – gare routière", type:"Terrain", date:at(3, 7, 30), lieu:"2e arrondissement", arr:2},
      {id:"e4", titre:"Visite du forage de Lalala", type:"Terrain", date:at(4, 9), lieu:"4e arrondissement", arr:4},
      {id:"e5", titre:"Conférence des six maires d'arrondissement", type:"Réunion", date:at(6, 15), lieu:"Hôtel de ville", arr:0},
      {id:"e6", titre:"Rencontre avec les chefs de quartier des PK", type:"Réunion", date:at(8, 10), lieu:"Mairie du 6e arrondissement", arr:6},
      {id:"e7", titre:"Réception des premiers engins de collecte", type:"Cérémonie", date:at(10, 9, 30), lieu:"Services techniques", arr:0},
      {id:"e8", titre:"Session du conseil municipal", type:"Conseil", date:at(13, 9), lieu:"Salle des délibérations", arr:0},
    ];
    const publications = [
      {id:"pb1", type:"Communiqué", titre:"Vignettes de transport : contrôles renforcés", texte:"Les taxis, taxis-bus et véhicules de transport de marchandises doivent présenter une vignette à QR code valide. Achetez ou renouvelez la vôtre en ligne, rubrique « Payer & vérifier », et payez par Airtel Money, Moov Money ou carte.", arr:0, publie:true, date:ago(2)},
      {id:"pb2", type:"Avis", titre:"Marchés : payez vos droits de place par téléphone", texte:"Après Mont-Bouët, le paiement électronique des droits de place s'étend aux autres marchés municipaux. Chaque paiement donne un reçu numérique : ne payez plus en espèces à un intermédiaire.", arr:0, publie:true, date:ago(5)},
      {id:"pb3", type:"Communiqué", titre:"Saison des pluies : gardons les caniveaux libres", texte:"Ne jetez pas vos déchets dans les caniveaux. Signalez tout dépôt sauvage ou caniveau bouché depuis le site : votre signalement arrive directement aux services techniques et vous suivez l'intervention.", arr:0, publie:true, date:ago(8)},
      {id:"pb4", type:"Avis", titre:"Rendez-vous en ligne à l'état civil", texte:"Réservez votre créneau dans votre mairie d'arrondissement et soyez reçu à l'heure, sans file d'attente.", arr:3, publie:true, date:ago(11)},
      {id:"pb5", type:"Recrutement", titre:"Brouillon – contrôleurs des vignettes (à valider)", texte:"Exemple de publication en attente de validation : elle n'apparaît pas encore sur le site public.", arr:0, publie:false, date:ago(1)},
    ];
    const contacts = [
      {id:"m1", nom:"Ghislain Ndjave", email:"g.ndjave@exemple.ga", tel:"", sujet:"Renseignement", message:"Bonjour, quels sont les jours de célébration des mariages à l'hôtel de ville ?", date:ago(1.3), lu:false, pj:[], arr:0},
      {id:"m2", nom:"Syndicat des taxis de Libreville", email:"taxis@exemple.ga", tel:"", sujet:"Vignettes", message:"Nous souhaitons une séance d'information sur la vignette à QR code pour nos adhérents.", date:ago(4), lu:true, pj:[], arr:0},
      {id:"m3", nom:"Association des jeunes de Nzeng-Ayong", email:"ajn@exemple.ga", tel:"", sujet:"Partenariat", message:"Nous proposons une journée de salubrité avec notre mairie d'arrondissement.", date:ago(2.2), lu:false, pj:[], arr:6},
    ];
    const journal = [
      {id:"j1", date:ago(0.2), user:"Gisèle Ondo", action:"Alerte stock", detail:"Papier sécurisé pour actes : 7 rames restantes (seuil 12). Le cabinet a été averti automatiquement.", arr:0},
      {id:"j2", date:ago(0.5), user:"Brigade de contrôle", action:"Contrôle vignette", detail:"LBV-TX-0001 · GA 0001 LV · valide (carrefour Mont-Bouët)", arr:2},
      {id:"j3", date:ago(0.8), user:"Rodrigue Mabika", action:"Chantier mis à jour", detail:"Forage d'eau potable – Lalala : 65 %", arr:4},
      {id:"j4", date:ago(1.1), user:"Paiement en ligne", action:"Paiement reçu", detail:"LBV-26-01234 · Airtel Money · 2 000 FCFA", arr:2},
    ];
    return {v:1, authentifications, users, demandes, signalements, actes, vignettes, agenda, recettes, agents, stocks, chantiers, publications, contacts, journal};
  }

  /* ---------- Registre des documents authentifiés ---------- */
  function findActe(num, nom, type) {
    const n = normNum(num), k = normNom(nom);
    if (!n) return null;
    const a = (db.authentifications || []).find(x => x.num === n && (!k || normNom(x.nom) === k) && (!type || type === "tout" || x.type === type));
    if (a) return {id:a.id, num:a.num, numAff:a.numAff, type:a.type, nom:a.nom, prenoms:a.prenoms, statut:a.statut, authDate:a.authDate, arr:a.arr, source:a.source};
    const r = (db.actes || []).find(x => normNum(x.num) === n && (!k || normNom(x.nom) === k));   // acte du registre numérique de la commune : authentique d'office
    if (r) return {id:null, num:normNum(r.num), numAff:r.num, type:r.type, nom:r.nom, prenoms:r.prenoms, statut:"Authentifié", authDate:r.date, arr:r.arr, source:"registre"};
    return null;
  }
  const maskNom = (nom, pre) => (pre ? pre[0].toUpperCase() + ". " : "") + String(nom || "").toUpperCase();

  /* ---------- Vignettes de transport & taxes (e-Tax) ---------- */
  const today = () => new Date().toISOString().slice(0, 10);
  const findVig = q => { const k = normPlaque(q); if (!k) return null; return (db.vignettes || []).find(v => normPlaque(v.num) === k || normPlaque(v.plaque) === k) || null; };
  const vigPub = v => { const parts = String(v.proprio || "").split(" "); const last = v.controles && v.controles.length ? v.controles.slice().sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    return {num:v.num, cat:v.cat, catL:CAT_VIG[v.cat] || v.cat, plaque:v.plaque, titulaire:maskNom(parts.slice(1).join(" ") || parts[0], parts.length > 1 ? parts[0] : ""), debut:v.debut, fin:v.fin, etat:v.statut === "Suspendue" ? "Suspendue" : v.fin < today() ? "Expirée" : "Valide", controle:last ? {date:last.date, lieu:last.lieu} : null}; };
  const addYear = iso => { const d = new Date(iso + "T12:00:00"); d.setFullYear(d.getFullYear() + 1); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
  const natureTaxe = t => t.g === "vignette" ? "Vignettes de transport" : t.g === "marche" ? "Droits de place (marchés)" : t.id === "odp" ? "Occupation du domaine public" : "Taxe sur la publicité";

  /* =========================================================
     MODE DÉMONSTRATION (localStorage)
     ========================================================= */
  const pub = o => ({ref:o.ref, acte:o.acte || null, typeId:o.type, type:o.typeLabel, statut:o.statut, date:o.date, arr:o.arr, prenom:o.prenom, nom:o.nom, quartier:o.quartier, montant:o.montant || 0, paiement:o.paiement || null, document:o.document || null, rdv:o.rdv || null, historique:(o.historique || []).filter(h => h.pub)});
  const Demo = {
    load() { let d; try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} if (!d || d.v !== 1) { d = seed(); db = d; this.save(); } db = d; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { throw new Error("Mémoire de démonstration pleine : fichier trop volumineux."); } },
    async init() { this.load(); let id; try { id = sessionStorage.getItem(SKEY); } catch (e) {} me = id ? db.users.find(u => u.id === id) || null : null; return me; },
    async initPublic() { this.load(); },
    async login(login, pwd) {
      this.load();
      const u = db.users.find(x => x.login.toLowerCase() === String(login).trim().toLowerCase() && x.pwd === pwd);
      if (u) { try { sessionStorage.setItem(SKEY, u.id); } catch (e) {} me = u; }
      return u || null;
    },
    async logout() { try { sessionStorage.removeItem(SKEY); } catch (e) {} me = null; },
    async add(col, o) { this.load(); const n = {id:uid(col[0]), date:now(), ...o}; db[col].unshift(n); this.save(); return n; },
    async update(col, id, patch) { this.load(); const o = db[col].find(x => x.id === id); if (!o) throw new Error("Élément introuvable"); Object.assign(o, patch); this.save(); return o; },
    async remove(col, id) { this.load(); db[col] = db[col].filter(x => x.id !== id); this.save(); },
    async submit(col, d) {
      this.load();
      const yr = String(new Date().getFullYear()).slice(2);
      const ref = col === "signalements" ? "SIG-" + yr + "-" + String(300 + db.signalements.length + 1).padStart(4, "0") : col === "demandes" ? "LBV-" + yr + "-" + String(1000 + db.demandes.length + 1).padStart(5, "0") : null;
      const first = {demandes:"Nouvelle", signalements:"Nouveau"}[col];
      const n = {pj:[], ...d, id:uid(col[0]), date:now()};
      let acteNote = "";
      if (col === "demandes" && d.numActe) {
        let a = findActe(d.numActe, d.nomActe || d.nom, d.typeActe);
        if (!a) {   // première fois : on inscrit le numéro, l'original sera vérifié au guichet
          const au = {id:uid("a"), num:normNum(d.numActe), numAff:String(d.numActe).trim(), type:d.typeActe || "naissance", nom:d.nomActe || d.nom, prenoms:d.prenom, naissance:"", lieu:"", arr:d.arr, tel:d.tel, statut:"En attente", source:"en ligne", date:now(), authDate:null, agent:"", historique:[{date:now(), t:"Numéro déclaré en ligne : en attente de présentation de l'original."}]};
          db.authentifications.unshift(au); a = {num:au.num, numAff:au.numAff, type:au.type, nom:au.nom, statut:"En attente", authDate:null};
        }
        n.acte = {num:a.num, numAff:a.numAff, type:a.type, nom:a.nom, statut:a.statut, authDate:a.authDate};
        acteNote = a.statut === "Authentifié" ? ` ${typeDocL(a.type)} n° ${a.numAff} authentifié : original non requis, démarche traitée en ligne.` : ` ${typeDocL(a.type)} n° ${a.numAff} non encore authentifié : présentez l'original une seule fois au guichet.`;
        delete n.numActe; delete n.nomActe; delete n.typeActe;
      }
      if (ref) Object.assign(n, {ref, statut:first, historique:[{date:now(), statut:first, note:col === "demandes" ? "Demande reçue en ligne." + (d.paiement && d.paiement.choix === "guichet" ? " Paiement prévu au guichet." : "") + acteNote : "Signalement reçu.", pub:true}]});
      if (col === "contacts") n.lu = false;
      db[col].unshift(n);
      try { this.save(); } catch (e) { db[col].shift(); throw e; }
      return ref;
    },
    async verifDoc(num, nom, type) {
      this.load(); const a = findActe(num, nom, type);
      return a ? {numAff:a.numAff, type:a.type, titulaire:maskNom(a.nom, a.prenoms), statut:a.statut, authDate:a.authDate, source:a.source} : null;
    },
    async suivi(ref, tel) {
      this.load(); ref = String(ref).trim().toUpperCase();
      const o = [...db.demandes, ...db.signalements].find(x => x.ref === ref);
      if (!o || telKey(o.tel) !== telKey(tel)) return null;
      return pub(o);
    },
    async pay(ref, tel, mode) {
      this.load(); const o = db.demandes.find(x => x.ref === String(ref).trim().toUpperCase());
      if (!o || telKey(o.tel) !== telKey(tel)) throw new Error("Dossier introuvable");
      if (o.paiement && o.paiement.statut === "Payé") return pub(o);
      const q = quittanceNo(), d = now(), tr = trPrefix(mode) + String(Date.now()).slice(-9);
      o.paiement = {choix:"en ligne", statut:"Payé", mode, date:d, quittance:q, transaction:tr};
      o.historique.push({date:d, statut:o.statut, note:`Paiement reçu (${mode}) : ${fcfa(o.montant)}.`, pub:true});
      db.recettes.unshift({id:uid("r"), quittance:q, nature:natureDe(o.type), arr:o.arr, montant:o.montant, payeur:o.prenom + " " + o.nom, mode, agent:"Paiement en ligne", date:d});
      db.journal.unshift({id:uid("j"), date:d, user:"Paiement en ligne", action:"Paiement reçu", detail:`${o.ref} · ${mode} · ${fcfa(o.montant)}`, arr:o.arr});
      this.save(); return pub(o);
    },
    async verifVignette(q) { this.load(); const v = findVig(q); return v ? vigPub(v) : null; },
    async rdvPris(arr, jour) { this.load(); return db.demandes.filter(d => d.type === "rdv" && +d.arr === +arr && d.rdv && d.rdv.jour === jour && d.statut !== "Rejetée").map(d => d.rdv.heure); },
    async payTaxe(d) {
      this.load();
      const t = TAXES.find(x => x.id === d.taxe); if (!t) throw new Error("Taxe inconnue");
      const qte = Math.max(1, Math.min(12, +d.qte || 1)), montant = t.prix * qte, date = now(), q = quittanceNo(), tr = trPrefix(d.mode) + String(Date.now()).slice(-9);
      let vig = null;
      if (t.g === "vignette") {
        const np = normPlaque(d.ref); if (np.length < 5) throw new Error("Immatriculation invalide");
        vig = db.vignettes.find(v => normPlaque(v.plaque) === np && v.cat === t.cat);
        if (vig) { const start = vig.fin >= today() ? new Date(new Date(vig.fin + "T12:00:00").getTime() + 864e5).toISOString().slice(0, 10) : today(); vig.fin = addYear(start); vig.statut = "Active"; }
        else { const n = db.vignettes.filter(v => v.cat === t.cat).length + 1; vig = {id:uid("v"), num:"LBV-" + t.cat + "-" + String(n).padStart(4, "0"), cat:t.cat, plaque:String(d.ref).toUpperCase().trim(), proprio:d.nom, tel:d.tel, debut:today(), fin:addYear(today()), statut:"Active", controles:[], arr:0, date}; db.vignettes.unshift(vig); }
        vig.quittance = q;
      }
      const nature = natureTaxe(t);
      db.recettes.unshift({id:uid("r"), quittance:q, nature, arr:+d.arr || 0, montant, payeur:d.nom + " · " + (vig ? vig.plaque : d.ref), mode:d.mode, agent:"Paiement en ligne (e-Tax)", date, refTaxe:vig ? vig.num : d.ref, transaction:tr});
      db.journal.unshift({id:uid("j"), date, user:"Paiement en ligne", action:"Taxe payée", detail:`${t.t} · ${vig ? vig.num : d.ref} · ${d.mode} · ${fcfa(montant)}`, arr:+d.arr || 0});
      this.save();
      return {quittance:q, transaction:tr, montant, nature, taxe:t.t + (qte > 1 ? " × " + qte : ""), ref:d.ref, nom:d.nom, mode:d.mode, date, arr:+d.arr || 0, vignette:vig ? vigPub(vig) : null};
    },
    async markDownloaded(ref, tel) {
      this.load(); const o = db.demandes.find(x => x.ref === ref);
      if (!o || telKey(o.tel) !== telKey(tel) || o.statut !== "Prête") return;
      o.statut = "Remise"; o.historique.push({date:now(), statut:"Remise", note:"Document téléchargé en ligne par le demandeur.", pub:true}); this.save();
    },
    async changePassword(pwd) { me.pwd = pwd; db.users.find(u => u.id === me.id).pwd = pwd; this.save(); },
    async createUser(u) {
      if (db.users.some(x => x.login.toLowerCase() === u.login.trim().toLowerCase())) throw new Error("Cet identifiant existe déjà");
      if ((u.password || "").length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      const n = {id:uid("u"), role:u.role, arr:+u.arr || 0, login:u.login.trim(), pwd:u.password, prenom:u.prenom, nom:u.nom, titre:u.titre || ROLES[u.role].l};
      db.users.push(n); this.save(); return n;
    },
    async setPassword(id, pwd) { if ((pwd || "").length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères"); db.users.find(u => u.id === id).pwd = pwd; this.save(); },
    async deleteUser(id) { if (id === me.id) throw new Error("Vous ne pouvez pas supprimer votre propre compte"); db.users = db.users.filter(u => u.id !== id); this.save(); },
    async reset() { try { localStorage.removeItem(KEY); } catch (e) {} this.load(); },
    subscribe(cb) { addEventListener("storage", e => { if (e.key === KEY) { const id = me && me.id; this.load(); me = db.users.find(u => u.id === id) || me; cb("all"); } }); },
  };

  /* =========================================================
     MODE RÉEL (Supabase) — table unique « records » (une ligne = un élément,
     colonne « col » = la rubrique, « arr » = l'arrondissement, « data » = le contenu)
     ========================================================= */
  function ready() {
    if (!readyP) readyP = new Promise((res, rej) => {
      const go = () => { sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey); res(sb); };
      if (window.supabase) return go();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload = go; s.onerror = () => rej(new Error("Impossible de joindre la base de données"));
      document.head.appendChild(s);
    });
    return readyP;
  }
  const q = async p => { const {data, error} = await p; if (error) throw new Error(error.message); return data; };
  const fromRow = r => ({...r.data, id:r.id, arr:r.arr, date:r.data.date || r.created_at});
  const mapUser = p => ({id:p.id, role:p.role, arr:p.arr || 0, login:p.login, prenom:p.prenom, nom:p.nom, titre:p.titre});

  const Live = {
    async loadCol(col) { db[col] = (await q(sb.from("records").select("*").eq("col", col).order("created_at", {ascending:false}).limit(5000))).map(fromRow); },
    async loadAll() {
      await Promise.all(COLS.map(c => this.loadCol(c).catch(() => { db[c] = []; })));
      db.users = (await q(sb.from("profiles").select("*").order("nom"))).map(mapUser);
    },
    async init() {
      await ready();
      const {data:{session}} = await sb.auth.getSession();
      if (!session) return null;
      const p = await q(sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle());
      if (!p) return null;
      me = mapUser(p); await this.loadAll(); return me;
    },
    async initPublic() { await ready(); db.publications = (await q(sb.rpc("public_publications"))).map(fromRow); },
    async login(login, pwd) {
      await ready();
      const {data, error} = await sb.auth.signInWithPassword({email:EMAIL(login), password:pwd});
      if (error || !data.user) return null;
      const p = await q(sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle());
      if (!p) { await sb.auth.signOut(); return null; }
      return (me = mapUser(p));
    },
    async logout() { await ready(); await sb.auth.signOut(); me = null; },
    async add(col, o) {
      const id = uid(col[0]), data = {date:now(), ...o}; delete data.id;
      const row = await q(sb.from("records").insert({id, col, arr:+o.arr || 0, data}).select().single());
      const n = fromRow(row); db[col].unshift(n); return n;
    },
    async update(col, id, patch) {
      const o = db[col].find(x => x.id === id); if (!o) throw new Error("Élément introuvable");
      const merged = {...o, ...patch}; const data = {...merged}; delete data.id;
      await q(sb.from("records").update({arr:+merged.arr || 0, data}).eq("id", id));
      Object.assign(o, patch); return o;
    },
    async remove(col, id) { await q(sb.from("records").delete().eq("id", id)); db[col] = db[col].filter(x => x.id !== id); },
    async submit(col, d) { await ready(); return await q(sb.rpc("submit_public", {p_col:col, p_arr:+d.arr || 0, p_data:d})); },
    async verifDoc(num, nom, type) { await ready(); return (await q(sb.rpc("verif_document", {p_num:normNum(num), p_nom:normNom(nom), p_type:type || "tout"}))) || null; },
    async suivi(ref, tel) { await ready(); return (await q(sb.rpc("suivi_dossier", {p_ref:String(ref).trim().toUpperCase(), p_tel:telKey(tel)}))) || null; },
    async pay(ref, tel, mode) { await ready(); return await q(sb.rpc("pay_public", {p_ref:String(ref).trim().toUpperCase(), p_tel:telKey(tel), p_mode:mode})); },
    async verifVignette(q) { await ready(); return (await q(sb.rpc("verif_vignette", {p_q:normPlaque(q)}))) || null; },
    async rdvPris(arr, jour) { await ready(); return (await q(sb.rpc("rdv_pris", {p_arr:+arr, p_jour:jour}))) || []; },
    async payTaxe(d) { await ready(); return await q(sb.rpc("pay_taxe", {p_data:d})); },
    async markDownloaded(ref, tel) { await ready(); await q(sb.rpc("mark_downloaded", {p_ref:ref, p_tel:telKey(tel)})).catch(() => {}); },
    async changePassword(pwd) { const {error} = await sb.auth.updateUser({password:pwd}); if (error) throw new Error(error.message); },
    async createUser(u) { await q(sb.rpc("admin_create_user", {p_login:u.login, p_password:u.password, p_role:u.role, p_arr:+u.arr || 0, p_prenom:u.prenom, p_nom:u.nom, p_titre:u.titre || ROLES[u.role].l})); db.users = (await q(sb.from("profiles").select("*").order("nom"))).map(mapUser); },
    async setPassword(id, pwd) { await q(sb.rpc("admin_set_password", {p_user:id, p_password:pwd})); },
    async deleteUser(id) { await q(sb.rpc("admin_delete_user", {p_user:id})); db.users = db.users.filter(u => u.id !== id); },
    async reset() {},
    subscribe(cb) {
      sb.channel("lbv-live").on("postgres_changes", {event:"*", schema:"public", table:"records"}, async payload => {
        const col = (payload.new && payload.new.col) || (payload.old && payload.old.col);
        if (!col) return; try { await this.loadCol(col); } catch (e) { return; }
        cb(col, payload.new && payload.new.data);
      }).subscribe();
    },
  };

  const A = LIVE ? Live : Demo;
  const scope = list => me && me.arr ? list.filter(x => +x.arr === +me.arr) : list;

  return {
    LIVE, ROLES, STATUTS, NATURES, MODES, COLS, natureDe,
    init: () => A.init(),
    initPublic: () => A.initPublic(),
    db: () => db,
    current: () => me,
    user: id => db.users.find(u => u.id === id),
    can: mod => !!me && (ROLES[me.role].mods === "*" || ROLES[me.role].mods.includes(mod)),
    list: col => scope(db[col] || []),
    login: (l, p) => A.login(l, p),
    logout: () => A.logout(),
    changePassword: p => A.changePassword(p),
    add: (c, o) => A.add(c, o),
    update: (c, id, p) => A.update(c, id, p),
    remove: (c, id) => A.remove(c, id),
    async log(action, detail) { try { await A.add("journal", {user:me ? me.prenom + " " + me.nom : "Site public", action, detail, arr:me ? me.arr : 0}); } catch (e) {} },
    // Encaissement d'une démarche au guichet (back-office)
    async encaisser(demId, mode) {
      const o = db.demandes.find(x => x.id === demId); if (!o) throw new Error("Dossier introuvable");
      const qn = quittanceNo(), d = now();
      const r = await A.add("recettes", {quittance:qn, nature:natureDe(o.type), arr:o.arr, montant:o.montant, payeur:o.prenom + " " + o.nom, mode, agent:me.prenom + " " + me.nom, date:d});
      const h = (o.historique || []).concat([{date:d, statut:o.statut, note:`Paiement reçu au guichet (${mode}) : ${fcfa(o.montant)}.`, pub:true}]);
      await A.update("demandes", o.id, {paiement:{choix:"guichet", statut:"Payé", mode, date:d, quittance:qn}, historique:h});
      return r;
    },
    // Formulaires publics
    submitDemande: d => A.submit("demandes", d),
    submitSignalement: d => A.submit("signalements", d),
    addContact: d => A.submit("contacts", d),
    suivi: (ref, tel) => A.suivi(ref, tel),
    verifDoc: (num, nom, type) => A.verifDoc(num, nom, type),
    findActe: (num, nom, type) => findActe(num, nom, type),
    // Statistiques agrégées par arrondissement (sans données personnelles) pour le classement
    async statsArr(fromIso) {
      if (LIVE) { await ready(); return await q(sb.rpc("stats_arrondissements", {p_from:fromIso})); }
      const from = new Date(fromIso).getTime(), inP = x => new Date(x.date).getTime() >= from;
      const doneAt = d => { const h = (d.historique || []).find(x => /Prête|Remise|Rejetée|Résolu/.test(x.statut)); return h ? h.date : null; };
      return ARR_N.map(a => {
        const dem = db.demandes.filter(d => +d.arr === a && inP(d)), sig = db.signalements.filter(x => +x.arr === a && inP(x)), rec = db.recettes.filter(x => +x.arr === a && inP(x));
        const dl = dem.map(d => doneAt(d) ? (new Date(doneAt(d)) - new Date(d.date)) / 864e5 : null).filter(x => x != null);
        const tot = rec.reduce((s, x) => s + x.montant, 0);
        return {arr:a, demandes:dem.length, delai:dl.length ? dl.reduce((s, x) => s + x, 0) / dl.length : null, traitees:dem.length ? dem.filter(doneAt).length / dem.length * 100 : 0,
          recettes:tot, online:tot ? rec.filter(x => ONLINE_RE.test(x.mode)).reduce((s, x) => s + x.montant, 0) / tot * 100 : 0, resolus:sig.length ? sig.filter(x => x.statut === "Résolu").length / sig.length * 100 : 0,
          enLigne:dem.length ? dem.filter(d => d.acte && d.acte.statut === "Authentifié").length / dem.length * 100 : 0};
      });
    },
    pay: (ref, tel, mode) => A.pay(ref, tel, mode),
    markDownloaded: (ref, tel) => A.markDownloaded(ref, tel),
    verifVignette: q => A.verifVignette(q),
    rdvPris: (arr, jour) => A.rdvPris(arr, jour),
    payTaxe: d => A.payTaxe(d),
    vigPub: v => vigPub(v),
    ONLINE_RE,
    publicationsPubliques: () => (db.publications || []).filter(p => p.publie).sort((a, b) => b.date.localeCompare(a.date)),
    // Comptes
    createUser: u => A.createUser(u),
    setPassword: (id, p) => A.setPassword(id, p),
    deleteUser: id => A.deleteUser(id),
    reset: () => A.reset(),
    subscribe: cb => A.subscribe(cb),
  };
})();
