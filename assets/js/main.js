/* Mairie de Libreville — comportements du site public */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = n => `assets/img/${n}.jpg`;
const escH = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fdate = d => new Date(d).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"});
const arrL = n => !+n ? "Mairie centrale" : n + (+n === 1 ? "er" : "e") + " arrondissement";
const arrS = n => n + (+n === 1 ? "er" : "e");
const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } };

function toast(msg, type = "") {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.className = "toast " + type; t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("on"));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 3400);
}

/* ---------- Retour en arrière : chaque fenêtre, menu ou visionneuse ouverte crée une étape
   d'historique ; la touche « retour » du téléphone (ou le bouton « ← Retour ») la referme. ---------- */
const Back = {
  stack:[], skip:0,
  open(close) { if (this.stack.includes(close)) return; this.stack.push(close); history.pushState({lbvOverlay:this.stack.length}, ""); },
  close(close) { const i = this.stack.lastIndexOf(close); if (i < 0) return; this.stack.splice(i, 1); this.skip++; history.back(); },
};
addEventListener("popstate", () => {
  if (Back.skip) { Back.skip--; if (Back.stack.length) history.pushState({lbvOverlay:Back.stack.length}, ""); return; }
  const c = Back.stack.pop(); if (c) c(true);
});
// Bouton « retour » des pages : page précédente du site, sinon l'accueil
function goBack() { if (document.referrer && document.referrer.startsWith(location.origin) && history.length > 1) history.back(); else location.href = "index.html"; }

const BACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
function hideModal(fromPop) {
  const m = $("#modal"); if (!m || !m.classList.contains("on")) return;
  if (fromPop && m.dataset.lock) { Back.open(hideModal); return; }   // paiement en cours : on ne ferme pas
  delete m.dataset.lock; m.classList.remove("on"); document.body.classList.remove("ov-open");
  if (!fromPop) Back.close(hideModal);
}
function modal(title, html) {
  let m = $("#modal");
  if (!m) {
    m = document.createElement("div"); m.id = "modal"; m.className = "modal";
    m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><div class="mh"><button class="mback" aria-label="Retour">' + BACK_ICON + '<span>Retour</span></button><h3></h3><button class="x" aria-label="Fermer">×</button></div><div class="mb"></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click", e => { if ((e.target === m || e.target.closest(".x") || e.target.closest(".mback")) && !m.dataset.lock) hideModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !m.dataset.lock) hideModal(); });
  }
  delete m.dataset.lock;
  $("h3", m).textContent = title; $(".mb", m).innerHTML = html;
  if (!m.classList.contains("on")) { m.classList.add("on"); document.body.classList.add("ov-open"); Back.open(hideModal); }
  $(".box", m).scrollTop = 0;
  return m;
}
const closeModal = () => hideModal();
window.pogCloseModal = closeModal;

/* ---------- Chargement de bibliothèques (à la demande) ---------- */
const _scripts = {};
function loadScript(src) {
  return _scripts[src] || (_scripts[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Chargement impossible, vérifiez votre connexion.")); document.head.appendChild(s); }));
}

/* ---------- Documents authentifiés : badge ---------- */
function acteBadge(a, big) {
  if (!a) return "";
  const ok = a.statut === "Authentifié", bad = a.statut === "Rejeté";
  return `<div class="auth-badge ${ok ? "ok" : bad ? "bad" : "wait"} ${big ? "big" : ""}"><span class="shield">${ok ? ICONS.shieldok : ICONS.shield}</span><span><b>${typeDocL(a.type)} n° ${escH(a.numAff || a.num)} — ${ok ? "Authentifié" : bad ? "Non conforme" : "À authentifier"}</b><small>${ok ? `Original vérifié${a.authDate ? " le " + fdate(a.authDate) : ""}${a.source === "registre" ? " (registre numérique de la commune)" : ""} : il ne vous sera plus demandé. Vos duplicatas, renouvellements et légalisations se font en ligne, vous passez seulement récupérer.` : bad ? "Le document présenté n'a pas été reconnu : rapprochez-vous du service de l'état civil." : "Première fois : présentez l'original UNE SEULE FOIS au guichet. Ensuite, ce numéro sera reconnu pour toutes vos démarches."}</small></span></div>`;
}

/* ---------- Pièces jointes : photos compressées, PDF limités ---------- */
const PJ_MAX = 3, PDF_MAX = 900 * 1024;
const fileToDataURL = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
async function compressImage(f) {
  const url = await fileToDataURL(f), img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const k = Math.min(1, 1400 / Math.max(img.width, img.height)), c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", .72);
}
async function readFiles(input) {
  const files = [...(input && input.files || [])];
  if (files.length > PJ_MAX) throw new Error(`${PJ_MAX} fichiers maximum.`);
  const out = [];
  for (const f of files) {
    if (/^image\//.test(f.type)) out.push({nom:f.name.replace(/\.\w+$/, "") + ".jpg", type:"image/jpeg", data:await compressImage(f)});
    else if (f.type === "application/pdf") { if (f.size > PDF_MAX) throw new Error(`« ${f.name} » dépasse 900 Ko : envoyez une photo ou un PDF plus léger.`); out.push({nom:f.name, type:f.type, data:await fileToDataURL(f)}); }
    else throw new Error(`« ${f.name} » : seuls les photos et les PDF sont acceptés.`);
  }
  out.forEach(x => x.taille = Math.round(x.data.length * .75 / 1024));
  return out;
}
function bindFileList(input, box) {
  if (!input || !box) return;
  input.addEventListener("change", () => {
    const fs = [...input.files];
    if (fs.length > PJ_MAX) { toast(`${PJ_MAX} fichiers maximum.`, "err"); input.value = ""; }
    box.innerHTML = [...input.files].map(f => `<span class="pjchip">${ICONS.file}${escH(f.name)} <small>${Math.round(f.size / 1024)} Ko</small></span>`).join("");
  });
}
const pjLinks = list => (list || []).map(p => `<a class="pjchip" href="${p.data}" download="${escH(p.nom)}">${ICONS.file}${escH(p.nom)} <small>${p.taille || ""} Ko</small></a>`).join("");

/* ---------- Documents PDF (document délivré, reçu de paiement) ---------- */
const DOC_TITRES = {"vignette":"VIGNETTE DE TRANSPORT À QR CODE","naissance":"EXTRAIT D'ACTE DE NAISSANCE","decl-naissance":"ACTE DE NAISSANCE","deces":"COPIE D'ACTE DE DÉCÈS","copie-mariage":"COPIE D'ACTE DE MARIAGE","residence":"CERTIFICAT DE RÉSIDENCE","permis":"PERMIS DE CONSTRUIRE","domaine":"AUTORISATION D'OCCUPATION DU DOMAINE PUBLIC","place":"AUTORISATION D'EMPLACEMENT AU MARCHÉ"};
const verifCode = ref => { let h = 7; for (const c of ref) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h.toString(36).toUpperCase().padStart(7, "0").slice(-7); };
const pdfMoney = n => Math.round(n || 0).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA";
async function newPdf() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const doc = new window.jspdf.jsPDF({unit:"mm", format:"a4"});
  // En-tête aux couleurs de la ville
  doc.setFillColor(6, 54, 63); doc.rect(0, 0, 210, 34, "F");
  doc.setFillColor(10, 138, 85); doc.rect(0, 34, 70, 2, "F"); doc.setFillColor(242, 194, 48); doc.rect(70, 34, 70, 2, "F"); doc.setFillColor(20, 119, 181); doc.rect(140, 34, 70, 2, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("RÉPUBLIQUE GABONAISE", 105, 10, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text("Union – Travail – Justice", 105, 14.5, {align:"center"});
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text("MAIRIE DE LIBREVILLE", 105, 24, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.text("Capitale de la République gabonaise · Province de l'Estuaire", 105, 29.5, {align:"center"});
  // Filigrane
  doc.setTextColor(232, 236, 242); doc.setFont("helvetica", "bold"); doc.setFontSize(54);
  doc.text("DÉMONSTRATION", 105, 175, {align:"center", angle:35});
  doc.setTextColor(15, 28, 51);
  return doc;
}
function pdfRows(doc, y, rows) {
  doc.setFontSize(10.5);
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal"); doc.setTextColor(91, 107, 133); doc.text(k, 25, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(6, 54, 63); doc.text(doc.splitTextToSize(String(v), 105), 85, y);
    doc.setDrawColor(220, 226, 235); doc.line(25, y + 3, 185, y + 3); y += 10;
  });
  doc.setTextColor(15, 28, 51); return y;
}
function pdfFoot(doc, code) {
  doc.setDrawColor(6, 54, 63); doc.setLineWidth(.6); doc.circle(160, 245, 15); doc.setLineWidth(.2); doc.circle(160, 245, 12.5);
  doc.setFontSize(6.5); doc.setTextColor(6, 54, 63); doc.text("MAIRIE DE", 160, 243, {align:"center"}); doc.text("LIBREVILLE", 160, 247, {align:"center"});
  doc.setFontSize(9); doc.setTextColor(15, 28, 51); doc.text("L'officier d'état civil / Le maire", 160, 266, {align:"center"});
  doc.setFontSize(8); doc.setTextColor(91, 107, 133);
  doc.text(`Code de vérification : ${code}  ·  à contrôler sur le site de la mairie, rubrique « Suivre mon dossier »`, 105, 282, {align:"center"});
  doc.text("Document de démonstration généré en ligne — sans valeur légale.", 105, 287, {align:"center"});
}
async function downloadDocument(r) {
  if (r.document && r.document.type === "fichier" && r.document.data) {
    const a = document.createElement("a"); a.href = r.document.data; a.download = r.document.nom || (r.ref + ".pdf"); a.click(); return;
  }
  const doc = await newPdf(), titre = DOC_TITRES[r.typeId] || (r.type || "").toUpperCase(), ben = `${r.prenom} ${(r.nom || "").toUpperCase()}`;
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(6, 54, 63); doc.text(titre, 105, 54, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(91, 107, 133); doc.text(`${arrL(r.arr)} · Dossier ${r.ref}`, 105, 61, {align:"center"});
  const intro = {
    residence:`Le maire de la commune de Libreville certifie que ${ben} réside sur le territoire de la commune, au quartier ${r.quartier || "—"} (${arrL(r.arr)}).`,
    permis:`Le maire de la commune de Libreville autorise ${ben} à réaliser les travaux décrits dans le dossier ${r.ref}, sous réserve du respect des règles d'urbanisme en vigueur.`,
    domaine:`Le maire de la commune de Libreville autorise ${ben} à occuper temporairement le domaine public au quartier ${r.quartier || "—"}, dans les conditions fixées par la mairie.`,
    vignette:`Le maire de la commune de Libreville atteste que le véhicule déclaré par ${ben} est titulaire d'une vignette de transport valable douze mois, vérifiable par QR code.`,
    place:`Le maire de la commune de Libreville attribue à ${ben} un emplacement dans un marché municipal, dans les conditions fixées par le règlement des marchés.`,
  }[r.typeId] || `Délivré à ${ben}, conformément aux mentions portées au registre d'état civil de la commune de Libreville.`;
  doc.setFontSize(11); doc.setTextColor(15, 28, 51); doc.text(doc.splitTextToSize(intro, 160), 25, 76);
  const docNo = "DOC-" + r.ref.replace(/^LBV-/, "");
  pdfRows(doc, 100, [["N° du document", docNo], ...(r.acte ? [[typeDocL(r.acte.type) + " n°", (r.acte.numAff || r.acte.num) + (r.acte.statut === "Authentifié" ? "  (authentifié)" : "")]] : []), ["Bénéficiaire", ben], ["Quartier", r.quartier || "—"], ["Arrondissement", arrL(r.arr)], ["N° de dossier", r.ref], ["Demande déposée le", fdate(r.date)], ["Délivré le", fdate((r.document && r.document.date) || new Date())], ["Code de vérification", verifCode(r.ref)]]);
  doc.setFontSize(10); doc.text(`Fait à Libreville, le ${fdate((r.document && r.document.date) || new Date())}.`, 25, 206);
  pdfFoot(doc, verifCode(r.ref));
  doc.save(`${titre.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}-${r.ref}.pdf`);
}
async function downloadRecu(r) {
  const p = r.paiement || {}, doc = await newPdf();
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(6, 54, 63); doc.text("REÇU DE PAIEMENT", 105, 54, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(91, 107, 133); doc.text(`Quittance ${p.quittance || "—"}`, 105, 61, {align:"center"});
  const y = pdfRows(doc, 80, [["Démarche", r.type], ["N° de dossier", r.ref], ["Payé par", `${r.prenom} ${r.nom}`], ["Date du paiement", p.date ? new Date(p.date).toLocaleString("fr-FR") : "—"], ["Moyen de paiement", p.mode || "—"], ["Référence de transaction", p.transaction || "Guichet"], ["Arrondissement", arrL(r.arr)]]);
  doc.setFillColor(226, 245, 236); doc.roundedRect(25, y + 4, 160, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(10, 138, 85); doc.text(`Montant réglé : ${pdfMoney(r.montant)}`, 105, y + 15.5, {align:"center"});
  pdfFoot(doc, verifCode(r.ref + (p.quittance || "")));
  doc.save(`recu-${p.quittance || r.ref}.pdf`);
}

/* ---------- Paiement en ligne (simulation de démonstration) ---------- */
function payFlow(r, tel) {
  return new Promise(resolve => {
    const m = modal("Paiement en ligne · " + fcfa(r.montant), `
      <p class="lead-p" style="margin-bottom:1rem">${escH(r.type)} — dossier <b>${r.ref}</b></p>
      <div class="paytabs">${PAIEMENT.modes.map((x, i) => `<button type="button" class="paytab ${i ? "" : "on"}" data-m="${x.id}" style="--c:${x.c}"><span class="plogo ${x.id}">${payLogo(x.id)}</span><span><b>${x.l}</b><small>${x.s}</small></span></button>`).join("")}</div>
      <div id="paybody"></div>
      <p class="demo-pay">${ICONS.lock} Mode démonstration : aucun débit réel. En production, le paiement passe par la plateforme sécurisée d'un prestataire agréé (Airtel Money, Moov Money, banque, ou la plateforme e-Tax de la commune) et la mairie ne voit jamais les données de carte.</p>`);
    const body = $("#paybody", m);
    const done = async mode => {
      body.innerHTML = `<div class="paywait"><span class="spin"></span><p>Validation du paiement…</p></div>`;
      try { const res = await Store.pay(r.ref, tel, mode); await new Promise(x => setTimeout(x, 900)); resolve(res); }
      catch (e) { body.innerHTML = `<p class="alert-box">${ICONS.alert}<span>${escH(e.message)}</span></p>`; delete m.dataset.lock; }
    };
    const show = id => {
      $$(".paytab", m).forEach(b => b.classList.toggle("on", b.dataset.m === id));
      if (id !== "carte") {
        const M = PAIEMENT.modes.find(x => x.id === id), isA = id === "airtel", re = isA ? /^0?7[4-7]/ : /^0?6[0-6]/;
        body.innerHTML = `<form class="form" id="pf"><div class="field"><label for="amn">Numéro ${M.l}</label><input id="amn" name="num" type="tel" required pattern="${isA ? "0?7[4-7]" : "0?6[0-6]"}[0-9\\s]{6,9}" placeholder="${isA ? "074 00 00 00" : "062 00 00 00"}" value="${escH(re.test(tel.replace(/\D/g, "")) ? tel : "")}"></div>
          <p style="font-size:.86rem;color:var(--muted)">Vous allez recevoir une demande de paiement sur votre téléphone. Validez-la avec votre code secret ${M.l} (ne le communiquez jamais à personne, pas même à la mairie).</p>
          <button class="btn btn-orange" style="justify-content:center">Payer ${fcfa(r.montant)}</button></form>`;
        $("#pf", m).onsubmit = e => {
          e.preventDefault(); m.dataset.lock = 1;
          body.innerHTML = `<div class="paywait"><span class="spin"></span><p><b>Demande envoyée au ${escH(e.target.num.value)}</b><br>Validez le paiement sur votre téléphone…</p><button type="button" class="btn btn-navy btn-sm" id="ok">J'ai validé sur mon téléphone</button></div>`;
          const t = setTimeout(() => done(M.l), 4500); $("#ok", m).onclick = () => { clearTimeout(t); done(M.l); };
        };
      } else {
        body.innerHTML = `<div class="cbmock"><div class="cbh">${ICONS.lock} Page de paiement sécurisée du prestataire <small>(simulation)</small></div>
          <div class="field"><label>Numéro de carte (carte de test)</label><input value="4242 4242 4242 4242" readonly></div>
          <div class="row"><div class="field"><label>Expiration</label><input value="12/29" readonly></div><div class="field"><label>Cryptogramme</label><input value="•••" readonly></div></div>
          <button class="btn btn-orange" id="cbpay" style="justify-content:center;width:100%">Payer ${fcfa(r.montant)}</button></div>`;
        $("#cbpay", m).onclick = () => { m.dataset.lock = 1; body.innerHTML = `<div class="paywait"><span class="spin"></span><p><b>Authentification 3-D Secure</b><br>Confirmation auprès de votre banque…</p></div>`; setTimeout(() => done("Carte bancaire"), 2200); };
      }
    };
    $$(".paytab", m).forEach(b => b.onclick = () => show(b.dataset.m));
    show("airtel");
  });
}
function paidModal(r) {
  modal("Paiement confirmé ✅", `<p class="lead-p">Merci ! Votre paiement de <b>${fcfa(r.montant)}</b> par <b>${escH(r.paiement.mode)}</b> est enregistré.</p>
    <div class="panel" style="margin:1.2rem 0;box-shadow:none;text-align:center"><small style="color:var(--muted)">Numéro de dossier</small><div class="refbig">${r.ref}</div><small style="color:var(--muted)">Quittance ${r.paiement.quittance}</small></div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn-orange" id="dlr">${ICONS.dl} Télécharger le reçu (PDF)</button><a class="btn btn-navy" href="demarches.html#suivi" id="gos">${ICONS.search} Suivre mon dossier</a></div>
    <p style="color:var(--muted);font-size:.88rem;margin-top:1rem">Dès que le service aura préparé votre document, vous pourrez le télécharger depuis « Suivre mon dossier ».</p>`);
  $("#dlr").onclick = () => downloadRecu(r).catch(e => toast(e.message, "err"));
  $("#gos").onclick = () => { closeModal(); if (location.pathname.endsWith("demarches.html")) setTimeout(() => window.__suivi && window.__suivi(r.ref), 50); };
}

/* ---------- En-tête & pied de page ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const links = [["mairie","La Mairie"],["arrondissements","Arrondissements"],["demarches","Démarches"],["payer","Payer & vérifier"],["projets","Projets"],["transparence","Transparence"],["actualites","Actualités"],["contact","Contact"]];
  const tel = MAIRIE.tels[0];
  const h = $("#site-header");
  if (h) h.outerHTML = `
  <div class="progress"></div>
  <div class="topbar"><div class="wrap">
    <div class="tb-l"><span>${ICONS.pin}Hôtel de ville · Libreville, capitale du Gabon</span>${tel ? `<a href="tel:+241${tel.replace(/\s/g,"").slice(1)}">${ICONS.phone}${tel}</a>` : ""}${MAIRIE.email ? `<a href="mailto:${MAIRIE.email}">${ICONS.mail}${MAIRIE.email}</a>` : ""}<a href="${MAIRIE.facebook}" target="_blank" rel="noopener">${ICONS.fb}Mairie de Libreville</a></div>
    <div class="tb-r"><a href="payer.html#verifier">${ICONS.qr}Vérifier une vignette</a><a href="demarches.html#suivi">${ICONS.search}Suivre mon dossier</a><a href="espace.html">${ICONS.lock}Espace agents</a></div>
  </div></div>
  <header class="header"><div class="wrap">
    ${page !== "index" ? `<button class="hback" type="button" onclick="goBack()" aria-label="Retour">${BACK_ICON}</button>` : ""}
    <a class="brand" href="index.html"><img src="assets/img/logo-lbv.svg" alt="Emblème de la Mairie de Libreville"><span><b>Mairie de<br>Libreville</b><small>Capitale du Gabon</small></span></a>
    <nav class="nav" id="nav"><div class="nav-top"><button type="button" class="nav-back">${BACK_ICON}<span>Retour</span></button><small>Menu</small></div><a href="index.html" class="${page === "index" ? "active" : ""} nav-home">Accueil</a>${links.map(([k,l]) => `<a href="${k}.html" class="${k===page?"active":""}">${l}</a>`).join("")}<a class="nav-agent" href="espace.html">${ICONS.lock} Espace agents</a><a class="btn btn-orange" href="demarches.html#demande">Démarches en ligne</a></nav>
    <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div></header>`;

  const f = $("#site-footer");
  if (f) f.outerHTML = `
  <footer class="footer"><div class="wrap"><div class="grid">
    <div>
      <a class="logo-w" href="index.html"><img src="assets/img/logo-lbv.svg" alt="Mairie de Libreville"><span>Mairie de<br>Libreville</span></a>
      <p>La commune de Libreville, capitale politique et administrative du Gabon : un hôtel de ville et six mairies d'arrondissement au service des habitants. « ${MAIRIE.slogan}. »</p>
      <div class="socials">
        <a href="${MAIRIE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.fb}</a>
        <a href="${MAIRIE.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${ICONS.linkedin}</a>
        ${MAIRIE.whatsapp ? `<a href="https://wa.me/${MAIRIE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.wa}</a>` : ""}
        <a href="contact.html" aria-label="Écrire à la mairie">${ICONS.mail}</a>
      </div>
    </div>
    <div><h4>La commune</h4><ul>
      <li><a href="mairie.html">Le maire & ses adjoints</a></li><li><a href="arrondissements.html">Les 6 mairies d'arrondissement</a></li><li><a href="projets.html">Projets & programme « 3A »</a></li><li><a href="transparence.html">Budget & transparence</a></li><li><a href="actualites.html">Actualités & avis</a></li>
    </ul></div>
    <div><h4>Services en ligne</h4><ul>
      <li><a href="demarches.html?c=etat-civil">État civil</a></li><li><a href="demarches.html?d=rdv#demande">Rendez-vous au guichet</a></li><li><a href="payer.html">Payer une taxe</a></li><li><a href="payer.html#verifier">Vérifier une vignette QR</a></li><li><a href="demarches.html?d=signalement#demande">Signaler un problème</a></li><li><a href="demarches.html#suivi">Suivre, payer, télécharger</a></li>
    </ul></div>
    <div><h4>Espace numérique</h4>
      <ul><li><a href="espace.html?role=cabinet">Cabinet du maire</a></li><li><a href="espace.html?role=services">Services municipaux</a></li><li><a href="espace.html?role=recettes">Recettes & e-Tax</a></li><li><a href="espace.html?role=arrondissement">Mairies d'arrondissement</a></li></ul>
      <div class="staff-box"><b>Vous êtes agent municipal ?</b><p>Accédez au back-office pour traiter les demandes, encaisser, contrôler les vignettes et suivre vos indicateurs.</p><a class="btn btn-orange btn-sm" href="espace.html">${ICONS.lock} Accès agents</a></div>
    </div>
  </div>
  <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${MAIRIE.nom} · ${MAIRIE.adresse}</span><span class="paylogos"><span class="plogo airtel">airtel money</span><span class="plogo moov">moov money</span><span class="plogo carte">VISA · MC</span> Paiement en ligne sécurisé</span></div>
  <p class="credits">Photos de la ville : Wikimedia Commons (Shirmy25, Christian Vigna, Delrick Trevor, Tarik Esnow), licence <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" target="_blank" rel="noopener">CC BY-SA 4.0</a> ; photos d'actualité : presse gabonaise citée. Version de démonstration.</p>
  <div class="foot-credit">© ${new Date().getFullYear()} Tous droits réservés · Site conçu et développé par <b>Rouana</b></div>
  </div></footer>
  ${MAIRIE.whatsapp ? `<a class="wa" href="https://wa.me/${MAIRIE.whatsapp}?text=${encodeURIComponent("Bonjour, je souhaite un renseignement auprès de la Mairie de Libreville.")}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">${ICONS.wa}</a>`
    : `<a class="wa fab-sig" href="demarches.html?d=signalement#demande" aria-label="Signaler un problème">${ICONS.alert}<span>Signaler</span></a>`}
  <button class="totop" aria-label="Haut de page">↑</button>
  <nav class="tabbar" aria-label="Accès rapides">
    <a href="index.html" class="${page === "index" ? "on" : ""}">${ICONS.home}<span>Accueil</span></a>
    <a href="demarches.html" class="${page === "demarches" ? "on" : ""}">${ICONS.file}<span>Démarches</span></a>
    <a href="payer.html" class="mid ${page === "payer" ? "on" : ""}"><span class="ib">${ICONS.qr}</span><span>Payer</span></a>
    <a href="demarches.html?d=signalement#demande">${ICONS.alert}<span>Signaler</span></a>
    <a href="demarches.html#suivi">${ICONS.search}<span>Suivi</span></a>
  </nav>`;
  if (page !== "espace") document.body.classList.add("has-tabbar");
}

function initChrome() {
  const header = $(".header"), prog = $(".progress"), top = $(".totop");
  const onScroll = () => {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    header && header.classList.toggle("scrolled", y > 30);
    if (prog) prog.style.width = (H > 0 ? (y / H) * 100 : 0) + "%";
    top && top.classList.toggle("on", y > 600);
  };
  addEventListener("scroll", onScroll, {passive:true}); onScroll();
  top && top.addEventListener("click", () => scrollTo({top:0, behavior:"smooth"}));
  const b = $(".burger"), nav = $("#nav");
  if (!b || !nav) return;
  const closeNav = fromPop => {
    if (!nav.classList.contains("open")) return;
    nav.classList.remove("open"); b.classList.remove("on"); b.setAttribute("aria-expanded", false); document.body.classList.remove("nav-open");
    if (!fromPop) Back.close(closeNav);
  };
  const openNav = () => { nav.classList.add("open"); b.classList.add("on"); b.setAttribute("aria-expanded", true); document.body.classList.add("nav-open"); Back.open(closeNav); };
  b.addEventListener("click", () => nav.classList.contains("open") ? closeNav() : openNav());
  $(".nav-back", nav).addEventListener("click", () => closeNav());
  addEventListener("resize", () => { if (innerWidth > 1020) closeNav(); });
}

/* ---------- Animations ---------- */
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.12});
  $$(".rv:not(.in)").forEach(el => io.observe(el));
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.done) return; co.unobserve(e.target); e.target.dataset.done = 1;
    const el = e.target, to = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = (dec ? v.toFixed(dec).replace(".", ",") : Math.round(v).toLocaleString("fr-FR")) + (el.dataset.suffix || ""); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), {threshold:.1});
  $$("[data-count]:not([data-done])").forEach(el => co.observe(el));
}

function initHero() {
  const figs = $$(".hero-slides figure"); if (!figs.length) return;
  const dots = $(".hero-dots"); let i = 0, h;
  dots.innerHTML = figs.map((_, k) => `<button aria-label="Diapositive ${k+1}" class="${k?"":"on"}"></button>`).join("");
  const go = k => { figs[i].classList.remove("on"); dots.children[i].classList.remove("on"); i = (k + figs.length) % figs.length; figs[i].classList.add("on"); dots.children[i].classList.add("on"); };
  const play = () => { clearInterval(h); h = setInterval(() => go(i + 1), 6500); };
  [...dots.children].forEach((d, k) => d.addEventListener("click", () => { go(k); play(); }));
  play();
}

/* ---------- Démarches ---------- */
function demCard(d) {
  const c = CAT_DEM[d.cat];
  return `<article class="fcard dcard rv" data-cat="${d.cat}" style="--c:${c.c}"><span class="tag" style="background:color-mix(in srgb,${c.c} 12%,#fff);color:${c.c}">${c.l}</span>
    <div class="ic">${ICONS[d.ic]}</div><h3>${d.t}</h3><p>${d.d}</p>
    <div class="dmeta"><span class="price ${d.prix ? "" : "free"}">${fcfa(d.prix)}</span>${d.doc ? `<span class="dl">${ICONS.dl} Téléchargeable</span>` : ""}</div>${d.acte ? `<p class="dauth">${ICONS.shieldok}<span>100 % en ligne si votre acte est authentifié</span></p>` : ""}
    <div class="dact"><button class="more" data-dem="${d.id}">Pièces à prévoir</button><a class="btn btn-orange btn-sm" href="demarches.html?d=${d.id}#demande">${d.signal ? "Signaler" : "Faire la demande"}</a></div></article>`;
}
function initDemarches() {
  const box = $("#dem-grid"); if (!box) return;
  const limit = +box.dataset.limit || 0, tabs = $("#dem-tabs");
  const render = cat => {
    let list = DEMARCHES.filter(d => cat === "tout" || d.cat === cat); if (limit) list = list.slice(0, limit);
    box.innerHTML = list.map(demCard).join("");
    requestAnimationFrame(() => $$(".rv", box).forEach((el, k) => setTimeout(() => el.classList.add("in"), k * 40)));
  };
  if (tabs) {
    const counts = {tout:DEMARCHES.length}; DEMARCHES.forEach(d => counts[d.cat] = (counts[d.cat] || 0) + 1);
    const opts = [["tout","Toutes"], ...Object.entries(CAT_DEM).map(([k, v]) => [k, v.l])];
    tabs.innerHTML = opts.map(([k, l]) => `<button class="tab" data-n="${k}">${l}<span class="n">${counts[k] || 0}</span></button>`).join("");
    const set = k => { $$(".tab", tabs).forEach(t => t.classList.toggle("on", t.dataset.n === k)); render(k); };
    tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) set(t.dataset.n); });
    const st = new URLSearchParams(location.search).get("c"); set(CAT_DEM[st] ? st : "tout");
  } else render("tout");
  box.addEventListener("click", e => {
    const b = e.target.closest("[data-dem]"); if (!b) return;
    const d = DEMARCHES.find(x => x.id === b.dataset.dem);
    modal(d.t, `<p class="chip info" style="margin-bottom:1rem">${CAT_DEM[d.cat].l} · Service : ${d.service}</p><p class="lead-p">${d.d}</p>
      <div class="kv" style="margin-top:1rem"><div><small>Tarif</small><b>${fcfa(d.prix)}</b></div><div><small>Paiement</small><b>${d.prix ? "En ligne ou à la mairie" : "—"}</b></div><div><small>Document</small><b>${d.doc ? "Téléchargeable en PDF" : "Retrait au guichet"}</b></div></div>
      <h4 style="margin:1rem 0 .6rem;color:var(--navy)">À prévoir (vous pouvez les joindre en ligne)</h4><ul class="checks" style="margin:0 0 1rem">${d.pieces.map(p => `<li>${p}</li>`).join("")}</ul>
      <p style="color:var(--muted);font-size:.84rem">${PAIEMENT.note} Liste indicative : le service peut demander une pièce complémentaire.</p>
      <div style="display:flex;gap:.6rem;margin-top:1.4rem;flex-wrap:wrap"><a class="btn btn-orange" href="demarches.html?d=${d.id}#demande">${d.signal ? "Signaler maintenant" : "Faire la demande en ligne"}</a></div>`);
  });
}

function initDemandeForm() {
  const form = $("#demande-form"); if (!form) return;
  const sel = $("[name=type]", form), sig = $("#sig-fields", form), std = $("#std-fields", form), ts = $("[name=sigtype]", form), qList = $("#quartiers");
  sel.innerHTML = '<option value="">— Choisir une démarche —</option>' + Object.entries(CAT_DEM).map(([k, c]) => `<optgroup label="${c.l}">${DEMARCHES.filter(d => d.cat === k).map(d => `<option value="${d.id}">${d.t}${d.prix ? " — " + fcfa(d.prix) : ""}</option>`).join("")}</optgroup>`).join("");
  ts.innerHTML = TYPES_SIGNAL.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  qList.innerHTML = QUARTIERS.map(q => `<option value="${q}">`).join("");
  const arrSel = $("[name=arr]", form); arrSel.innerHTML = '<option value="">— Choisir —</option>' + ARRONDISSEMENTS.map(a => `<option value="${a.n}">${a.t} (${a.nom})</option>`).join("");
  // Le quartier saisi propose automatiquement l'arrondissement
  $("[name=quartier]", form).addEventListener("change", e => { const n = QUARTIER_ARR[e.target.value.trim().toLowerCase()]; if (n && !arrSel.value) { arrSel.value = n; toast(`${e.target.value} : ${arrL(n)} sélectionné.`); } });
  const rf = $("#rdv-fields", form);
  const drawSlots = async () => {
    if (!rf || rf.hidden) return;
    const jour = $("#rdvjour", form).value, a = arrSel.value || 1, box = $("#slots", form);
    let pris = []; try { pris = await Store.rdvPris(a, jour); } catch (e) {}
    const d = new Date(jour + "T12:00:00"), closed = d.getDay() === 0 || d.getDay() === 6;
    box.innerHTML = closed ? '<p class="imgnote">Les guichets sont fermés le week-end : choisissez un autre jour.</p>' : CRENEAUX.map(h => `<button type="button" data-h="${h}" ${pris.includes(h) ? "disabled title=\"Déjà réservé\"" : ""}>${h}</button>`).join("");
    $("[name=rdvheure]", form).value = "";
  };
  if (rf) {
    const j = $("#rdvjour", form), t0 = new Date(Date.now() + 864e5); while (t0.getDay() === 0 || t0.getDay() === 6) t0.setDate(t0.getDate() + 1);
    j.min = t0.toISOString().slice(0, 10); j.value = j.min; j.max = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    j.addEventListener("change", drawSlots); arrSel.addEventListener("change", drawSlots);
    $("#slots", form).addEventListener("click", e => { const b = e.target.closest("[data-h]"); if (!b) return; $$("#slots button", form).forEach(x => x.classList.toggle("on", x === b)); $("[name=rdvheure]", form).value = b.dataset.h; });
  }
  bindFileList($("#pj", form), $("#pj-list", form));
  const cur = () => DEMARCHES.find(x => x.id === sel.value);
  const af = $("#acte-fields", form), ta = $("#typeActe", form);
  if (ta) ta.innerHTML = TYPES_DOC.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  const verif = async () => {
    const d = cur(), res = $("#acte-res", form), num = $("#numActe", form).value, nom = $("#nomActe", form).value || $("#nom", form).value;
    if (!num.trim()) { res.innerHTML = ""; return null; }
    const type = d.acte === "tout" ? ta.value : d.acte;
    res.innerHTML = '<p class="empty" style="padding:.6rem">Vérification…</p>';
    let a = null; try { a = await Store.verifDoc(num, nom, type); } catch (e) {}
    res.innerHTML = a ? acteBadge({...a, num}) : acteBadge({numAff:num, type, statut:"En attente"}) + '<small class="imgnote">Numéro pas encore connu de la plateforme : il sera inscrit avec votre demande.</small>';
    return a;
  };
  if (af) { $("#verif", form).onclick = verif; $("#numActe", form).addEventListener("change", verif); }
  const sync = () => {
    const d = cur(), isSig = !!(d && d.signal);
    if (af) {
      af.hidden = !(d && d.acte); $("#numActe", form).required = !!(d && d.acte); $("#acte-res", form).innerHTML = "";
      if (d && d.acte) { $("#ta-field", form).hidden = d.acte !== "tout"; $("#acte-label", form).textContent = d.acte === "tout" ? "Numéro du document" : "Numéro de votre " + typeDocL(d.acte).toLowerCase(); }
    }
    sig.hidden = !isSig; std.hidden = isSig;
    if (rf) { rf.hidden = !(d && d.rdv); $("[name=rdvheure]", form).required = !!(d && d.rdv); drawSlots(); }
    $$("input,select,textarea", sig).forEach(i => i.required = isSig && i.dataset.req === "1");
    $("#dem-info").innerHTML = d ? `${d.lien ? `<p class="alert-box ok" style="margin-bottom:.8rem">${ICONS.qr}<span>Plus rapide : <a href="${d.lien}" style="text-decoration:underline;font-weight:700">payez directement votre vignette en ligne</a> et recevez-la immédiatement avec son QR code.</span></p>` : ""}<b>${d.t}</b> — ${d.d}<br><small>À prévoir : ${d.pieces.join(" · ")}</small><div class="dmeta" style="margin-top:.6rem"><span class="price ${d.prix ? "" : "free"}">${fcfa(d.prix)}</span>${d.doc ? `<span class="dl">${ICONS.dl} Document téléchargeable en PDF</span>` : ""}</div>` : "";
    $("#pj-label").textContent = isSig ? "Photos du problème (facultatif, 3 maximum)" : "Pièces justificatives (facultatif : photos ou PDF, 3 maximum)";
    const pay = $("#pay-step");
    if (!d) return;
    pay.innerHTML = d.prix ? `<p class="lead-p">Montant de la démarche : <b class="price">${fcfa(d.prix)}</b></p>
      <div class="paychoice">${PAIEMENT.modes.map((m, i) => `<label class="pc"><input type="radio" name="payer" value="${m.id}" ${i ? "" : "checked"}><span class="plogo ${m.id}">${payLogo(m.id)}</span><span><b>Payer maintenant · ${m.l}</b><small>${m.s} — votre document sera téléchargeable dès qu'il est prêt</small></span></label>`).join("")}
      <label class="pc"><input type="radio" name="payer" value="guichet"><span class="plogo guichet">${ICONS.building}</span><span><b>Payer à la mairie</b><small>${PAIEMENT.guichet}. Vous pourrez aussi payer en ligne plus tard depuis le suivi.</small></span></label></div>
      <p style="font-size:.8rem;color:var(--muted)">${PAIEMENT.note}</p>`
      : `<div class="alert-box ok">${ICONS.check}<span>Cette démarche est <b>gratuite</b> : aucun paiement n'est demandé.</span></div>`;
  };
  sel.addEventListener("change", sync);
  const pre = new URLSearchParams(location.search).get("d"); if (pre && DEMARCHES.some(d => d.id === pre)) sel.value = pre;
  sync();
  const steps = $$(".fstep", form), bars = $$(".steps span", form); let s = 0;
  const show = k => { s = k; steps.forEach((x, j) => x.classList.toggle("on", j === k)); bars.forEach((b, j) => b.classList.toggle("on", j <= k)); };
  const valid = () => { const bad = $$("[required]", steps[s]).find(i => !i.closest("[hidden]") && !i.checkValidity()); if (bad) { bad.reportValidity(); return false; } return true; };
  form.addEventListener("click", e => {
    if (e.target.closest("[data-next]") && valid()) show(s + 1);
    if (e.target.closest("[data-prev]")) show(s - 1);
  });
  form.addEventListener("submit", async e => {
    e.preventDefault(); if (!valid()) return;
    const f = Object.fromEntries(new FormData(form)), d = cur();
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Envoi…";
    const reset = () => { btn.disabled = false; btn.textContent = "Valider ma demande"; };
    let ref, pj;
    try { pj = await readFiles($("#pj", form)); } catch (err) { reset(); return toast(err.message, "err"); }
    const online = d.prix && f.payer && f.payer !== "guichet";
    try {
      if (d.signal) {
        const t = TYPES_SIGNAL.find(x => x[0] === f.sigtype);
        ref = await Store.submitSignalement({type:f.sigtype, typeLabel:t[1], arr:+f.arr, quartier:f.quartier, lieu:f.lieu, description:f.description, prenom:f.prenom, nom:f.nom, tel:f.tel, priorite:"Normale", pj});
      } else {
        ref = await Store.submitDemande({...(d.rdv ? {rdv:{jour:f.rdvjour, heure:f.rdvheure}} : {}), ...(d.acte && f.numActe ? {numActe:f.numActe, nomActe:f.nomActe || f.nom, typeActe:d.acte === "tout" ? f.typeActe : d.acte} : {}), type:d.id, typeLabel:d.t, service:d.service, arr:+f.arr, prenom:f.prenom, nom:f.nom, tel:f.tel, email:f.email, quartier:f.quartier, details:f.details, montant:d.prix || 0, paiement:d.prix ? {choix:online ? "en ligne" : "guichet", statut:"À régler"} : {statut:"Gratuit"}, pj, document:null});
      }
    } catch (err) { reset(); return toast("Envoi impossible : " + err.message, "err"); }
    reset(); ss("lbv_suivi", JSON.stringify({ref, tel:f.tel}));
    const sent = d.acte && f.numActe ? await Store.suivi(ref, f.tel) : null;
    form.reset(); sel.value = ""; $("#pj-list").innerHTML = ""; sync(); show(0);
    if (online) {
      const r = await Store.suivi(ref, f.tel);
      const mode = PAIEMENT.modes.find(m => m.id === f.payer);
      setTimeout(() => $$(".paytab").find(b => b.dataset.m === mode.id)?.click(), 30);
      const paid = await payFlow(r, f.tel); paidModal(paid); return;
    }
    if (d.rdv) { const r = await Store.suivi(ref, f.tel); modal("Rendez-vous confirmé ✅", `<p class="lead-p">Merci <b>${escH(f.prenom)}</b> ! Votre créneau est réservé. Présentez ce ticket (ou son numéro) à l'accueil : vous serez reçu(e) sans faire la queue.</p>${rdvTicket(r)}<a class="btn btn-navy" href="demarches.html#suivi" id="gos">${ICONS.search} Retrouver mon rendez-vous</a>`); drawQRs(); $("#gos").onclick = () => { closeModal(); setTimeout(() => window.__suivi && window.__suivi(ref), 50); }; return; }
    modal(d.signal ? "Signalement transmis ✅" : "Demande enregistrée ✅", `<p class="lead-p">Merci <b>${escH(f.prenom)}</b> ! ${d.signal ? "Votre signalement a été transmis aux services techniques." : `Votre demande « <b>${d.t}</b> » a été transmise au service ${d.service} (${arrL(f.arr)}).`}${pj.length ? ` ${pj.length} pièce(s) jointe(s) reçue(s).` : ""}</p>
      <div class="panel" style="margin:1.2rem 0;box-shadow:none;text-align:center"><small style="color:var(--muted)">Votre numéro de dossier</small><div class="refbig">${ref}</div><small style="color:var(--muted)">Notez-le avec votre numéro de téléphone : ils vous permettent de suivre${d.prix ? ", payer" : ""} et télécharger.</small></div>
      ${sent && sent.acte ? acteBadge(sent.acte) : ""}
      ${d.prix ? `<p class="alert-box warn">${ICONS.wallet}<span>Montant à régler : <b>${fcfa(d.prix)}</b> — à la mairie, ou en ligne à tout moment depuis le suivi.</span></p>` : ""}
      <a class="btn btn-navy" href="demarches.html#suivi" id="gos">${ICONS.search} Suivre mon dossier</a>`);
    $("#gos").onclick = () => { closeModal(); setTimeout(() => window.__suivi && window.__suivi(ref), 50); };
  });
  show(0);
}

function initSuivi() {
  const form = $("#suivi-form"); if (!form) return;
  const out = $("#suivi-out");
  const render = r => {
    const done = /Remise|Résolu|Prête/.test(r.statut), bad = /Rejet|manquante/.test(r.statut);
    const dem = DEMARCHES.find(x => x.id === r.typeId) || {};
    const p = r.paiement || {}, paid = p.statut === "Payé" || p.statut === "Gratuit" || !r.montant;
    const ready = /Prête|Remise/.test(r.statut) && r.document;
    let payBox = "", docBox = "";
    if (r.montant && p.statut !== "Payé") payBox = `<div class="sbox warn"><div><b>${ICONS.wallet} Montant à régler : ${fcfa(r.montant)}</b><small>Payez en ligne maintenant ou au guichet de la mairie.</small></div><div class="mini-btns">${PAIEMENT.modes.map(m => `<button class="btn btn-orange btn-sm" data-pay="${m.id}">${m.l}</button>`).join("")}</div></div>`;
    else if (r.montant) payBox = `<div class="sbox ok"><div><b>${ICONS.check} Payé : ${fcfa(r.montant)}</b><small>${escH(p.mode || "")} · ${p.date ? fdate(p.date) : ""} · quittance ${escH(p.quittance || "")}</small></div><button class="btn btn-line btn-sm" id="dlrecu">${ICONS.dl} Reçu (PDF)</button></div>`;
    if (dem.doc || (r.document && r.document.type === "fichier")) {
      if (ready && paid) docBox = `<div class="sbox doc"><div><b>${ICONS.file} Votre document est prêt</b><small>${escH(DOC_TITRES[r.typeId] || r.type)} — délivré le ${fdate(r.document.date || r.date)}</small></div><button class="btn btn-orange btn-sm" id="dldoc">${ICONS.dl} Télécharger (PDF)</button></div>`;
      else if (ready) docBox = `<div class="sbox"><div><b>${ICONS.file} Votre document est prêt</b><small>Réglez ${fcfa(r.montant)} pour le télécharger, ou retirez-le au guichet.</small></div></div>`;
      else if (!/Rejet/.test(r.statut)) docBox = `<div class="sbox"><div><b>${ICONS.clock} Document en préparation</b><small>Il sera téléchargeable ici dès que le service l'aura validé.</small></div></div>`;
    } else if (/Prête/.test(r.statut)) docBox = `<div class="sbox"><div><b>${ICONS.building} À retirer au guichet</b><small>Présentez-vous avec votre pièce d'identité et votre numéro de dossier.</small></div></div>`;
    out.innerHTML = `<div class="suivi-card"><div class="sh"><div><small>Dossier ${r.ref} · ${arrL(r.arr)}</small><h3>${escH(r.type)}</h3><small>Déposé le ${fdate(r.date)} par ${escH(r.prenom)} ${escH(r.nom)}</small></div><span class="chip ${done ? "ok" : bad ? "warn" : "info"}">${r.statut}</span></div>
      ${r.rdv ? rdvTicket(r) : ""}${r.acte ? acteBadge(r.acte) : ""}${payBox}${docBox}
      <h4 style="color:var(--navy);margin:1.4rem 0 1rem">Historique</h4>
      <div class="timeline">${r.historique.slice().reverse().map(h => `<div class="tl"><b>${fdate(h.date)}</b><h4>${h.statut}</h4><p>${escH(h.note)}</p></div>`).join("")}</div></div>`;
    drawQRs(out);
    $$("[data-pay]", out).forEach(b => b.onclick = async () => { const tel = form.tel.value; setTimeout(() => $$(".paytab").find(x => x.dataset.m === b.dataset.pay)?.click(), 30); const res = await payFlow(r, tel); paidModal(res); render(res); });
    const dr = $("#dlrecu", out); if (dr) dr.onclick = () => downloadRecu(r).catch(e => toast(e.message, "err"));
    const dd = $("#dldoc", out); if (dd) dd.onclick = async () => { dd.disabled = true; try { await downloadDocument(r); toast("Document téléchargé.", "ok"); Store.markDownloaded(r.ref, form.tel.value); } catch (e) { toast(e.message, "err"); } dd.disabled = false; };
  };
  const run = async (ref, tel) => {
    out.innerHTML = `<p class="empty">Recherche…</p>`;
    let r = null; try { r = await Store.suivi(ref, tel); } catch (e) { out.innerHTML = `<p class="empty">Service momentanément indisponible.</p>`; return; }
    if (!r) { out.innerHTML = `<div class="empty">${ICONS.search}<p>Aucun dossier ne correspond à ce numéro et à ce téléphone.<br>Vérifiez la saisie (ex. LBV-26-01234 ou SIG-26-0410).</p></div>`; return; }
    render(r);
  };
  form.addEventListener("submit", e => { e.preventDefault(); run(form.ref.value, form.tel.value); });
  let last = null; try { last = JSON.parse(ss("lbv_suivi") || "null"); } catch (e) {}
  window.__suivi = ref => { if (last || (last = JSON.parse(ss("lbv_suivi") || "null"))) { form.ref.value = last.ref; form.tel.value = last.tel; } $("#suivi").scrollIntoView({behavior:"smooth"}); run(form.ref.value, form.tel.value); };
  if (last) { form.ref.value = last.ref; form.tel.value = last.tel; if (location.hash === "#suivi") run(last.ref, last.tel); }
}

/* ---------- Arrondissements ---------- */
function arrCard(a, k) {
  return `<article class="arr-card rv d${k % 3}" id="arr${a.n}" style="--ac:${a.c}">
    <div class="an"><b>${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup></b><span>arrondissement</span></div>
    <div class="ab"><h3>Mairie du ${a.t} · ${a.nom}</h3><p class="am">${ICONS.users} Maire : <b>${a.maire}</b></p><p class="adj">Adjoints : <b>${a.adj.join("</b> · <b>")}</b></p><p>${a.d}</p>
    <div class="qs">${a.reperes.map(q => `<span>${q}</span>`).join("")}</div>
    <div class="aa"><a class="btn btn-sm btn-navy" href="arrondissements.html#arr${a.n}" data-focus="${a.n}">Voir l'arrondissement</a><a class="btn btn-sm btn-line" href="demarches.html?d=signalement#demande">Signaler</a>${a.fb ? `<a class="btn btn-sm btn-line" href="${a.fb}" target="_blank" rel="noopener">${ICONS.fb} Facebook</a>` : ""}</div></div></article>`;
}
function initArr() {
  const box = $("#arr-grid");
  if (box) box.innerHTML = ARRONDISSEMENTS.map(arrCard).join("");
  const home = $("#arr-home");
  if (home) home.innerHTML = ARRONDISSEMENTS.map((a, k) => `<a class="arr-mini rv d${k % 3}" style="--ac:${a.c}" href="arrondissements.html#arr${a.n}"><span class="n">${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup></span><span><b>${a.t} · ${a.nom}</b><small>${a.maire} · ${a.reperes.slice(1, 3).join(", ").replace(/ \(.*?\)/g, "")}</small></span>${ICONS.arrow}</a>`).join("");
  const fx = $("#arr-focus"); if (!fx) return;
  const tabs = $("#arr-tabs");
  tabs.innerHTML = ARRONDISSEMENTS.map(a => `<button class="tab" data-n="${a.n}">${a.n}<sup>${a.n === 1 ? "er" : "e"}</sup>&nbsp;${a.nom}</button>`).join("");
  const set = n => {
    const a = ARRONDISSEMENTS.find(x => x.n === n);
    $$(".tab", tabs).forEach(t => t.classList.toggle("on", +t.dataset.n === n));
    $$(".lbvmap .zone").forEach(z => z.classList.toggle("on", +z.dataset.n === n));
    const proj = PROJETS.filter(p => p.arr === n || (p.arrs || []).includes(n));
    fx.innerHTML = `<div class="focus">
      <div class="fimg"><img src="${IMG(a.img)}" alt="" loading="lazy"><span class="badge"><b>≈ 230 M</b> FCFA de dotation 2026</span></div>
      <div><span class="eyebrow">Mairie du ${a.t} · ${a.nom}</span><h2>${a.maire}</h2><p class="adj" style="margin-bottom:.8rem">Maire d'arrondissement · 1er adjoint : <b>${a.adj[0]}</b> · 2e adjoint : <b>${a.adj[1]}</b> · Siège : ${a.siege}</p><p class="lead-p">${a.d}</p>
        <h4>Quartiers et repères</h4><div class="qs">${a.reperes.map(q => `<span>${q}</span>`).join("")}</div>
        <h4>Actions récentes</h4><div class="timeline">${a.actions.map(x => `<div class="tl"><b>${fdate(x.date)}</b><p style="color:var(--ink)">${x.t}</p><a class="src" href="${x.url}" target="_blank" rel="noopener">${x.src} ${ICONS.ext}</a></div>`).join("")}</div>
        <h4>Comme dans les six arrondissements</h4><ul class="checks">${COMMUN_ARR.map(c => `<li>${c}</li>`).join("")}</ul>
        ${proj.length ? `<h4>Projets</h4><div class="qs">${proj.map(p => `<span>${p.t}</span>`).join("")}</div>` : ""}
        <div class="aa" style="margin-top:1.2rem"><a class="btn btn-orange" href="demarches.html#demande">Démarches en ligne</a><a class="btn btn-line" href="demarches.html?d=rdv#demande">${ICONS.ticket} Rendez-vous</a><a class="btn btn-line" href="demarches.html?d=audience#demande">Demander une audience</a>${a.fb ? `<a class="btn btn-line" href="${a.fb}" target="_blank" rel="noopener">${ICONS.fb} Facebook</a>` : ""}</div>
      </div></div>`;
  };
  tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) { set(+t.dataset.n); history.replaceState(null, "", "#arr" + t.dataset.n); } });
  window.__arrSet = n => { set(n); history.replaceState(null, "", "#arr" + n); };
  document.addEventListener("click", e => { const f = e.target.closest("[data-focus]"); if (f) { e.preventDefault(); set(+f.dataset.focus); history.replaceState(null, "", "#arr" + f.dataset.focus); $("#focus-sec").scrollIntoView({behavior:"smooth"}); } });
  const h = +(location.hash.match(/arr(\d)/) || [])[1];
  set(h >= 1 && h <= ARRONDISSEMENTS.length ? h : 1);
  if (h) setTimeout(() => $("#focus-sec").scrollIntoView(), 300);
}

/* ---------- Vérifier un document authentifié ---------- */
function initAuthCheck() {
  const form = $("#auth-form"); if (!form) return;
  $("[name=type]", form).innerHTML = TYPES_DOC.map(([k, l]) => `<option value="${k}">${l}</option>`).join("");
  form.addEventListener("submit", async e => {
    e.preventDefault(); const out = $("#auth-out");
    out.innerHTML = '<p class="empty">Vérification…</p>';
    let a = null; try { a = await Store.verifDoc(form.num.value, form.nom.value, form.type.value); } catch (err) {}
    out.innerHTML = a ? acteBadge(a, true) + `<p class="imgnote" style="margin-top:.6rem">Titulaire : <b>${escH(a.titulaire)}</b></p>`
      : `<div class="auth-badge wait big"><span class="shield">${ICONS.shield}</span><span><b>Numéro non encore authentifié</b><small>Faites votre prochaine démarche en ligne en indiquant ce numéro, puis présentez l'original une seule fois au guichet de votre mairie d'arrondissement.</small></span></div>`;
  });
}

/* ---------- Projets ---------- */
function projCard(p) {
  const cls = {"Réalisé":"ok","En service":"ok","En cours":"info","Lancé":"info","Engagé":"info","Programmé":"warn","À l'étude":"neu"}[p.st];
  const where = p.arrs ? p.arrs.map(arrS).join(" & ") + " arrondissements" : p.arr ? arrL(p.arr) : "Les 6 arrondissements";
  return `<article class="ncard pcard rv"><div class="ph"><img src="${IMG(p.img)}" alt="${escH(p.t)}" loading="lazy"><span class="cat">${THEMES[p.th]}</span></div>
    <div class="bd"><div style="display:flex;gap:.4rem;flex-wrap:wrap"><span class="chip ${cls}">${p.st}</span><span class="chip neu">${where}</span></div><h3>${p.t}</h3><p>${p.d}</p>${p.note ? `<small class="imgnote">${p.note}</small>` : ""}</div></article>`;
}
function initProjets() {
  const box = $("#proj-grid"); if (!box) return;
  const limit = +box.dataset.limit || 0, tabs = $("#proj-tabs"), atabs = $("#proj-arr");
  let th = "tout", ar = 0;
  const render = () => {
    let list = PROJETS.filter(p => (th === "tout" || p.th === th) && (!ar || p.arr === 0 || p.arr === ar || (p.arrs || []).includes(ar)));
    if (limit) list = list.slice(0, limit);
    box.innerHTML = list.length ? list.map(projCard).join("") : `<p class="empty">Aucun projet pour ce filtre.</p>`;
    requestAnimationFrame(() => $$(".rv", box).forEach((el, k) => setTimeout(() => el.classList.add("in"), k * 50)));
  };
  if (tabs) {
    tabs.innerHTML = [["tout","Tous les thèmes"], ...Object.entries(THEMES)].map(([k, l]) => `<button class="tab ${k === "tout" ? "on" : ""}" data-n="${k}">${l}</button>`).join("");
    tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (!t) return; th = t.dataset.n; $$(".tab", tabs).forEach(x => x.classList.toggle("on", x === t)); render(); });
  }
  if (atabs) {
    atabs.innerHTML = [[0, "Toute la commune"], ...ARRONDISSEMENTS.map(a => [a.n, a.t])].map(([k, l]) => `<button class="tab ${k ? "" : "on"}" data-a="${k}">${l}</button>`).join("");
    atabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (!t) return; ar = +t.dataset.a; $$(".tab", atabs).forEach(x => x.classList.toggle("on", x === t)); render(); });
  }
  render();
}

/* ---------- Actualités, avis, galerie ---------- */
function newsCard(a, k) {
  return `<article class="ncard rv d${k%3}"><div class="ph"><img src="${IMG(a.img)}" alt="${escH(a.t)}" loading="lazy"><span class="cat">${a.cat}</span></div><div class="bd"><small class="ndate">${ICONS.cal}${a.mois || fdate(a.date)}</small><h3>${a.t}</h3><p>${a.d}</p><a class="src" href="${a.url}" target="_blank" rel="noopener">Source : ${a.src} ${ICONS.ext}</a></div></article>`;
}
function initNews() {
  const box = $("#news"); if (!box) return;
  const n = +box.dataset.limit || ACTUS.length;
  box.innerHTML = ACTUS.slice(0, n).map(newsCard).join("");
}
async function initAvis() {
  const box = $("#avis"); if (!box) return;
  try { await Store.initPublic(); } catch (e) {}
  const list = Store.publicationsPubliques().slice(0, +box.dataset.limit || 20);
  const cls = {"Communiqué":"info","Avis":"warn","Marché public":"ok","Recrutement":"ok","Actualité":"neu"};
  box.innerHTML = list.length ? list.map(p => `<article class="avis rv"><div class="ah"><span class="chip ${cls[p.type] || "neu"}">${p.type}</span><small>${fdate(p.date)} · ${arrL(+p.arr)}</small></div><h3>${escH(p.titre)}</h3><p>${escH(p.texte)}</p></article>`).join("")
    : `<p class="empty">Aucun avis publié pour le moment.</p>`;
  initReveal();
}
function initGallery() {
  const g = $("#gallery"); if (!g) return;
  const cats = {ville:"La ville", mairie:"La mairie", terrain:"Sur le terrain", evenements:"Événements"};
  g.innerHTML = GALERIE.map((p, k) => `<figure data-cat="${p.cat}" data-i="${k}"><img src="${IMG(p.img)}" alt="${p.t}" loading="lazy"><figcaption><small>${cats[p.cat]} · © ${p.cr}</small>${p.t}</figcaption></figure>`).join("");
  const f = $("#gallery-filters");
  if (f) {
    f.innerHTML = `<button class="tab on" data-c="all">Tout</button>` + Object.entries(cats).map(([k,v]) => `<button class="tab" data-c="${k}">${v}</button>`).join("");
    f.addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; $$(".tab", f).forEach(x => x.classList.toggle("on", x === b)); $$("figure", g).forEach(fig => fig.classList.toggle("hide", b.dataset.c !== "all" && fig.dataset.cat !== b.dataset.c)); });
  }
  const lb = document.createElement("div"); lb.className = "lightbox";
  lb.innerHTML = '<button class="lb-back" aria-label="Retour">' + BACK_ICON + '<span>Retour</span></button><button class="lb-x" aria-label="Fermer">×</button><button class="lb-p" aria-label="Précédente">‹</button><img alt=""><button class="lb-n" aria-label="Suivante">›</button><p></p>';
  document.body.appendChild(lb);
  let cur = 0;
  const vis = () => $$("figure:not(.hide)", g).map(x => +x.dataset.i);
  const hideLb = fromPop => { if (!lb.classList.contains("on")) return; lb.classList.remove("on"); document.body.classList.remove("ov-open"); if (!fromPop) Back.close(hideLb); };
  const show = i => { cur = i; $("img", lb).src = IMG(GALERIE[i].img); $("p", lb).textContent = GALERIE[i].t + " — © " + GALERIE[i].cr; if (!lb.classList.contains("on")) { lb.classList.add("on"); document.body.classList.add("ov-open"); Back.open(hideLb); } };
  const nav = d => { const v = vis(); show(v[(v.indexOf(cur) + d + v.length) % v.length]); };
  g.addEventListener("click", e => { const fig = e.target.closest("figure"); if (fig) show(+fig.dataset.i); });
  lb.addEventListener("click", e => { if (e.target.closest(".lb-x") || e.target.closest(".lb-back") || e.target === lb) hideLb(); if (e.target.matches(".lb-p")) nav(-1); if (e.target.matches(".lb-n")) nav(1); });
  document.addEventListener("keydown", e => { if (!lb.classList.contains("on")) return; if (e.key === "Escape") hideLb(); if (e.key === "ArrowLeft") nav(-1); if (e.key === "ArrowRight") nav(1); });
}

/* ---------- Espace numérique : accès rapides (accueil) ---------- */
function initAccess() {
  const showDemo = (window.ESM_CONFIG || {}).showDemo !== false;
  const link = e => `espace.html?role=${e.role}${showDemo ? "&demo=1" : ""}`;
  const q = $("#quick-access");
  if (q) q.innerHTML = `<span class="ql">${ICONS.lock} Espace numérique</span>` + ESPACES.map(e => `<a href="${link(e)}" class="qbtn">${ICONS[e.ic]}${e.t}</a>`).join("");
  const c = $("#access-cards");
  if (c) c.innerHTML = ESPACES.map((e, i) => `<article class="acard rv d${i}" style="--c:${e.c}">
      <div class="ah"><span class="aic">${ICONS[e.ic]}</span><span><h3>${e.t}</h3><small>${e.s}</small></span></div>
      <ul>${e.pts.map(p => `<li>${p}</li>`).join("")}</ul>
      ${showDemo ? `<div class="creds"><small>Compte de démonstration · ${e.demo.nom}</small><div><span>Identifiant <b>${e.demo.login}</b></span><span>Mot de passe <b>${e.demo.pwd}</b></span></div></div>` : ""}
      <a class="btn btn-sm acta" href="${link(e)}">${showDemo ? "Tester l'espace" : "Accéder à mon espace"} ${ICONS.arrow}</a>
    </article>`).join("");
}

/* ---------- Contact (avec pièces jointes) ---------- */
function initContact() {
  const form = $("#contact-form"); if (!form) return;
  bindFileList($("#cpj", form), $("#cpj-list", form));
  const dest = $("[name=arr]", form);
  if (dest) dest.innerHTML = `<option value="0">Mairie centrale (hôtel de ville)</option>` + ARRONDISSEMENTS.map(a => `<option value="${a.n}">Mairie du ${a.t}</option>`).join("");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Envoi…";
    try {
      const pj = await readFiles($("#cpj", form)), d = Object.fromEntries(new FormData(form)); delete d.pj; d.arr = +d.arr || 0; d.pj = pj;
      await Store.addContact(d); form.reset(); $("#cpj-list", form).innerHTML = "";
      toast(`Message envoyé${pj.length ? " avec " + pj.length + " pièce(s) jointe(s)" : ""} ! Il a été transmis à la mairie.`, "ok");
    } catch (err) { toast("Envoi impossible : " + err.message, "err"); }
    btn.disabled = false; btn.textContent = "Envoyer";
  });
  const ci = $("#contact-info");
  if (ci) {
    const items = [[ICONS.pin, "Adresse", MAIRIE.adresse]];
    MAIRIE.tels.forEach(t => items.push([ICONS.phone, "Téléphone", `<a href="tel:+241${t.replace(/\s/g,"").slice(1)}">${t}</a>`]));
    if (MAIRIE.email) items.push([ICONS.mail, "E-mail", `<a href="mailto:${MAIRIE.email}">${MAIRIE.email}</a>`]);
    if (MAIRIE.horaires) items.push([ICONS.clock, "Horaires", MAIRIE.horaires]);
    items.push([ICONS.fb, "Facebook", `<a href="${MAIRIE.facebook}" target="_blank" rel="noopener">Mairie de Libreville</a>`]);
    items.push([ICONS.linkedin, "LinkedIn", `<a href="${MAIRIE.linkedin}" target="_blank" rel="noopener">Mairie de Libreville</a>`]);
    items.push([ICONS.map, "Mairies d'arrondissement", `<a href="arrondissements.html">Les six mairies d'arrondissement</a>`]);
    items.push([ICONS.qr, "Payer une taxe, vérifier une vignette", `<a href="payer.html">e-Services de la commune</a>`]);
    items.push([ICONS.cal, "Rencontrer le maire", `<a href="demarches.html?d=audience#demande">Demander une audience en ligne</a>`]);
    items.push([ICONS.search, "Suivre, payer, télécharger", `<a href="demarches.html#suivi">Avec votre numéro de dossier</a>`]);
    ci.innerHTML = items.map(([ic, b, s]) => `<div class="citem"><span class="ic">${ic}</span><span><b>${b}</b><span>${s}</span></span></div>`).join("");
  }
}


/* =========================================================
   Libreville — fonctions ajoutées
   ========================================================= */
const QR_LIB = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
const JSQR_LIB = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
const siteBase = () => location.href.replace(/[#?].*$/, "").replace(/[^/]*$/, "");
const vigUrl = num => siteBase() + "payer.html?v=" + encodeURIComponent(num);
const fjour = d => new Date(d + (String(d).length === 10 ? "T12:00:00" : "")).toLocaleDateString("fr-FR", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
async function qrMake(text) { await loadScript(QR_LIB); const q = window.qrcode(0, "M"); q.addData(text); q.make(); return q; }
// Remplit tous les éléments [data-qr] avec un QR code SVG
async function drawQRs(root = document) {
  const els = $$("[data-qr]", root).filter(e => !e.dataset.done); if (!els.length) return;
  try { for (const e of els) { const q = await qrMake(e.dataset.qr); e.innerHTML = q.createSvgTag({cellSize:4, margin:2, scalable:true}); e.dataset.done = 1; } } catch (err) {}
}
// QR code dessiné dans un PDF (jsPDF) case par case
async function pdfQR(doc, text, x, y, size) {
  const q = await qrMake(text), n = q.getModuleCount(), c = size / n;
  doc.setFillColor(255, 255, 255); doc.rect(x - 2, y - 2, size + 4, size + 4, "F"); doc.setFillColor(0, 0, 0);
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) doc.rect(x + k * c, y + r * c, c + .05, c + .05, "F");
}
function rdvTicket(r) {
  if (!r || !r.rdv) return "";
  return `<div class="ticket"><div><small>Rendez-vous · mairie du ${escH(arrL(r.arr))}</small><b>${fjour(r.rdv.jour)}<br>à ${escH(r.rdv.heure)}</b><small>Ticket n°</small><b style="font-size:1rem;color:#fff">${escH(r.ref)}</b><small>${escH(r.prenom || "")} ${escH(r.nom || "")} · présentez-vous 10 min avant</small></div><div class="qrbox" data-qr="RDV ${escH(r.ref)} ${escH(r.rdv.jour)} ${escH(r.rdv.heure)}"></div></div>`;
}

/* ---------- Accueil : « Que voulez-vous faire ? », programme 3A ---------- */
function initDo() {
  const g = $("#do-grid"); if (!g) return;
  const T = [
    ["baby","Acte de naissance","Copie ou extrait, téléchargeable","demarches.html?d=naissance#demande","#0a5260"],
    ["wallet","Payer une taxe","Marché, vignette, domaine public","payer.html","#d9480f"],
    ["qr","Vérifier une vignette","Scanner le QR d'un taxi","payer.html#verifier","#1d6fb8"],
    ["ticket","Rendez-vous","Réserver son créneau au guichet","demarches.html?d=rdv#demande","#5b3fb3"],
    ["alert","Signaler","Ordures, caniveau, éclairage…","demarches.html?d=signalement#demande","#c99400"],
    ["search","Suivre mon dossier","Avec votre numéro","demarches.html#suivi","#0a8a55"],
  ];
  g.innerHTML = T.map(([ic, t, s, h, c], k) => `<a class="do rv d${k % 3}" href="${h}" style="--c:${c}"><span class="i">${ICONS[ic]}</span><b>${t}</b><small>${s}</small></a>`).join("");
}
function init3A() {
  const b = $("#p3a"); if (!b) return;
  b.innerHTML = PROG3A.map((p, k) => `<article class="rv d${k}" style="--c:${p.c}"><span class="big">A</span><span class="i">${ICONS[p.ic]}</span><h3>Une ville <span>${p.k.toLowerCase()}</span></h3><p>${p.d}</p><div class="qs">${p.tags.map(t => `<span>${t}</span>`).join("")}</div></article>`).join("");
}
function initExec() {
  const b = $("#exec"); if (!b) return;
  const ini = n => n.split(" ").filter(Boolean).map(x => x[0]).slice(0, 2).join("");
  b.innerHTML = EXECUTIF.map((p, k) => `<div class="p ${k ? "" : "lead"} rv d${k % 3}"><span class="av">${ini(p.nom)}</span><span><b>${p.nom}</b><small>${p.r}</small>${p.d ? `<em>${p.d}</em>` : ""}</span></div>`).join("");
}

/* ---------- Carte schématique des six arrondissements + « Trouver mon arrondissement » ---------- */
const MAP_ZONES = {
  1:{pts:"135,20 360,20 360,150 250,160 140,168", lx:250, ly:92},
  2:{pts:"250,160 360,150 360,300 250,300", lx:305, ly:230},
  3:{pts:"140,168 250,160 250,300 145,300", lx:196, ly:236},
  4:{pts:"145,300 300,300 300,500 156,500 150,420", lx:224, ly:404},
  5:{pts:"300,300 470,300 470,500 300,500", lx:385, ly:404},
  6:{pts:"360,20 585,20 585,500 470,500 470,300 360,300", lx:478, ly:170},
};
function mapSVG() {
  return `<svg class="lbvmap" viewBox="0 0 600 520" role="img" aria-label="Plan schématique des six arrondissements de Libreville">
    <defs><linearGradient id="seaG" x1="0" x2="1"><stop offset="0" stop-color="#bfe6ea"/><stop offset="1" stop-color="#e3f5f6"/></linearGradient></defs>
    <path d="M0 0H140C128 60 146 120 136 170S152 260 144 330 160 450 150 520H0Z" fill="url(#seaG)"/>
    <text class="sea-t" transform="translate(62 330) rotate(-90)">OCÉAN · ESTUAIRE</text>
    ${ARRONDISSEMENTS.map(a => { const z = MAP_ZONES[a.n]; return `<polygon class="zone" data-n="${a.n}" points="${z.pts}" fill="${a.c}" stroke-linejoin="round"><title>${a.t} · ${a.nom}</title></polygon>
      <text class="lbl" x="${z.lx}" y="${z.ly}" text-anchor="middle">${a.n}${a.n === 1 ? "er" : "e"}</text><text class="sub" x="${z.lx}" y="${z.ly + 22}" text-anchor="middle">${a.nom}</text>`; }).join("")}
  </svg>`;
}
function initMap() {
  const m = $("#lbvmap");
  if (m) {
    m.innerHTML = mapSVG();
    m.addEventListener("click", e => { const z = e.target.closest(".zone"); if (!z) return; const n = +z.dataset.n;
      if (window.__arrSet) { window.__arrSet(n); $("#focus-sec") && $("#focus-sec").scrollIntoView({behavior:"smooth"}); } else location.href = "arrondissements.html#arr" + n; });
  }
  const f = $("#finder"); if (!f) return;
  const inp = $("input", f), res = $(".res", f);
  const find = v => {
    const k = v.trim().toLowerCase(); if (!k) { res.innerHTML = ""; return; }
    const hits = [...new Set(Object.entries(QUARTIER_ARR).filter(([q]) => q.includes(k) || (k.length > 3 && k.includes(q))).map(([, n]) => n))];
    res.innerHTML = hits.length ? hits.map(n => { const a = ARRONDISSEMENTS.find(x => x.n === n); return `<div class="hit" style="--ac:${a.c}"><span class="n">${n}<sup>${n === 1 ? "er" : "e"}</sup></span><span><b>Mairie du ${a.t} · ${a.nom}</b><small>Maire : ${a.maire}</small></span><a class="btn btn-sm btn-navy" href="arrondissements.html#arr${n}" data-focus="${n}">Voir</a></div>`; }).join("")
      : `<p class="imgnote" style="margin-top:.6rem">Quartier non répertorié dans la liste de démonstration : la liste complète des quartiers sera fournie par la mairie.</p>`;
  };
  inp.addEventListener("input", () => find(inp.value));
  $(".chips", f).innerHTML = ["Louis","Mont-Bouët","Akébé","Glass","Awendjé","PK8"].map(q => `<button type="button">${q}</button>`).join("");
  $(".chips", f).addEventListener("click", e => { const b = e.target.closest("button"); if (b) { inp.value = b.textContent; find(b.textContent); } });
}

/* ---------- e-Services : payer une taxe, vérifier une vignette ---------- */
function vigCard(v) {
  if (!v) return `<div class="vcard" style="--vc:#7a8794"><div class="vh">${ICONS.alert}<span><b>Vignette introuvable</b><small>Aucune vignette ne correspond à ce numéro ou à cette immatriculation.</small></span></div><div class="vb"><p class="lead-p" style="font-size:.92rem">Le véhicule doit régulariser sa situation : la vignette s'achète en ligne en quelques minutes, ci-dessus.</p></div></div>`;
  const C = {Valide:["#0a8a55","shieldok","Vignette valide"], "Expirée":["#c0392b","alert","Vignette expirée"], Suspendue:["#d97706","alert","Vignette suspendue"]}[v.etat];
  return `<div class="vcard" style="--vc:${C[0]}"><div class="vh">${ICONS[C[1]]}<span><b>${C[2]}</b><small>${escH(v.num)} · ${escH(v.catL)}</small></span></div>
    <div class="vb"><div class="kv"><div><small>Immatriculation</small><b>${escH(v.plaque)}</b></div><div><small>Titulaire</small><b>${escH(v.titulaire)}</b></div><div><small>Valable du</small><b>${fdate(v.debut)}</b></div><div><small>Jusqu'au</small><b style="color:${C[0]}">${fdate(v.fin)}</b></div>${v.controle ? `<div><small>Dernier contrôle</small><b>${fdate(v.controle.date)} · ${escH(v.controle.lieu)}</b></div>` : ""}</div>
    <div class="qrbox" data-qr="${escH(vigUrl(v.num))}"></div></div></div>`;
}
async function downloadVignette(v, recu) {
  const doc = await newPdf();
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(6, 54, 63); doc.text("VIGNETTE DE TRANSPORT", 105, 52, {align:"center"});
  doc.setFillColor(13, 71, 161); doc.roundedRect(35, 60, 140, 70, 5, 5, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.text("COMMUNE DE LIBREVILLE · " + (v.catL || "").toUpperCase(), 45, 72);
  doc.setFillColor(255, 255, 255); doc.roundedRect(45, 78, 80, 24, 3, 3, "F");
  doc.setTextColor(230, 74, 25); doc.setFontSize(22); doc.text(v.num.replace(/^LBV-\w+-/, "N° "), 85, 94, {align:"center"});
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.text(v.num + "  ·  " + v.plaque, 45, 112); doc.text("Valable jusqu'au " + fdate(v.fin), 45, 120);
  await pdfQR(doc, vigUrl(v.num), 135, 76, 34);
  pdfRows(doc, 146, [["N° de vignette", v.num], ["Catégorie", v.catL], ["Immatriculation", v.plaque], ["Titulaire", v.titulaire], ["Valable du", fdate(v.debut)], ["Jusqu'au", fdate(v.fin)], ...(recu ? [["Quittance", recu.quittance], ["Payé par", recu.mode]] : [])]);
  pdfFoot(doc, verifCode(v.num));
  doc.save(`vignette-${v.num}.pdf`);
}
async function downloadTaxeRecu(r) {
  const doc = await newPdf();
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(6, 54, 63); doc.text("REÇU DE PAIEMENT · e-TAX", 105, 54, {align:"center"});
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(91, 107, 133); doc.text(`Quittance ${r.quittance}`, 105, 61, {align:"center"});
  const y = pdfRows(doc, 80, [["Taxe", r.taxe], ["Référence", r.vignette ? r.vignette.num + " · " + r.vignette.plaque : r.ref], ["Payé par", r.nom], ["Date", new Date(r.date).toLocaleString("fr-FR")], ["Moyen de paiement", r.mode], ["Transaction", r.transaction], ["Nature de la recette", r.nature]]);
  doc.setFillColor(226, 245, 236); doc.roundedRect(25, y + 4, 160, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(10, 138, 85); doc.text(`Montant réglé : ${pdfMoney(r.montant)}`, 105, y + 15.5, {align:"center"});
  await pdfQR(doc, "LBV QUITTANCE " + r.quittance + " " + r.montant, 25, y + 30, 28);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(91, 107, 133); doc.text("Ce QR code permet à un agent de vérifier le paiement : plus besoin d'intermédiaire ni d'espèces.", 58, y + 46);
  pdfFoot(doc, verifCode(r.quittance));
  doc.save(`recu-${r.quittance}.pdf`);
}
function initPayer() {
  const form = $("#tax-form"); if (!form) return;
  const grid = $("#taxgrid"), mp = $("#mpay");
  let cur = TAXES[0];
  grid.innerHTML = TAXES.map(t => `<button type="button" class="tax" data-t="${t.id}"><span class="i">${ICONS[t.ic]}</span><span><b>${t.t}</b><small>${t.s}</small><em>${fcfa(t.prix)}</em></span></button>`).join("");
  mp.innerHTML = PAIEMENT.modes.map((m, i) => `<label><input type="radio" name="mode" value="${m.l}" ${i ? "" : "checked"}><span class="plogo ${m.id}">${payLogo(m.id)}</span>${m.l}</label>`).join("");
  $("[name=arr]", form).innerHTML = `<option value="0">Toute la commune / je ne sais pas</option>` + ARRONDISSEMENTS.map(a => `<option value="${a.n}">${a.t} · ${a.nom}</option>`).join("");
  const sync = () => {
    $$(".tax", grid).forEach(b => b.classList.toggle("on", b.dataset.t === cur.id));
    $("#tref-l", form).textContent = cur.ref; $("[name=ref]", form).placeholder = cur.ph;
    const q = $("#tqte", form), many = cur.id === "place-j" || cur.id === "place-m";
    q.hidden = !many; $("#tqte-l", form).textContent = cur.id === "place-j" ? "Nombre de jours" : "Nombre de mois";
    const n = many ? Math.max(1, +$("[name=qte]", form).value || 1) : 1;
    $("#ttot", form).innerHTML = `<b class="price">${fcfa(cur.prix * n)}</b> <small style="color:var(--muted)">${cur.t}${n > 1 ? " × " + n : ""}</small>`;
  };
  grid.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (!b) return; cur = TAXES.find(t => t.id === b.dataset.t); sync(); });
  $("[name=qte]", form).addEventListener("input", sync);
  const pre = new URLSearchParams(location.search).get("t"); if (pre && TAXES.some(t => t.id === pre)) cur = TAXES.find(t => t.id === pre);
  sync();
  form.addEventListener("submit", async e => {
    e.preventDefault(); if (!form.reportValidity()) return;
    const f = Object.fromEntries(new FormData(form)), many = cur.id === "place-j" || cur.id === "place-m";
    const data = {taxe:cur.id, ref:f.ref, nom:f.nom, tel:f.tel, arr:+f.arr || 0, mode:f.mode, qte:many ? +f.qte || 1 : 1};
    const total = cur.prix * data.qte, isCard = /Carte/.test(f.mode);
    const m = modal("Paiement · " + fcfa(total), `<div class="paywait"><span class="spin"></span><p>${isCard ? "<b>Authentification 3-D Secure</b><br>Confirmation auprès de votre banque…" : `<b>Demande envoyée au ${escH(f.tel)}</b><br>Validez le paiement ${escH(f.mode)} sur votre téléphone…`}</p></div><p class="demo-pay">${ICONS.lock} Mode démonstration : aucun débit réel. En production, ce paiement est raccordé à la plateforme e-Tax de la commune (etax-libreville.ga) et à MADIGIPAIE.</p>`);
    m.dataset.lock = 1;
    let r; try { await new Promise(x => setTimeout(x, 2200)); r = await Store.payTaxe(data); } catch (err) { delete m.dataset.lock; modal("Paiement impossible", `<p class="alert-box">${ICONS.alert}<span>${escH(err.message)}</span></p>`); return; }
    delete m.dataset.lock; form.reset(); sync();
    modal("Paiement confirmé ✅", `<p class="lead-p">Merci <b>${escH(r.nom)}</b> ! Votre paiement est enregistré dans les recettes de la commune : aucun intermédiaire, aucune espèce.</p>
      ${r.vignette ? `<h4 style="color:var(--navy);margin:1rem 0 .6rem">Votre vignette numérique</h4>${vigCard(r.vignette)}` : ""}
      <div class="recu" style="margin-top:1rem"><div class="top"><div><small style="color:var(--muted)">Quittance</small><div class="refbig" style="font-size:1.3rem">${r.quittance}</div><small style="color:var(--muted)">${escH(r.taxe)} · ${escH(r.mode)} · ${escH(r.transaction)}</small></div><span class="amt">${fcfa(r.montant)}</span></div></div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem">${r.vignette ? `<button class="btn btn-orange" id="dlv">${ICONS.dl} Ma vignette (PDF)</button>` : ""}<button class="btn ${r.vignette ? "btn-line" : "btn-orange"}" id="dlq">${ICONS.dl} Reçu (PDF)</button></div>`);
    drawQRs($("#modal"));
    $("#dlq").onclick = () => downloadTaxeRecu(r).catch(x => toast(x.message, "err"));
    if (r.vignette) $("#dlv").onclick = () => downloadVignette(r.vignette, r).catch(x => toast(x.message, "err"));
  });

  // Vérifier une vignette
  const vf = $("#vig-form"), out = $("#vig-out");
  const verify = async q => {
    if (!q) return; vf.q.value = q; out.innerHTML = '<p class="empty">Vérification…</p>';
    let v = null; try { await Store.initPublic(); v = await Store.verifVignette(q); } catch (e) {}
    out.innerHTML = vigCard(v); drawQRs(out);
  };
  vf.addEventListener("submit", e => { e.preventDefault(); verify(vf.q.value); });
  // Exemples de démonstration
  Store.initPublic().catch(() => {}).then(() => {
    const db = Store.db().vignettes || [], exp = db.find(v => v.fin < new Date().toISOString().slice(0, 10));
    $("#vig-demo").innerHTML = `Démonstration : <button type="button" data-q="LBV-TX-0001">LBV-TX-0001</button> (valide) · <button type="button" data-q="GA 0001 LV">GA 0001 LV</button>${exp ? ` · <button type="button" data-q="${exp.num}">${exp.num}</button> (expirée)` : ""} · <button type="button" data-q="GA 9999 ZZ">GA 9999 ZZ</button> (inconnue)`;
  });
  $("#vig-demo").addEventListener("click", e => { const b = e.target.closest("[data-q]"); if (b) verify(b.dataset.q); });
  // Scanner avec la caméra
  const sb = $("#scan-btn"), box = $("#scanbox"); let stream = null, raf = 0;
  const stop = () => { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; box.hidden = true; box.innerHTML = ""; };
  sb.addEventListener("click", async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return toast("Caméra indisponible sur cet appareil : saisissez le numéro.", "err");
    try { await loadScript(JSQR_LIB); stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}); }
    catch (e) { return toast("Accès à la caméra refusé : saisissez le numéro de la vignette.", "err"); }
    box.hidden = false; box.innerHTML = `<video playsinline muted></video><span class="frame"></span><button type="button" class="btn btn-sm btn-line stop">Arrêter</button>`;
    $(".stop", box).onclick = stop;
    const v = $("video", box), c = document.createElement("canvas"), cx = c.getContext("2d", {willReadFrequently:true});
    v.srcObject = stream; await v.play().catch(() => {});
    const tick = () => {
      if (!stream) return;
      if (v.readyState >= 2) {
        c.width = v.videoWidth; c.height = v.videoHeight; cx.drawImage(v, 0, 0);
        const code = window.jsQR(cx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        if (code && code.data) { stop(); let q = code.data; try { q = new URL(q).searchParams.get("v") || q; } catch (e) {} if (navigator.vibrate) navigator.vibrate(80); verify(q); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
  });
  const pv = new URLSearchParams(location.search).get("v");
  if (pv) { verify(pv); setTimeout(() => $("#verifier").scrollIntoView({behavior:"smooth"}), 300); }
}

/* ---------- Transparence ---------- */
function initTransparence() {
  const k = $("#tr-kpis"); if (!k) return;
  const md = n => (n / 1e9).toFixed(2).replace(".", ",") + " Md";
  k.innerHTML = [[md(BUDGET.total), "FCFA : budget 2026 adopté le 30 avril"],["+ 5 Md", "FCFA par rapport à 2025"],["× 3,3", "dotation de chaque mairie d'arrondissement (70 → 230 M)"],["266 M", "FCFA générés par l'état civil numérique (janv.-juin 2026)"]]
    .map(([b, s], i) => `<div class="tr-kpi rv d${i % 3}"><b>${i === 2 ? "<em>" + b + "</em>" : b}</b><span>${s}</span></div>`).join("");
  $("#tr-chrono").innerHTML = BUDGET.chrono.map(c => `<div class="tl"><b>${c.m || fdate(c.date)}</b><p style="color:var(--ink)">${c.t}</p></div>`).join("");
  $("#tr-dot").innerHTML = ARRONDISSEMENTS.map(a => `<div class="r"><span><b style="text-align:left;display:block">${a.t}</b><small style="color:var(--muted)">${a.nom}</small></span><div class="bb"><i style="width:100%;background:${a.c}"></i><i style="width:${BUDGET.dotationAvant / BUDGET.dotation * 100}%;background:rgba(0,0,0,.28)"></i></div><b>≈ 230 M</b></div>`).join("") + `<p class="legend"><span><i style="background:rgba(0,0,0,.35)"></i>Dotation précédente : 70 M FCFA</span><span><i style="background:var(--blue)"></i>Dotation 2026 : environ 230 M FCFA</span></p>`;
  $("#tr-prio").innerHTML = BUDGET.priorites.map(p => `<li>${p}</li>`).join("");
  const docs = [["Budget primitif 2026","Adopté le 30 avril 2026"],["Délibérations du conseil municipal","Session d'avril 2026"],["Rapport des commissions d'audit (RH, contrats)","Annoncées en décembre 2025"],["Grille des tarifs municipaux (taxes, vignettes, actes)","À publier par délibération"],["Compte administratif 2025","À publier"]];
  $("#tr-docs").innerHTML = docs.map(([t, s]) => `<div class="doc">${ICONS.file}<span><b>${t}</b><small>${s}</small></span><span class="chip neu">À publier</span></div>`).join("");
  const cv = $("#tr-chart"); if (!cv) return;
  const dot = BUDGET.dotation * ARRONDISSEMENTS.length, masse = BUDGET.total * BUDGET.masse, autre = BUDGET.total - masse - dot;
  loadScript("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js").then(() => {
    const C = window.Chart; C.defaults.font.family = "Inter, system-ui, sans-serif"; C.defaults.color = "#5b6b85";
    new C(cv, {type:"doughnut", data:{labels:["Masse salariale (≈ 70 %)","Dotations des 6 arrondissements","Investissements, services et autres dépenses"], datasets:[{data:[masse, dot, autre], backgroundColor:["#06363f","#d9480f","#18a7b5"], borderColor:"#fff", borderWidth:3}]},
      options:{maintainAspectRatio:false, cutout:"58%", plugins:{legend:{position:"bottom", labels:{boxWidth:12}}, tooltip:{callbacks:{label:c => ` ${c.label} : ${md(c.raw)} FCFA (${Math.round(c.raw / BUDGET.total * 100)} %)`}}}}});
  }).catch(() => {});
}

/* ---------- Application installable (PWA) ---------- */
let _installEvt = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); _installEvt = e; });
function initInstall() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
  $$("[data-install]").forEach(b => b.addEventListener("click", async () => {
    if (_installEvt) { _installEvt.prompt(); const r = await _installEvt.userChoice.catch(() => null); _installEvt = null; if (r && r.outcome === "accepted") toast("Application installée sur votre téléphone ✅", "ok"); return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    modal("Installer « Mairie de Libreville »", `<p class="lead-p">Gardez la mairie dans votre poche : l'icône s'ajoute à votre écran d'accueil, comme une application, sans passer par un magasin d'applications.</p>
      <div class="howto" style="margin-top:1rem">${(ios ? [["Touchez le bouton <strong>Partager</strong> de Safari (carré avec une flèche)."],["Choisissez <strong>Sur l'écran d'accueil</strong>."],["Touchez <strong>Ajouter</strong> : c'est prêt."]] : [["Ouvrez le menu du navigateur <strong>⋮</strong> (en haut à droite)."],["Choisissez <strong>Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong>."],["Confirmez : l'icône de la mairie apparaît sur votre téléphone."]]).map(([t], i) => `<div><b class="n">${i + 1}</b><p>${t}</p></div>`).join("")}</div>`);
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome(); initChrome(); initHero(); initDemarches(); initDemandeForm(); initSuivi(); initAuthCheck(); initProjets(); initNews(); initGallery(); initArr(); initAccess(); initContact();
  initDo(); init3A(); initExec(); initMap(); initPayer(); initTransparence(); initInstall();
  initReveal(); initAvis();
});
