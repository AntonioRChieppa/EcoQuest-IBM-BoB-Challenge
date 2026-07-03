/**
 * questAI.js — QuestAI Agent
 *
 * Self-contained dynamic generation engine for Eco-Quest.
 * NO external API calls. NO dependencies beyond Node.js core.
 *
 * Pools:
 *   - 50 DAILY quest templates   (quick, simple — 100 XP fixed)
 *   - 50 WEEKLY quest templates  (laborious, impactful — 300 XP fixed)
 *   - 50 Loot Chest pop-culture comparison phrases
 *
 * Public API:
 *   generateQuests(user)  → { quests: [3 daily + 3 weekly] }
 *   chestStats(xp_total)  → { euro_saved, co2_saved_kg, pop_comparison }
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Pick n unique items from arr, excluding any whose title is in seenTitles. */
function pickN(arr, n, seenTitles) {
  const seen    = new Set(seenTitles || []);
  const eligible = arr.filter((q) => !seen.has(q.title));
  // if not enough unseen, fall back to full pool
  const pool    = eligible.length >= n ? eligible : arr;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}

// ─────────────────────────────────────────────────────────────────────────────
// 50 DAILY QUEST TEMPLATES
// Simple, achievable in one day — personalised pools by age/gender/tier
// ─────────────────────────────────────────────────────────────────────────────
const DAILY_QUESTS = [
  // ── Universal ────────────────────────────────────────────────────────────
  { title: '💡 Cacciatore di Standby',       description: 'Stacca tutti i dispositivi in standby di casa per 24 ore consecutive.',                                         tags: ['all'] },
  { title: '♻️ Maestro della Raccolta',       description: 'Separa correttamente ogni rifiuto di casa per un\'intera giornata seguendo le regole del tuo comune.',          tags: ['all'] },
  { title: '🛍️ Zero Sacchetti Oggi',         description: 'Fai la spesa portando borse riutilizzabili. Rifiuta ogni sacchetto di plastica offerto.',                        tags: ['all'] },
  { title: '🚿 Doccia da Campione',           description: 'Riduci la doccia a massimo 4 minuti. Misura il tempo con il cellulare.',                                        tags: ['all'] },
  { title: '🌡️ Termostato -1°',              description: 'Abbassa di 1°C il riscaldamento o alzalo di 1°C il condizionatore per tutta la giornata.',                      tags: ['all'] },
  { title: '🥗 Pasto Vegetale',               description: 'Sostituisci il pasto principale con uno completamente vegetale e di stagione.',                                 tags: ['all'] },
  { title: '🚶 Pedibus Urbano',               description: 'Usa solo i piedi per tutti gli spostamenti sotto i 2 km oggi.',                                                 tags: ['all'] },
  { title: '💧 Rubinetto Off',               description: 'Chiudi il rubinetto mentre ti lavi i denti e insegnalo a qualcuno in casa.',                                    tags: ['all'] },
  { title: '📦 Zero Acquisti Online',         description: 'Evita qualsiasi acquisto online per 24 ore. Rifletti su cosa acquisti davvero.',                                tags: ['all'] },
  { title: '🌿 Minuto Verde',                description: 'Dedica 10 minuti a innaffiare o prenderti cura di una pianta di casa o del balcone.',                           tags: ['all'] },
  { title: '🔦 Luci Off',                    description: 'Tieni spente le luci di ogni stanza che non usi durante l\'intera giornata.',                                   tags: ['all'] },
  { title: '🍱 Lunch Box Eco',               description: 'Porta il pranzo da casa in un contenitore riutilizzabile. Zero imballaggi monouso.',                            tags: ['all'] },
  { title: '🚗 No Auto Oggi',                description: 'Per tutti gli spostamenti di oggi usa mezzi pubblici, bici o piedi. Zero auto privata.',                        tags: ['all'] },
  { title: '📰 Notizia Verde',               description: 'Leggi un articolo sull\'energia rinnovabile o il clima e condividilo con un amico o sui social.',               tags: ['all'] },
  { title: '🧴 Detersivo Eco',               description: 'Usa solo detersivi ecologici o concentrati per i lavaggi di oggi.',                                             tags: ['all'] },
  // ── Young (≤25) ──────────────────────────────────────────────────────────
  { title: '🚴 Eroe su Due Ruote',            description: 'Usa la bici o il monopattino al posto di auto/motorino per tutti gli spostamenti di oggi.',                    tags: ['young'] },
  { title: '📱 Digital Detox Parziale',       description: 'Riduci l\'utilizzo del cellulare a max 2 ore oggi. Lo schermo consuma energia!',                               tags: ['young'] },
  { title: '🎒 Zaino Plastic-Free',           description: 'Controlla il tuo zaino o borsa: rimuovi ogni oggetto monouso in plastica e sostituiscilo con alternative.',    tags: ['young'] },
  { title: '🤳 Story Eco',                   description: 'Pubblica una storia o un post sui social su una buona pratica ambientale che fai ogni giorno.',                 tags: ['young'] },
  { title: '🏊 Attività Fisica Green',        description: 'Fai attività fisica all\'aperto (running, ciclismo, camminata) invece di andare in palestra oggi.',            tags: ['young'] },
  // ── Adult M (26-50) ──────────────────────────────────────────────────────
  { title: '🛒 Lista della Spesa Eco',        description: 'Fai la spesa con lista scritta, solo prodotti locali o bio. Zero acquisti impulsivi.',                         tags: ['adult_M'] },
  { title: '🔌 Audit Prese',                 description: 'Controlla ogni presa di casa: scollega i caricatori non in uso e i dispositivi in standby.',                   tags: ['adult_M'] },
  { title: '🚿 Guerriero dell\'Acqua',        description: 'Doccia massimo 5 minuti per 3 giorni di fila. Oggi è il primo.',                                               tags: ['adult_M'] },
  { title: '🥩 Meno Carne Oggi',             description: 'Sostituisci la carne con legumi o pesce a basso impatto per tutti i pasti di oggi.',                           tags: ['adult_M'] },
  { title: '🚌 Collega in Car Pool',          description: 'Proponi a un collega di condividere l\'auto oggi o usa i mezzi pubblici per andare al lavoro.',                tags: ['adult_M'] },
  // ── Adult F (26-50) ──────────────────────────────────────────────────────
  { title: '🍱 Chef Anti-Spreco',             description: 'Cucina un pasto usando solo avanzi del frigo senza buttare nulla. Condividi la ricetta.',                      tags: ['adult_F'] },
  { title: '🧴 Alchimista Eco',               description: 'Sostituisci un prodotto cosmetico o detergente con una versione naturale o fatta in casa.',                   tags: ['adult_F'] },
  { title: '🛒 Spesa a Km Zero',              description: 'Compra almeno 3 prodotti alimentari dal mercato locale o da produttori a km zero.',                            tags: ['adult_F'] },
  { title: '♻️ Maestra della Raccolta',       description: 'Separa tutti i rifiuti di casa con cura. Spiega a un familiare come si fa correttamente.',                    tags: ['adult_F'] },
  { title: '🌸 Balcone Verde',                description: 'Dedica 15 minuti alle piante del balcone: innaffia, potatura leggera, concime naturale.',                      tags: ['adult_F'] },
  // ── Senior (>50) ─────────────────────────────────────────────────────────
  { title: '🌿 Custode del Verde',            description: 'Dedica 20 minuti alla cura di piante di casa o giardino usando acqua raccolta.',                               tags: ['senior'] },
  { title: '💧 Guardiano dell\'Acqua',        description: 'Raccogli l\'acqua fredda prima della doccia e usala per annaffiare le piante.',                                tags: ['senior'] },
  { title: '🔌 Risparmio Elettrico',          description: 'Abbassa di 1 grado il riscaldamento/climatizzatore e mantienilo per tutta la giornata.',                      tags: ['senior'] },
  { title: '📖 Saggio Eco',                  description: 'Leggi un articolo su energia rinnovabile o ambiente e raccontane il contenuto a un familiare.',                tags: ['senior'] },
  { title: '🍎 Spesa dal Contadino',          description: 'Acquista almeno 2 prodotti da un mercato agricolo locale o a km zero.',                                        tags: ['senior'] },
  // ── Tier 2 (Lv 4-9) ──────────────────────────────────────────────────────
  { title: '🔋 Carica Consapevole',           description: 'Carica tutti i dispositivi solo fino al 80% e scollega subito dopo. Tieni traccia del risparmio.',             tags: ['tier2'] },
  { title: '🌊 Acqua Fredda',                description: 'Usa solo acqua fredda per lavarsi le mani e le verdure per tutto il giorno.',                                  tags: ['tier2'] },
  { title: '📦 Unboxing Eco',                description: 'Raccogli e porta in punti di raccolta tutti gli imballi ricevuti nell\'ultima settimana.',                      tags: ['tier2'] },
  { title: '🏃 Mobilità Attiva',              description: 'Usa le scale invece dell\'ascensore per l\'intera giornata. Conta i piani.',                                   tags: ['tier2'] },
  { title: '🌱 Semina Sociale',              description: 'Racconta a 3 persone una pratica eco che fai abitualmente. Ispira il cambiamento.',                            tags: ['tier2'] },
  // ── Tier 3 (Lv 10+) ──────────────────────────────────────────────────────
  { title: '⚡ Energy Log',                  description: 'Leggi il contatore elettrico di casa mattina e sera. Calcola i kWh consumati e identifica il picco.',           tags: ['tier3'] },
  { title: '🌍 Carbon Diary',               description: 'Traccia ogni azione ad alto impatto CO₂ di oggi: spostamenti, pasti, acquisti. Calcola il totale.',             tags: ['tier3'] },
  { title: '♻️ Riciclo Creativo',            description: 'Trasforma un oggetto che stavi per buttare in qualcosa di utile. Documentalo.',                                 tags: ['tier3'] },
  { title: '🚴 Commute Verde',               description: 'Vai al lavoro o a scuola solo in bici, a piedi o con mezzi pubblici. Zero emissioni.',                         tags: ['tier3'] },
  { title: '🌿 Pasto 100% Locale',           description: 'Prepara un pasto usando solo ingredienti locali e di stagione, acquistati da produttori del territorio.',       tags: ['tier3'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// 50 WEEKLY QUEST TEMPLATES
// Complex, require days of commitment — personalised by profile
// ─────────────────────────────────────────────────────────────────────────────
const WEEKLY_QUESTS = [
  // ── Universal ────────────────────────────────────────────────────────────
  { title: '🌱 Primo Seme del Futuro',        description: 'Pianta un seme in un vasetto: pomodorino, basilico o fiore. Fotografa e documenta la crescita per 7 giorni.',  tags: ['all'] },
  { title: '🔧 Riparazione Invece di Rifiuto', description: 'Ripara qualcosa di rotto in casa invece di buttarlo: sedia, elettrodomestico, indumento.',                    tags: ['all'] },
  { title: '🛒 Settimana Plastic-Free',        description: 'Per 7 giorni acquista solo prodotti senza imballaggio plastico. Tieni un diario degli acquisti.',             tags: ['all'] },
  { title: '🥗 Settimana Plant-Based',         description: 'Per 5 giorni sostituisci il pasto principale con una ricetta completamente vegetale.',                        tags: ['all'] },
  { title: '🌊 Pulizia Verde',                description: 'Organizza o partecipa a una pulizia di parco, spiaggia o area urbana. Porta almeno un amico.',                 tags: ['all'] },
  { title: '♻️ Zero Waste Week',              description: 'Riduci la produzione di rifiuti sotto i 500g per persona in casa tua. Documenta ogni giorno.',                 tags: ['all'] },
  { title: '🚗 Settimana Senza Auto',          description: 'Per 5 giorni usa solo piedi, bici e mezzi pubblici. Zero auto privata.',                                      tags: ['all'] },
  { title: '💡 Audit Energetico Domestico',    description: 'Leggi il contatore ogni giorno per 7 giorni. Identifica i 3 principali sprechi e crea un piano di riduzione.', tags: ['all'] },
  { title: '📊 Impronta di Carbonio',          description: 'Usa uno strumento online per calcolare la tua carbon footprint settimanale e individua le 2 aree peggiori.',   tags: ['all'] },
  { title: '🤝 Ambasciatore Verde',           description: 'Parla di sostenibilità con almeno 5 persone diverse questa settimana. Racconta cosa fai e perché.',            tags: ['all'] },
  // ── Young (≤25) ──────────────────────────────────────────────────────────
  { title: '⚡ Sfida dell\'Impronta Zero',     description: 'Calcola la tua impronta di carbonio con uno strumento online e presenta i risultati a famiglia o amici.',      tags: ['young'] },
  { title: '📱 Influencer Verde',              description: 'Crea e pubblica 5 contenuti sui social su pratiche ecologiche che fai davvero questa settimana.',              tags: ['young'] },
  { title: '🏗️ Progetto Sostenibile',         description: 'Avvia o aderisci a un progetto di sostenibilità nella tua scuola, università o luogo di lavoro.',             tags: ['young'] },
  { title: '☀️ Esploratore Solare',            description: 'Ricerca e confronta 3 fornitori di energia rinnovabile per casa tua. Presenta i risultati in famiglia.',       tags: ['young'] },
  { title: '🔬 Citizen Scientist',             description: 'Partecipa a un progetto di citizen science sul monitoraggio ambientale locale per una settimana.',             tags: ['young'] },
  { title: '🌍 Evento Eco',                   description: 'Organizza o partecipa a un evento pubblico sulla sostenibilità nel tuo comune.',                               tags: ['young'] },
  { title: '📊 Carbon Budget',               description: 'Crea un piano di riduzione CO₂ personale per i prossimi 3 mesi con obiettivi settimanali misurabili.',          tags: ['young'] },
  { title: '🧪 Lab Eco',                     description: 'Sperimenta la produzione di un prodotto eco-friendly fatto in casa (detersivo, shampoo solido, ecc.).',         tags: ['young'] },
  // ── Adult M (26-50) ──────────────────────────────────────────────────────
  { title: '🔋 Audit Energetico Avanzato',     description: 'Leggi il contatore ogni mattina per 7 giorni, identifica i picchi e proponi soluzioni concrete in famiglia.', tags: ['adult_M'] },
  { title: '🌳 Padrino degli Alberi',          description: 'Adotta o pianta un albero in area pubblica tramite un\'iniziativa certificata del tuo comune.',               tags: ['adult_M'] },
  { title: '🛠️ Workshop Riparazione',         description: 'Partecipa a un repair café o evento di riparazione collettiva. In alternativa insegna a qualcuno.',           tags: ['adult_M'] },
  { title: '🚌 Mobility Plan',               description: 'Crea e proponi un piano di mobilità sostenibile per il tuo condominio o luogo di lavoro.',                     tags: ['adult_M'] },
  { title: '💼 Fornitore Green',              description: 'Sostituisci almeno un fornitore o prodotto regolare con una alternativa certificata sostenibile.',              tags: ['adult_M'] },
  { title: '⚡ Futuro Solare',               description: 'Avvia le pratiche per installare un impianto fotovoltaico o solare termico sulla tua abitazione.',              tags: ['adult_M'] },
  { title: '🌲 Forestazione Attiva',          description: 'Organizza o coordina una giornata di piantumazione alberi con almeno 5 partecipanti.',                         tags: ['adult_M'] },
  // ── Adult F (26-50) ──────────────────────────────────────────────────────
  { title: '✂️ Sarta del Futuro',              description: 'Trasforma un indumento non più usato in qualcosa di nuovo (borsa, accessorio, straccio riutilizzabile).',     tags: ['adult_F'] },
  { title: '🌻 Orto Urbano',                  description: 'Crea un mini-orto sul balcone o davanzale con almeno 3 tipi di verdure o erbe aromatiche.',                   tags: ['adult_F'] },
  { title: '🧴 Laboratorio Cosmetico Eco',     description: 'Prepara almeno 2 prodotti cosmetici o per la pulizia casa in modo naturale (es. burro corpo, spray vetri).',  tags: ['adult_F'] },
  { title: '🤝 Rete di Quartiere',            description: 'Organizza un\'iniziativa eco nel tuo quartiere: raccolta differenziata condivisa o gruppo d\'acquisto bio.',   tags: ['adult_F'] },
  { title: '💧 Idrologia Domestica',          description: 'Installa riduttori di flusso ai rubinetti di casa e documenta il risparmio idrico stimato.',                   tags: ['adult_F'] },
  { title: '📚 Educazione Verde',             description: 'Organizza un laboratorio pratico di educazione ambientale per bambini del quartiere.',                          tags: ['adult_F'] },
  { title: '🌺 Impatto Locale',              description: 'Avvia o supporta un\'iniziativa locale a impatto ambientale positivo nel tuo territorio.',                     tags: ['adult_F'] },
  // ── Senior (>50) ─────────────────────────────────────────────────────────
  { title: '🌾 Custode della Tradizione',      description: 'Prepara una conserva o marmellata con frutta di stagione locale. Annota la ricetta e condividila.',           tags: ['senior'] },
  { title: '🪴 Grande Giardino',              description: 'Dedica 1 ora al giardino comunitario o al tuo, usando solo compost naturale e acqua piovana raccolta.',        tags: ['senior'] },
  { title: '📡 Mentor Eco',                  description: 'Insegna a 3 persone della famiglia o del vicinato pratiche sostenibili che hai adottato nel tempo.',            tags: ['senior'] },
  { title: '🔌 Casa Efficiente',              description: 'Sostituisci almeno 3 lampadine con LED ad alta efficienza. Calcola il risparmio annuo stimato.',               tags: ['senior'] },
  { title: '🌡️ Termostato Intelligente',      description: 'Programma il termostato per risparmiare nelle ore notturne e di assenza. Documenta il cambio in bolletta.',   tags: ['senior'] },
  { title: '📜 Testimone del Cambiamento',     description: 'Scrivi o registra la tua testimonianza sui cambiamenti ambientali vissuti. Condividila con la famiglia.',     tags: ['senior'] },
  { title: '🌳 Forestazione Familiare',        description: 'Coinvolgi tutta la famiglia in una giornata di piantumazione alberi nel tuo comune.',                         tags: ['senior'] },
  // ── Tier 2 (Lv 4-9) ──────────────────────────────────────────────────────
  { title: '🏭 Analisi Consumi Aziendali',     description: 'Proponi un\'analisi dei consumi del tuo luogo di lavoro con un piano di miglioramento scritto.',              tags: ['tier2'] },
  { title: '🌿 Biodiversità Urbana',           description: 'Dedica un\'area del giardino o balcone a piante autoctone per favorire insetti impollinatori locali.',        tags: ['tier2'] },
  { title: '🔋 Accumulo Energetico',           description: 'Studia e presenta in famiglia un piano per l\'installazione di un sistema di accumulo energetico domestico.', tags: ['tier2'] },
  { title: '🚴 Sfida Ciclistica',              description: 'Registra tutti i km percorsi in bici questa settimana. Obiettivo minimo: 50 km.',                             tags: ['tier2'] },
  { title: '📦 Filiera Corta',                description: 'Per 7 giorni acquista solo prodotti a filiera corta certificata o direttamente dal produttore.',               tags: ['tier2'] },
  // ── Tier 3 (Lv 10+) ──────────────────────────────────────────────────────
  { title: '🌍 Progetto Comunitario',          description: 'Avvia un progetto di sostenibilità nel tuo comune: petizione, proposta al consiglio, evento pubblico.',       tags: ['tier3'] },
  { title: '⚡ Roadmap Energetica',            description: 'Crea una roadmap dettagliata per azzerare le emissioni domestiche entro 2 anni. Presenta il piano.',          tags: ['tier3'] },
  { title: '🏆 Carbon Neutral Week',           description: 'Per 7 giorni compensa ogni emissione prodotta piantando alberi o acquistando crediti certificati.',            tags: ['tier3'] },
  { title: '🌱 Imprenditore Verde',            description: 'Sviluppa e presenta una business idea a impatto ambientale positivo nel tuo settore professionale.',          tags: ['tier3'] },
  { title: '🔬 Report Ambientale',             description: 'Scrivi un report sull\'impatto ambientale della tua famiglia/azienda negli ultimi 30 giorni con KPI misurabili.', tags: ['tier3'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// 50 LOOT CHEST POP-CULTURE PHRASES
// Each is (euro, co2) → string
// ─────────────────────────────────────────────────────────────────────────────
const POP_COMPARISONS = [
  (e, c) => `Hai evitato ${c} kg di CO₂: come se Thanos avesse usato i guanti per raccogliere i rifiuti invece di dimezzare l'universo! 🫰`,
  (e, c) => `Con ${e}€ risparmiati potresti comprare ${Math.max(1, Math.round(e / 1.5))} caffè al bar — ma li hai investiti nel pianeta! ☕🌍`,
  (e, c) => `Hai risparmiato ${c} kg di CO₂: equivale a tenere spento un frigo per ${Math.round(c * 3)} giorni. Walter White approverebbe l'efficienza! 🧪`,
  (e, c) => `${c} kg di CO₂ evitata: è come se il Millennium Falcon usasse propulsione solare per tutta la galassia! 🚀`,
  (e, c) => `Hai risparmiato ${e}€: Daenerys userebbe i draghi per riscaldare casa, tu usi l'efficienza energetica. Chi vince? TU! 🐉`,
  (e, c) => `${c} kg di CO₂ in meno: neanche Iron Man col reattore Arc produce così poco! Sei più green di Tony Stark. 🦾`,
  (e, c) => `Con ${e}€ potresti comprare ${Math.max(1, Math.round(e / 12))} biglietti cinema — ma hai scelto di salvare il pianeta. Chapeau! 🎬`,
  (e, c) => `Hai evitato ${c} kg di CO₂: come piantare ${Math.max(1, Math.round(c / 21))} alberi. Gimli inizia a prenderti sul serio! 🌳`,
  (e, c) => `${c} kg di CO₂ evitata: il tuo quartiere respira meglio di Rivendell. Gli elfi ti ringraziano! 🧝`,
  (e, c) => `Risparmiati ${e}€: Mario avrebbe usato quei soldi per funghi, tu li reinvesti nel futuro! 🍄`,
  (e, c) => `Hai evitato ${c} kg di CO₂: Greta Thunberg ha appena aggiunto il tuo nome alla lista delle persone che capiscono. 🌿`,
  (e, c) => `${c} kg di CO₂ in meno: neanche Shrek nel suo pantano è così ecologico! 🧅`,
  (e, c) => `${e}€ risparmiati e ${c} kg di CO₂ evitata: passato di livello nella vita reale! 🎮`,
  (e, c) => `Hai evitato emissioni pari a ${Math.round(c * 3)} km in auto. Marty McFly avrebbe preso il DeLorean — tu la bici! 🚲`,
  (e, c) => `${c} kg di CO₂ evitata: Mbappé non corre così veloce quanto tu salvi il pianeta! ⚽`,
  (e, c) => `Con ${e}€ risparmiati avresti potuto comprare ${Math.max(1, Math.round(e / 4))} piantine — che hai già simbolicamente piantato col tuo stile di vita! 🌱`,
  (e, c) => `${c} kg di CO₂: Spiderman vorrebbe arrampicarsi sugli alberi che hai salvato! 🕷️`,
  (e, c) => `Hai risparmiato ${e}€: Hermione Granger avrebbe usato un incantesimo, tu hai usato il buon senso! 🪄`,
  (e, c) => `${c} kg di CO₂ evitata equivale a ${Math.round(c * 4)} ore di un motore diesel spento. Breaking Bad livello 2! 🏎️`,
  (e, c) => `Con ${e}€ risparmiati potresti fare ${Math.max(1, Math.round(e / 3))} ricariche di monopattino elettrico. Mobilità green FTW! 🛴`,
  (e, c) => `Hai evitato ${c} kg di CO₂: Batman patruglia Gotham, tu patruglia il pianeta. Chi è il vero eroe? 🦇`,
  (e, c) => `${e}€ risparmiati: non è l'oro di Scrooge McDuck, è meglio — è denaro reinvestito nel futuro! 💰`,
  (e, c) => `${c} kg di CO₂ risparmiata: Yoda direbbe "Forte sei con la Forza Verde!" 🌌`,
  (e, c) => `Hai evitato ${c} kg di CO₂: l'equivalente di ${Math.max(1, Math.round(c / 5))} voli low-cost evitati. Frequentatore del pianeta! ✈️🚫`,
  (e, c) => `Con ${e}€ risparmiati in bolletta: Elon Musk starebbe costruendo un razzo, tu stai costruendo un futuro migliore! 🚀`,
  (e, c) => `${c} kg di CO₂ evitata: persino Willy il Coyote si è fermato a fare i conti — e ammira il tuo impatto! 🌵`,
  (e, c) => `Hai risparmiato ${e}€: the Mandalorian direbbe "This is the Way" — e per lui il modo è il tuo! ⚔️`,
  (e, c) => `${c} kg di CO₂ in meno: come spegnere il motore di ${Math.round(c * 2)} motorini per un giorno. Aria più pulita per tutti! 🌬️`,
  (e, c) => `Con ${e}€ risparmiati potresti comprare ${Math.max(1, Math.round(e / 6))} kg di frutta bio locale. Il cerchio si chiude! 🍎`,
  (e, c) => `${c} kg di CO₂ evitata: il team di Avengers farebbe festa — anche Hulk sorride! 💚`,
  (e, c) => `Hai risparmiato ${e}€ di energia: in termini di missione Final Fantasy, hai completato una side quest epica! ⚔️✨`,
  (e, c) => `${c} kg di CO₂ risparmiata: neanche il castello di Hogwarts consuma così poco! 🏰`,
  (e, c) => `Con ${e}€ in meno spesi: potresti adottare simbolicamente ${Math.max(1, Math.round(e / 25))} panda del WWF! 🐼`,
  (e, c) => `Hai evitato ${c} kg di CO₂: è come se ${Math.max(2, Math.round(c / 5))} macchine non avessero guidato per un giorno intero! 🚗🚫`,
  (e, c) => `${e}€ risparmiati: Sherlock Holmes ha dedotto che sei uno dei migliori detective dell'efficienza energetica! 🔍`,
  (e, c) => `${c} kg di CO₂ in meno: il Professore de "La Casa di Carta" pianificherebbe la tua campagna eco! 🔴`,
  (e, c) => `Hai risparmiato ${e}€: in Soul (Pixar), la tua scintilla è chiaramente "salvare il pianeta". ✨`,
  (e, c) => `${c} kg di CO₂ evitata: Ted Lasso direbbe "Believe!" — e lui non sbaglia mai sul tifo per i campioni! ⚽🏆`,
  (e, c) => `Con ${e}€ risparmiati potresti fare la spesa bio per ${Math.max(1, Math.round(e / 15))} giorni. Il tuo superpotere è la coerenza! 💪`,
  (e, c) => `${c} kg di CO₂ evitata: Avatar (il film blu, non l'Ultimo Dominatore dell'Aria) piange di gioia! 💙`,
  (e, c) => `Hai evitato ${c} kg di CO₂: il tuo impatto è più positivo di quello di 10 influencer del benessere messi insieme! 📸`,
  (e, c) => `${e}€ risparmiati in bolletta: Severus Piton stesso direbbe che sei "eccezionalmente dotato" per il risparmio energetico! 🧙`,
  (e, c) => `${c} kg di CO₂ in meno: WALL-E sorride, finalmente qualcuno pulisce il pianeta prima di lui! 🤖`,
  (e, c) => `Con ${e}€ risparmiati potresti acquistare ${Math.max(1, Math.round(e / 8))} colture idroponiche per il tuo balcone! 🥬`,
  (e, c) => `Hai evitato ${c} kg di CO₂: Gollum direbbe "Il mio preziosoooo... pianeta!" — e finalmente avrebbe ragione! 💍`,
  (e, c) => `${c} kg di CO₂ risparmiata: persino il Grinch si è ammorbidito davanti al tuo impegno verde! 💚`,
  (e, c) => `Con ${e}€ risparmiati: Captain Planet avrebbe finalmente qualcuno da chiamare per rinforzo! 🌍⚡`,
  (e, c) => `${c} kg di CO₂ evitata equivale a ${Math.round(c * 500)} smartphone completamente caricati. Quanta energia hai preservato! 📱`,
  (e, c) => `Hai risparmiato ${e}€: se fossi in un RPG, avresti sbloccato il badge "Economo del Pianeta"! 🏅`,
  (e, c) => `${c} kg di CO₂ in meno: persino il Dott. Stranamore avrebbe smesso di preoccuparsi e imparato ad amare la sostenibilità! 🌏`,
];

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/** age group key */
function ageTag(age) {
  if (age <= 25) return 'young';
  if (age <= 50) return ['adult_M', 'adult_F'].includes('adult_' + 'M') ? 'adult' : 'adult';
  return 'senior';
}

/** Level tier tag */
function tierTag(level) {
  if (level >= 10) return 'tier3';
  if (level >= 4)  return 'tier2';
  return 'tier1';
}

/**
 * Filters a pool by relevance to the user profile.
 * A quest is eligible if it has tag 'all', or matches ageGroup, gender-specific group, or tier.
 */
function filterPool(pool, age, gender, level) {
  const ag  = age <= 25 ? 'young' : age <= 50 ? 'adult' : 'senior';
  const gt  = tierTag(level);
  const gk  = `${ag}_${gender}`; // e.g. 'adult_M'

  return pool.filter((q) => {
    const t = q.tags;
    return (
      t.includes('all') ||
      t.includes(ag)    ||
      t.includes(gk)    ||
      t.includes(gt)
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AI FUNCTION 1 — QUEST GENERATOR
// Generates 3 daily + 3 weekly, personalised, avoiding seenTitles
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ age, gender, level, rpg_class, seenTitles?: string[] }} user
 * @returns {{ quests: Array<{ title, description, type, xp_reward }> }}
 */
function generateQuests(user) {
  const seen    = user.seenTitles || [];
  const dailyPool  = filterPool(DAILY_QUESTS,  user.age, user.gender, user.level);
  const weeklyPool = filterPool(WEEKLY_QUESTS, user.age, user.gender, user.level);

  const dailySelected  = pickN(dailyPool,  3, seen);
  const weeklySelected = pickN(weeklyPool, 3, seen);

  // xp_reward is set by questService (100 daily / 300 weekly), but we assign
  // a placeholder here so the shape is consistent
  const quests = [
    ...dailySelected.map((q) => ({ title: q.title, description: q.description, type: 'daily',  xp_reward: 100 })),
    ...weeklySelected.map((q) => ({ title: q.title, description: q.description, type: 'weekly', xp_reward: 300 })),
  ];

  return { quests };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI FUNCTION 2 — LOOT CHEST CONVERTER
// 10 XP = €0.50 = 1 kg CO₂  (from SYSTEM_PROMPT.md)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {number} xp_total — cumulative lifetime XP
 * @returns {{ euro_saved, co2_saved_kg, pop_comparison }}
 */
function chestStats(xp_total) {
  const euro_saved   = parseFloat(((xp_total / 10) * 0.5).toFixed(2));
  const co2_saved_kg = parseFloat((xp_total / 10).toFixed(2));

  // Deterministic base index from XP so it changes as player progresses,
  // with a 30% chance of slight variation to avoid identical repeated opens
  const base   = Math.floor(xp_total / 20) % POP_COMPARISONS.length;
  const alt    = (base + 1 + Math.floor(Math.random() * 3)) % POP_COMPARISONS.length;
  const chosen = Math.random() < 0.3 ? alt : base;

  return {
    euro_saved,
    co2_saved_kg,
    pop_comparison: POP_COMPARISONS[chosen](euro_saved, co2_saved_kg),
  };
}

module.exports = { generateQuests, chestStats };
