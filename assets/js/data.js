/* Mairie de Libreville — contenus du site (sources : dossier de recherche du 4 octobre 2026 + presse citée) */
const MAIRIE = {
  nom: "Mairie de Libreville",
  court: "Libreville",
  commune: "Commune de Libreville",
  province: "Estuaire",
  devise: "Capitale du Gabon",
  slogan: "La mairie de Libreville se digitalise pour mieux vous servir",
  adresse: "Hôtel de ville, boulevard Triomphal, Libreville, Gabon",
  maire: "Eugène Mba",
  election: "23 avril 2026",
  facebook: "https://www.facebook.com/MairieDeLibreville/",
  linkedin: "https://ga.linkedin.com/company/mairie-de-libreville",
  etax: "https://etax-libreville.ga/",
  // Coordonnées non publiées en ligne : à renseigner avec la mairie (laisser vide = élément masqué)
  tels: [],
  email: "",
  whatsapp: "",
  horaires: "",
  prefixe: "LBV",
};

const ICONS = {
  anchor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0020 0h-3"/></svg>',
  truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  brief:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
  scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a4 4 0 006 0zM18 7l-3 7a4 4 0 006 0z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7l5.7 5.7a8 8 0 11-11.4 0z"/></svg>',
  drill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l5 20M12 2L7 22M8.5 16h7M9.8 10h4.4M4 22h16"/></svg>',
  fish:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c3-5 9-6 13.5 0-4.5 6-10.5 5-13.5 0zM6.5 12L2 8v8z"/><circle cx="16" cy="11" r=".6" fill="currentColor"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  award:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><path d="M8.2 13.9L7 23l5-3 5 3-1.2-9.1"/></svg>',
  ship:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.4 17L22 10.5 12 7 2 10.5 4.6 17M12 2v5M8 4h8"/></svg>',
  cap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  hand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l2 2a1 1 0 003-3M14 14l2.5 2.5a1 1 0 003-3l-3.88-3.88a3 3 0 00-4.24 0l-.88.88a1 1 0 11-3-3l2.81-2.81a5.79 5.79 0 017.06-.87l.47.28a2 2 0 001.42.25L21 4M21 3l1 11h-2M3 3L2 14l6.5 6.5a1 1 0 003-3M3 4h8"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15zM4 19.5A2.5 2.5 0 006.5 22H20v-5"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1112 21.8zm8.4-18.2A11.8 11.8 0 002.1 17.8L.4 24l6.3-1.7A11.8 11.8 0 0024 12c0-3.2-1.2-6.1-3.5-8.4z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  mega:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 11-5.8-1.6"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  inbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>',
  out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
  baby:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3.2"/><path d="M6 21v-2a6 6 0 0112 0v2M9 13.5h6"/></svg>',
  ring:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="14" r="6"/><circle cx="15" cy="14" r="6"/><path d="M10 4l2-2 2 2"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>',
  light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>',
  road:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22L8 2M20 22L16 2M12 4v3M12 11v3M12 18v3"/></svg>',
  wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H5a2 2 0 010-4h13v4M3 5v14a2 2 0 002 2h15V7"/><circle cx="16" cy="14" r="1.5"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4a2 2 0 001-1.7z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16"/></svg>',
  crane:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h8M7 21V3l12 4H7M17 7v6M15 13h4v3h-4z"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/></svg>',
  stamp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 18h14v-3a3 3 0 00-3-3h-1V8a3 3 0 10-6 0v4H8a3 3 0 00-3 3z"/></svg>',
  gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l4-4M3.3 19a10 10 0 1117.4 0"/></svg>',
  shieldok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>',
};

Object.assign(ICONS, {
  qr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M17 20h4M20 17v4M14 20v1"/></svg>',
  scan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10"/></svg>',
  car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M3 17v-4l2-5a2 2 0 012-1.3h10A2 2 0 0119 8l2 5v4M6 13h12"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  store:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0zM5 13v8h14v-8M10 21v-5h4v5"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 014 13c0-6 7-10 16-10 0 9-4 16-10 16a6 6 0 01-1-.1M4 21c3-6 6-9 11-12"/></svg>',
  ticket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M13 6v2M13 11v2M13 16v2"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  phoneapp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
  linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11.02 5 2.5 2.5 0 01-.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z"/></svg>',
});

/* ---------- Les six arrondissements (même modèle pour chacun) ----------
   Maires et adjoints : installation des 19 et 20 novembre 2025 (Gabon Infos Live).
   Quartiers : repères indicatifs tirés de sources publiques, à valider avec chaque mairie. */
const SRC_INSTALL = {src:"Gabon Infos Live", url:"https://gaboninfoslive.com/2025/11/25/mise-en-place-des-nouvelles-equipes-municipales-a-libreville/"};
const SRC_BUDGET = {src:"Gabon Media Time", url:"https://gabonmediatime.com/mairie-de-libreville-un-budget-de-3077-milliards-fcfa-pour-tourner-la-page-de-la-crise/"};
const DOTATION = 230e6;
const COMMUN_ARR = [
  "Dotation 2026 portée de 70 à environ 230 millions FCFA",
  "Forages d'eau potable programmés au budget 2026",
  "Engins lourds pour la collecte des déchets",
  "État civil numérique et paiement électronique des taxes",
  "Démarches en ligne, suivi de dossier et documents téléchargeables",
];
const ARRONDISSEMENTS = [
  {n:1, t:"1er arrondissement", nom:"Haut-de-Gué-Gué", siege:"Haut-de-Gué-Gué", maire:"Stéphane Camille Sene Ingueza", adj:["Laeticia Ndoumbou Mengue","Josselyn Verdaly Mintsa Ango"], img:"bd-bord-de-mer", c:"#0e7c86",
    d:"Les quartiers historiques du nord de la ville, de Louis à Gué-Gué en direction de l'aéroport. L'arrondissement accueille l'Université Omar Bongo, la première du pays.",
    reperes:["Haut-de-Gué-Gué","Louis","Batterie IV","Quaben","Gros Bouquet","Charbonnages","Sotega"], fb:"",
    actions:[{date:"2026-04-30", t:"Adoption du budget 2026 : dotation de l'arrondissement portée à environ 230 millions FCFA", ...SRC_BUDGET},{date:"2025-11-19", t:"Installation du maire d'arrondissement et de ses deux adjoints", ...SRC_INSTALL}]},
  {n:2, t:"2e arrondissement", nom:"Nkembo", siege:"La Campagne", maire:"Richard Obiang Ava", adj:["Vivien Gildas Mayombo","Célestine Dikike"], img:"mont-bouet", c:"#d9480f",
    d:"Le cœur institutionnel et commerçant : Primature, ministères, Assemblée nationale, Sénat et hôtel de ville, mais aussi le grand marché de Mont-Bouët, site pilote du paiement électronique des taxes.",
    reperes:["Nkembo","Mont-Bouët (grand marché)","Montagne Sainte","Port-Môle","La Campagne"], fb:"https://www.facebook.com/Mairie2eArrondissementLbv/",
    actions:[{date:"2026-06-12", t:"Lancement du paiement électronique des taxes au marché de Mont-Bouët", src:"Gabonclic", url:"https://gabonclic.info/gabon-eugene-mba-lance-la-numerisation-des-recettes-pour-asphyxier-le-racket/"},{date:"2026-04-30", t:"Adoption du budget 2026 : dotation de l'arrondissement portée à environ 230 millions FCFA", ...SRC_BUDGET},{date:"2025-11-19", t:"Installation du maire d'arrondissement et de ses deux adjoints", ...SRC_INSTALL}]},
  {n:3, t:"3e arrondissement", nom:"Nombakélé", siege:"Nombakélé", maire:"Franck Ibouili", adj:["Alex Jordy Mangala Yentsa","Boris Mba Ndong"], img:"front-de-mer", c:"#1d6fb8",
    d:"Du centre-ville et du front de mer jusqu'à Akébé : commerces, administrations et quartiers populaires très denses, où se jouent la propreté et la circulation de la capitale.",
    reperes:["Centre-ville","Nombakélé","Petit Paris","Akébé"], fb:"https://www.facebook.com/Mairiedu3emearrondissement/",
    actions:[{date:"2026-04-30", t:"Adoption du budget 2026 : dotation de l'arrondissement portée à environ 230 millions FCFA", ...SRC_BUDGET},{date:"2025-11-19", t:"Installation du maire d'arrondissement et de ses deux adjoints", ...SRC_INSTALL}]},
  {n:4, t:"4e arrondissement", nom:"Plaine Niger", siege:"Plaine Niger", maire:"Nicaise Sickout-Iguendja", adj:["Patrick Emery Mabika","Yves Kenny Ongouori Tidjani"], img:"marche", c:"#0a8a55",
    d:"« La Mairie du Bonheur » : Glass, Lalala, London et la zone industrielle d'Oloumi. Un arrondissement commerçant et populaire, au plus près des marchés.",
    reperes:["Plaine Niger","Glass","Lalala","London","Oloumi","Toulon"], fb:"https://www.facebook.com/Mairie4emeLBV/",
    actions:[{date:"2026-04-30", t:"Adoption du budget 2026 : dotation de l'arrondissement portée à environ 230 millions FCFA", ...SRC_BUDGET},{date:"2025-11-20", t:"Installation du maire d'arrondissement et de ses deux adjoints", ...SRC_INSTALL}]},
  {n:5, t:"5e arrondissement", nom:"Sogatol", siege:"Sogatol", maire:"Lucien Florentin Ozouaki", adj:["Léon Pierre Ngoua","Élie Terence Moussavou Koumba"], img:"voie-express", c:"#7a4fc4",
    d:"À l'est de la ville, des quartiers résidentiels en pleine croissance où l'accès à l'eau potable, la voirie de desserte et la collecte des déchets sont les premières attentes.",
    reperes:["Sogatol","Awendjé","Kinguélé","Belle-Vue"], fb:"",
    actions:[{date:"2026-04-30", t:"Adoption du budget 2026 : dotation de l'arrondissement portée à environ 230 millions FCFA", ...SRC_BUDGET},{date:"2025-11-20", t:"Installation du maire d'arrondissement et de ses deux adjoints", ...SRC_INSTALL}]},
  {n:6, t:"6e arrondissement", nom:"Nzeng-Ayong", siege:"Nzeng-Ayong", maire:"Daniel Nkoulou Abessolo", adj:["Anatole Mfoumbolou","Gina Obone Obamba"], img:"estuaire", c:"#c99400",
    d:"Le plus vaste arrondissement de Libreville, de Nzeng-Ayong aux PK le long de la route nationale : une ville dans la ville, où chaque nouveau quartier attend ses services de proximité.",
    reperes:["Nzeng-Ayong","Ondogo","Sibang","Bambou-Chine","PK6 à PK12","Montalier"], fb:"",
    actions:[{date:"2026-04-30", t:"Adoption du budget 2026 : dotation de l'arrondissement portée à environ 230 millions FCFA", ...SRC_BUDGET},{date:"2025-11-20", t:"Installation du maire d'arrondissement et de ses deux adjoints", ...SRC_INSTALL}]},
];
const ARR_N = ARRONDISSEMENTS.map(a => a.n);
const QUARTIERS = [...new Set(ARRONDISSEMENTS.flatMap(a => a.reperes.map(q => q.replace(/ \(.*\)$/, ""))))].concat(["Derrière la prison","Vallée Sainte-Marie","Plaine Oréty","PK8","PK10","PK12"]);
// Trouver son arrondissement à partir d'un quartier (liste indicative)
const QUARTIER_ARR = {};
ARRONDISSEMENTS.forEach(a => a.reperes.forEach(q => QUARTIER_ARR[q.replace(/ \(.*\)$/, "").toLowerCase()] = a.n));
Object.assign(QUARTIER_ARR, {"derrière la prison":1, "vallée sainte-marie":1, "gué-gué":1, "pk6":6, "pk7":6, "pk8":6, "pk9":6, "pk10":6, "pk11":6, "pk12":6, "pk 8":6, "pk 12":6});

/* Le maire et ses adjoints (dossier de recherche, avril 2026) */
const EXECUTIF = [
  {nom:"Eugène Mba", r:"Maire de Libreville", d:"Élu à l'unanimité le 23 avril 2026"},
  {nom:"Jean Jacques Kanguet", r:"1er adjoint au maire"},
  {nom:"Juste Roméo Mouyopa", r:"2e adjoint au maire"},
  {nom:"Issa Malam Salatou", r:"3e adjoint au maire"},
  {nom:"Natacha Mengue Mbengue", r:"4e adjointe au maire"},
  {nom:"Thierry Akendengue Kolo", r:"5e adjoint au maire", d:"Chargé de la digitalisation"},
];

/* ---------- Démarches (pièces et tarifs indicatifs : à valider avec les services) ---------- */
const CAT_DEM = {
  "etat-civil": {l:"État civil", c:"#0a5260"},
  "famille": {l:"Mariage & famille", c:"#b0306a"},
  "economie": {l:"Commerçants & transporteurs", c:"#d9480f"},
  "urbanisme": {l:"Urbanisme & domaine public", c:"#0a8a55"},
  "cadre-vie": {l:"Cadre de vie", c:"#c99400"},
  "mairie": {l:"Rendez-vous & audiences", c:"#5b3fb3"},
};
const DEMARCHES = [
  {id:"naissance", acte:"naissance", prix:2000, doc:true, cat:"etat-civil", ic:"baby", t:"Copie ou extrait d'acte de naissance", d:"Obtenir une copie intégrale ou un extrait de votre acte de naissance enregistré à Libreville.", pieces:["Nom, prénoms et date de naissance de la personne concernée","Noms des parents","Pièce d'identité du demandeur"], service:"État civil"},
  {id:"decl-naissance", prix:0, doc:true, cat:"etat-civil", ic:"baby", t:"Déclaration de naissance", d:"Déclarer la naissance d'un enfant auprès de l'officier d'état civil de votre arrondissement.", pieces:["Certificat d'accouchement délivré par la maternité","Pièces d'identité des parents","Livret de famille ou acte de mariage, le cas échéant"], service:"État civil"},
  {id:"deces", acte:"deces", prix:2000, doc:true, cat:"etat-civil", ic:"file", t:"Acte de décès", d:"Déclarer un décès ou obtenir une copie d'acte de décès.", pieces:["Certificat médical de décès","Pièce d'identité du défunt","Pièce d'identité du déclarant"], service:"État civil"},
  {id:"copie-mariage", acte:"mariage", prix:2000, doc:true, cat:"etat-civil", ic:"ring", t:"Copie d'acte de mariage", d:"Obtenir une copie de votre acte de mariage célébré à Libreville.", pieces:["Noms des époux et date du mariage","Pièce d'identité du demandeur"], service:"État civil"},
  {id:"legalisation", acte:"tout", prix:1000, doc:false, cat:"etat-civil", ic:"stamp", t:"Légalisation & copie conforme", d:"Faire légaliser une signature ou certifier conforme la copie d'un document original.", pieces:["Document original","Pièce d'identité du signataire"], service:"État civil"},
  {id:"duplicata", acte:"tout", prix:2000, doc:false, cat:"etat-civil", ic:"file", t:"Duplicata ou renouvellement", d:"Obtenir un duplicata d'un document déjà délivré : 100 % en ligne si le document est authentifié, retrait à la mairie.", pieces:["Numéro du document","Pièce d'identité au retrait"], service:"État civil"},
  {id:"residence", acte:"naissance", prix:2000, doc:true, cat:"etat-civil", ic:"home", t:"Certificat de résidence", d:"Attester de votre domicile sur le territoire de la commune.", pieces:["Pièce d'identité","Justificatif de domicile ou attestation du chef de quartier"], service:"État civil"},
  {id:"mariage", acte:"naissance", prix:20000, doc:false, cat:"famille", ic:"ring", t:"Dossier de mariage civil", d:"Déposer un dossier de mariage, choisir la date de célébration et lancer la publication des bans.", pieces:["Actes de naissance des futurs époux","Pièces d'identité des époux et des témoins","Certificats de résidence","Certificat de célibat ou de non-remariage"], service:"État civil"},
  {id:"vignette", prix:50000, doc:true, cat:"economie", ic:"car", t:"Vignette de transport à QR code", d:"Taxi, taxi-bus ou transport de marchandises : obtenez ou renouvelez la vignette numérique de votre véhicule, vérifiable par simple scan.", pieces:["Carte grise du véhicule","Pièce d'identité du propriétaire","Autorisation de transport, le cas échéant"], service:"Recettes municipales", lien:"payer.html#vignette"},
  {id:"place", prix:10000, doc:true, cat:"economie", ic:"store", t:"Emplacement au marché", d:"Demander une place dans un marché municipal (Mont-Bouët, Nkembo, Oloumi…) et payer ses droits de place par téléphone.", pieces:["Activité exercée","Pièce d'identité","Registre de commerce, le cas échéant"], service:"Marchés & domaine public"},
  {id:"domaine", prix:10000, doc:true, cat:"urbanisme", ic:"map", t:"Occupation du domaine public", d:"Kiosque, étal, terrasse, dépôt de matériaux : demander une autorisation d'occupation temporaire.", pieces:["Description et emplacement souhaité","Durée d'occupation","Pièce d'identité ou registre de commerce"], service:"Marchés & domaine public"},
  {id:"permis", prix:50000, doc:true, cat:"urbanisme", ic:"building", t:"Permis de construire", d:"Demander l'autorisation de construire, d'agrandir ou de modifier un bâtiment.", pieces:["Titre foncier ou attestation d'attribution du terrain","Plans du projet (situation, masse, façades)","Pièce d'identité du demandeur"], service:"Urbanisme"},
  {id:"signalement", prix:0, doc:false, cat:"cadre-vie", ic:"alert", t:"Signaler un problème", d:"Dépôt d'ordures, caniveau bouché, éclairage en panne, nid-de-poule, fuite d'eau : prévenez les services techniques et suivez l'intervention.", pieces:["Lieu précis (quartier, repère)","Description du problème"], service:"Services techniques", signal:true},
  {id:"rdv", prix:0, doc:false, cat:"mairie", ic:"ticket", t:"Rendez-vous au guichet", d:"Réservez votre créneau à l'état civil de votre mairie d'arrondissement : vous arrivez à l'heure, vous êtes reçu sans faire la queue.", pieces:["Votre numéro de dossier, si vous en avez un","Les pièces de votre démarche"], service:"Accueil", rdv:true},
  {id:"audience", prix:0, doc:false, cat:"mairie", ic:"cal", t:"Demande d'audience", d:"Solliciter un rendez-vous avec le maire, un adjoint ou un maire d'arrondissement.", pieces:["Objet de la demande","Vos coordonnées"], service:"Cabinet du maire"},
];
const CRENEAUX = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","13:30","14:00","14:30","15:00"];
/* Documents de référence authentifiés : l'original est présenté UNE SEULE FOIS au guichet ;
   ensuite son numéro est reconnu par la plateforme et l'original n'est plus demandé. */
const TYPES_DOC = [["naissance","Acte de naissance"],["mariage","Acte de mariage"],["deces","Acte de décès"],["residence","Certificat de résidence"],["diplome","Diplôme"],["autre","Autre document officiel"]];
const typeDocL = k => (TYPES_DOC.find(t => t[0] === k) || [k, "Document"])[1];
const normNum = s => String(s || "").toUpperCase().replace(/N[°O]\.?\s*/g, "").replace(/\s+/g, "").trim();
const normNom = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

const PAIEMENT = {
  modes:[
    {id:"airtel", l:"Airtel Money", s:"Paiement depuis votre téléphone", c:"#e40000"},
    {id:"moov", l:"Moov Money", s:"Moov Africa, partenaire des vignettes QR", c:"#0067b1"},
    {id:"carte", l:"Carte bancaire", s:"Visa, Mastercard, GIMAC", c:"#1477b5"},
  ],
  guichet:"Payer à la mairie (espèces, mobile money ou carte au guichet)",
  note:"Tarifs indicatifs pour la démonstration, à confirmer par délibération du conseil municipal.",
};
const payLogo = id => id === "airtel" ? "airtel<br>money" : id === "moov" ? "moov<br>money" : "VISA · MC";
const fcfa = n => n ? Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA" : "Gratuit";

const TYPES_SIGNAL = [
  ["ordures","Dépôt d'ordures","trash"],["caniveau","Caniveau bouché / inondation","wave"],["eclairage","Éclairage public en panne","light"],
  ["voirie","Nid-de-poule / voirie dégradée","road"],["eau","Fuite ou panne d'eau (borne, forage)","drop"],["anarchique","Occupation anarchique","alert"],["autre","Autre problème","chat"],
];

/* ---------- e-Services : taxes, vignettes, marchés (tarifs de démonstration) ----------
   En production, ces paiements sont raccordés à la plateforme e-Tax de la commune
   (etax-libreville.ga) et à MADIGIPAIE plutôt que de les remplacer. */
const TAXES = [
  {id:"vig-TX", g:"vignette", cat:"TX", ic:"car", t:"Vignette taxi", s:"Valable 12 mois", prix:50000, ref:"Immatriculation du véhicule", ph:"Ex. GA 1234 AB"},
  {id:"vig-TB", g:"vignette", cat:"TB", ic:"truck", t:"Vignette taxi-bus", s:"Valable 12 mois", prix:75000, ref:"Immatriculation du véhicule", ph:"Ex. GA 5678 CD"},
  {id:"vig-TM", g:"vignette", cat:"TM", ic:"truck", t:"Vignette transport de marchandises", s:"Valable 12 mois", prix:100000, ref:"Immatriculation du véhicule", ph:"Ex. GA 9012 EF"},
  {id:"place-j", g:"marche", ic:"store", t:"Droit de place – journée", s:"Marchés municipaux", prix:500, ref:"N° d'emplacement", ph:"Ex. MB-A-118 (Mont-Bouët)"},
  {id:"place-m", g:"marche", ic:"store", t:"Droit de place – mois", s:"Marchés municipaux", prix:10000, ref:"N° d'emplacement", ph:"Ex. MB-A-118 (Mont-Bouët)"},
  {id:"odp", g:"autre", ic:"map", t:"Occupation du domaine public – mois", s:"Kiosque, terrasse, étal", prix:15000, ref:"N° d'autorisation", ph:"Ex. ODP-26-0042"},
  {id:"pub", g:"autre", ic:"mega", t:"Taxe sur la publicité – an", s:"Enseigne ou panneau", prix:50000, ref:"N° de panneau ou nom du commerce", ph:"Ex. Boutique Akébé"},
];
const CAT_VIG = {TX:"Taxi", TB:"Taxi-bus", TM:"Transport de marchandises"};
const NATURE_TAXE = {vignette:"Vignettes de transport", marche:"Droits de place (marchés)", odp:"Occupation du domaine public", pub:"Taxe sur la publicité"};

/* ---------- Programme « 3A » : une ville aérée, aménagée, agréable ---------- */
const PROG3A = [
  {k:"Aérée", ic:"leaf", c:"#0a8a55", d:"Une ville propre qui respire : engins lourds pour la collecte des déchets, caniveaux dégagés, signalements traités et suivis.", tags:["Collecte des déchets","Assainissement","Signalements"]},
  {k:"Aménagée", ic:"crane", c:"#0e7c86", d:"Des équipements de proximité dans chaque quartier : forages d'eau potable, dotations des arrondissements multipliées par trois, voirie de desserte.", tags:["Forages d'eau","230 M FCFA par arrondissement","Voirie"]},
  {k:"Agréable", ic:"sun", c:"#d9480f", d:"Une mairie qui facilite la vie : démarches et paiements en ligne, vignettes à QR code, village culturel et attention portée aux retraités.", tags:["Mairie numérique","Village culturel","Retraités"]},
];

/* ---------- Projets & chantiers (sources : presse 2025-2026) ---------- */
const PROJETS = [
  {t:"Programme « 3A » : une ville aérée, aménagée et agréable", arr:0, th:"amenagement", st:"Lancé", img:"front-de-mer", note:"Photo : front de mer de Libreville (Shirmy25, CC BY-SA 4.0)", d:"La feuille de route du maire Eugène Mba depuis avril 2026, déclinée dans le budget 2026 et dans chacun des six arrondissements."},
  {t:"e-Tax : paiement électronique des taxes", arr:2, th:"numerique", st:"En service", img:"mont-bouet", d:"Présenté le 25 novembre 2025 et déployé le 12 juin 2026 au marché de Mont-Bouët : les commerçants paient par téléphone, sans intermédiaire, avec une trace de chaque paiement."},
  {t:"Vignettes de transport à QR code", arr:0, th:"numerique", st:"En service", img:"vignettes-lancement", d:"Depuis le 28 mai 2026, avec Moov Africa Gabon Télécom : taxis, taxis-bus et transport de marchandises reçoivent une vignette numérique vérifiable par simple scan."},
  {t:"État civil numérique", arr:0, th:"numerique", st:"En service", img:"conseil-municipal", note:"Photo d'illustration : conseil municipal", d:"Naissances, mariages, décès et archivage des actes : l'état civil numérique a généré 266 millions FCFA de recettes entre mi-janvier et mi-juin 2026."},
  {t:"MADIGIPAIE : le paiement par QR code pour les commerçants", arr:0, th:"numerique", st:"Lancé", img:"marche", note:"Photo : marché de Libreville (Tarik Esnow, CC BY-SA 4.0)", d:"Accord du 6 juillet 2026 entre l'État et la mairie pour une plateforme de paiement des taxes par QR code, au plus près des commerçants."},
  {t:"Engins lourds pour la collecte des déchets", arr:0, th:"proprete", st:"Programmé", img:"voie-express", note:"Photo d'illustration : voie express (Shirmy25, CC BY-SA 4.0)", d:"Priorité du budget 2026 : renforcer les moyens de collecte pour une ville plus propre, dans les six arrondissements."},
  {t:"Forages d'eau potable dans les arrondissements", arr:0, th:"eau", st:"Programmé", img:"estuaire", note:"Photo d'illustration : l'estuaire (Christian Vigna, CC BY-SA 4.0)", d:"Le budget 2026 prévoit des forages pour améliorer l'accès à l'eau potable dans les quartiers qui en manquent."},
  {t:"Dotation des arrondissements multipliée par trois", arr:0, th:"gouvernance", st:"Engagé", img:"bd-independance", note:"Photo d'illustration : boulevard de l'Indépendance (Shirmy25, CC BY-SA 4.0)", d:"Chaque mairie d'arrondissement passe de 70 à environ 230 millions FCFA pour financer des actions de proximité."},
  {t:"Village culturel", arr:0, th:"social", st:"Programmé", img:"baie-des-rois", note:"Photo d'illustration : Baie des Rois (Shirmy25, CC BY-SA 4.0)", d:"Un lieu dédié aux cultures et aux talents de Libreville, inscrit parmi les priorités du budget 2026."},
  {t:"Apurement des dettes envers les retraités", arr:0, th:"social", st:"Programmé", img:"conseil-municipal", note:"Photo d'illustration", d:"Le budget 2026 prévoit de régler les sommes dues aux anciens agents de la commune."},
  {t:"Recensement des contribuables et cartographie numérique", arr:0, th:"gouvernance", st:"À l'étude", img:"libreville-nuit", note:"Photo : Libreville de nuit (Shirmy25, CC BY-SA 4.0)", d:"Juin 2026 : une délégation municipale étudie à Abidjan le modèle ivoirien (recensement, cartographie numérique, état civil)."},
];
const THEMES = {numerique:"Ville numérique", proprete:"Propreté & déchets", eau:"Eau & assainissement", amenagement:"Aménagement", gouvernance:"Gouvernance & finances", social:"Social & culture"};

/* ---------- Actualités (articles de presse) ---------- */
const ACTUS = [
  {date:"2026-07-06", cat:"Ville numérique", img:"marche", t:"MADIGIPAIE : l'État et la mairie s'accordent sur le paiement par QR code", d:"Une plateforme de paiement par QR code va permettre aux commerçants de régler leurs taxes simplement, avec une traçabilité complète.", src:"Gabonactu", url:"https://gabonactu.com/blog/2026/07/06/qr-code-letat-et-la-mairie-de-libreville-saccordent-pour-lancer-madigipaie/"},
  {date:"2026-06-25", mois:"Juin 2026", cat:"Coopération", img:"libreville-nuit", t:"Transformation numérique : la mairie s'inspire du modèle ivoirien", d:"Une délégation étudie à Abidjan le recensement des contribuables, la cartographie numérique et l'état civil.", src:"L'Union", url:"https://www.union.sonapresse.com/index.php/fr/transformation-numerique-la-mairie-de-libreville-simpregne-du-modele-ivoirien"},
  {date:"2026-06-12", cat:"2e arrondissement", img:"mont-bouet", t:"Mont-Bouët passe au paiement électronique des taxes", d:"Le maire lance la numérisation des recettes au grand marché. L'état civil numérique a déjà rapporté 266 millions FCFA en cinq mois.", src:"Gabonclic", url:"https://gabonclic.info/gabon-eugene-mba-lance-la-numerisation-des-recettes-pour-asphyxier-le-racket/"},
  {date:"2026-05-29", cat:"Transport", img:"vignette-0001", t:"Moov Africa accompagne la municipalité", d:"La vignette n° 0001 posée sur un taxi devant l'hôtel de ville : la traçabilité des transports entre dans l'ère du QR code.", src:"Gabon Media Time", url:"https://gabonmediatime.com/libreville-moov-africa-gabon-telecom-accompagne-la-municipalite-avec-des-vignettes-a-qr-code/"},
  {date:"2026-05-28", cat:"Transport", img:"vignettes-lancement", t:"Des vignettes numériques sécurisées pour les taxis et taxis-bus", d:"Avec Moov Africa Gabon Télécom, la commune lance des vignettes à QR code vérifiables par application mobile.", src:"Gabonreview", url:"https://www.gabonreview.com/libreville-et-moov-africa-gabon-telecom-renforcent-la-tracabilite-des-transports-avec-des-vignettes-numeriques-securisees/"},
  {date:"2026-04-30", cat:"Budget", img:"conseil-municipal", t:"Un budget de 30,77 milliards FCFA adopté", d:"Hausse d'environ 5 milliards, dotation des arrondissements portée à 230 millions FCFA, priorité à la digitalisation, aux déchets et à l'eau potable.", src:"Gabon Media Time", url:"https://gabonmediatime.com/mairie-de-libreville-un-budget-de-3077-milliards-fcfa-pour-tourner-la-page-de-la-crise/"},
  {date:"2026-04-23", cat:"Institution", img:"maire", t:"Eugène Mba élu maire de Libreville à l'unanimité", d:"Banquier de formation et ancien maire du 2e arrondissement, il revient à l'hôtel de ville avec son programme « 3A ».", src:"Gabon Media Time", url:"https://gabonmediatime.com/libreville-eugene-mba-fait-son-come-back-a-lhotel-de-ville/"},
  {date:"2025-12-15", mois:"Décembre 2025", cat:"Gouvernance", img:"bd-independance", t:"Deux commissions d'audit : ressources humaines et contrats", d:"La commune engage un audit de son personnel et de ses contrats pour assainir sa gestion.", src:"Gabon Quotidien", url:"https://gabon-quotidien.com/mairie-libreville-gouvernance-locale-2026/"},
  {date:"2025-11-25", cat:"Ville numérique", img:"bord-de-mer", t:"e-Tax : vers la digitalisation des recettes municipales", d:"Présentation de la plateforme de paiement électronique des taxes de la commune.", src:"Gabon Media Time", url:"https://gabonmediatime.com/libreville-vers-la-digitalisation-des-recettes-municipales/"},
  {date:"2025-11-20", cat:"Arrondissements", img:"bd-bord-de-mer", t:"Les six maires d'arrondissement installés", d:"Les 19 et 20 novembre 2025, les maires des six arrondissements et leurs adjoints prennent leurs fonctions.", src:"Gabon Infos Live", url:"https://gaboninfoslive.com/2025/11/25/mise-en-place-des-nouvelles-equipes-municipales-a-libreville/"},
];

/* ---------- Transparence : budget 2026 (ordres de grandeur publiés par la presse) ---------- */
const BUDGET = {
  total:30.77e9, hausse:5e9, masse:.70, dotationAvant:70e6, dotation:DOTATION, etatCivil:266e6, digitAvant:30e6,
  chrono:[
    {date:"2025-11-25", t:"Présentation du projet e-Tax de digitalisation des recettes municipales."},
    {date:"2025-12-15", m:"Décembre 2025", t:"Annonce de deux commissions d'audit : ressources humaines et contrats de la commune."},
    {date:"2026-04-09", t:"Le conseil municipal rejette le budget primitif présenté (142 voix sur 145), le jugeant « non sincère »."},
    {date:"2026-04-23", t:"Eugène Mba est élu maire de Libreville à l'unanimité, puis installé le lendemain."},
    {date:"2026-04-30", t:"Adoption d'un budget de 30,77 milliards FCFA, en hausse d'environ 5 milliards."},
    {date:"2026-05-28", t:"Lancement des vignettes de transport à QR code avec Moov Africa Gabon Télécom."},
    {date:"2026-06-12", t:"Paiement électronique des taxes au marché de Mont-Bouët ; 266 millions FCFA générés par l'état civil numérique depuis janvier."},
    {date:"2026-07-06", t:"Accord État – mairie pour lancer MADIGIPAIE, le paiement par QR code des commerçants."},
  ],
  priorites:["Digitalisation des services et allègement du cabinet","Engins lourds pour la collecte des déchets","Forages d'eau potable dans les arrondissements","Apurement des dettes envers les retraités","Village culturel"],
};

/* ---------- Galerie (photos de presse et photos libres Wikimedia Commons, CC BY-SA 4.0) ---------- */
const GALERIE = [
  {img:"front-de-mer", cat:"ville", t:"Le front de mer de Libreville", cr:"Shirmy25 · CC BY-SA 4.0"},
  {img:"bord-de-mer", cat:"ville", t:"Le boulevard du bord de mer vu du ciel", cr:"Shirmy25 · CC BY-SA 4.0"},
  {img:"baie-des-rois", cat:"ville", t:"Les aménagements de la Baie des Rois", cr:"Shirmy25 · CC BY-SA 4.0"},
  {img:"voie-express", cat:"ville", t:"La voie express", cr:"Shirmy25 · CC BY-SA 4.0"},
  {img:"libreville-nuit", cat:"ville", t:"Libreville de nuit", cr:"Shirmy25 · CC BY-SA 4.0"},
  {img:"estuaire", cat:"ville", t:"L'estuaire du Gabon vu du Cap", cr:"Christian Vigna · CC BY-SA 4.0"},
  {img:"bd-independance", cat:"ville", t:"Le boulevard de l'Indépendance", cr:"Shirmy25 · CC BY-SA 4.0"},
  {img:"bd-bord-de-mer", cat:"ville", t:"Sur le boulevard du bord de mer", cr:"Delrick Trevor · CC BY-SA 4.0"},
  {img:"marche", cat:"terrain", t:"Une commerçante de Libreville", cr:"Tarik Esnow · CC BY-SA 4.0"},
  {img:"mont-bouet", cat:"terrain", t:"Lancement du paiement électronique à Mont-Bouët", cr:"Gabonclic"},
  {img:"vignettes-lancement", cat:"evenements", t:"Pose de la première vignette à QR code", cr:"Gabonreview"},
  {img:"vignette-0001", cat:"evenements", t:"La vignette n° 0001, devant l'hôtel de ville", cr:"Gabon Media Time"},
  {img:"conseil-municipal", cat:"mairie", t:"Session du conseil municipal", cr:"Gabon Media Time"},
  {img:"maire", cat:"mairie", t:"Le maire, Eugène Mba", cr:"Gabon Media Time"},
];

/* ---------- Espace numérique des agents (comptes de démonstration) ---------- */
const ESPACES = [
  {role:"cabinet", ic:"gauge", t:"Cabinet du maire", s:"Piloter la capitale", c:"#06363f",
    pts:["Tableau de bord en temps réel des 6 arrondissements","Recettes e-Tax, état civil et vignettes","Alertes, agenda et demandes d'audience"],
    demo:{login:"maire", pwd:"lbv2026", nom:"Cabinet du maire"}},
  {role:"services", ic:"stamp", t:"Services municipaux", s:"État civil, technique, RH", c:"#0a8a55",
    pts:["Demandes en ligne traitées et tracées","Registre d'état civil numérique","Personnel : suites de l'audit RH"],
    demo:{login:"etat.civil", pwd:"agent2026", nom:"Service de l'état civil"}},
  {role:"recettes", ic:"qr", t:"Recettes & e-Tax", s:"Taxes, marchés, vignettes", c:"#d9480f",
    pts:["Encaissements et quittances traçables","Registre des vignettes à QR code","Contrôle sur le terrain par scan"],
    demo:{login:"recettes", pwd:"agent2026", nom:"Direction des recettes"}},
  {role:"arrondissement", ic:"map", t:"Mairies d'arrondissement", s:"Gestion de proximité", c:"#c99400",
    pts:["Demandes, signalements et actes de l'arrondissement","Suivi des 230 M FCFA de dotation","Classement parmi les 6 arrondissements"],
    demo:{login:"arr1", pwd:"arr2026", nom:"Comptes arr1 à arr6"}},
];
