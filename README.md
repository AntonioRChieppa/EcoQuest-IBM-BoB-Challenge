# 🌍 Eco-Quest

> *Eco-Quest trasforma il risparmio energetico in un gioco RPG: completa missioni sostenibili e guadagna XP e risparmio reale (CO2 ed Euro)!*

Progetto realizzato interamente con l'agente AI **IBM BoB** per la **"Hack Your AI Agent Challenge"** organizzata da IBM per gli studenti universitari di Napoli.

**Tempo a disposizione**: 2 ore

**Risultato Ufficiale:** Idea classificata nella Top 10 Progetti Realizzati

---

## Descrizione dell'idea

Eco-Quest è una soluzione concreta e implementabile che definisce in modo circoscritto il problema affrontato: lo spreco energetico domestico e la difficoltà di mantenere costanti comportamenti ecosostenibili. Il progetto contribuisce in modo diretto agli obiettivi dell'Agenda ONU 2030 a cui fa riferimento, generando un impatto reale sull'**Obiettivo 7** (promuovendo l'efficienza e il risparmio energetico quotidiano) e sull'**Obiettivo 13** (stimolando l'azione diretta contro il cambiamento climatico tramite la riduzione attiva delle emissioni).

La soluzione proposta è uno scenario realistico che gamifica l'azione climatica tramite un'applicazione RPG. I beneficiari diretti sono i cittadini, che ricevono uno strumento per adottare definitivamente uno stile di vita sostenibile.

Il ruolo della tecnologia è nevralgico: l'agente di Intelligenza Artificiale **IBM BoB** è il cuore pulsante del progetto. Agendo come "Game Master", BoB elabora i dati dell'utente per assegnare dinamicamente missioni ecologiche personalizzate e sempre fattibili.

L'impatto atteso è chiaro e misurabile. L'aspetto rivoluzionario risiede nella misurazione dell'impatto da parte di BoB e nella sua dirompente capacità di fidelizzazione: l'agente AI converte il successo delle missioni in risorse energetiche ed economiche effettivamente salvate. Per scatenare entusiasmo e incentivare l'uso continuo, queste risorse vengono rese spettacolarmente visibili all'utente. Traducendo i dati in gratificanti paragoni pop-culture (es. *"Hai risparmiato la CO2 necessaria per lo streaming dell'intera saga di Harry Potter!"*), l'AI trasforma la lotta al cambiamento climatico in una ricompensa visiva entusiasmante, ancorando il giocatore a un circolo virtuoso inarrestabile.

---

## Descrizione del Progetto e Specifiche di Sistema

Il progetto si basa su uno stack solido e un "Core Loop" gamificato ben definito[cite: 4]. Di seguito le specifiche tecniche e logiche del sistema:

### 🧠 Il Motore di Intelligenza Artificiale
L'intera logica applicativa fa affidamento su due funzioni AI principali:
*   **Quest Generator:** L'agente AI (IBM BoB) genera missioni ecologiche basandosi sui dati anagrafici forniti dall'utente in fase di registrazione, ovvero Età e Genere. Inoltre, la difficoltà delle missioni scala dinamicamente in base al Livello raggiunto dal giocatore.
*   **Generazione Bilanciata:** Ogni volta che l'utente richiede nuove sfide, l'AI genera esattamente 3 missioni giornaliere ("daily") e 3 missioni settimanali ("weekly").
*   **Controllo delle ripetizioni e Limiti:** Per evitare sfide impossibili o ripetitive, l'app interroga il database per escludere i titoli delle quest già completate. È inoltre presente un limite massimo di 3 generazioni di quest per sessione.
*   **Loot Chest Converter:** Una seconda funzione AI prende in input gli XP totali dell'utente e li converte in impatto reale. La regola di conversione è fissa: 10 XP equivalgono a 0.50€ risparmiati e 1 kg di CO2 evitata. Infine, l'AI elabora una divertente comparazione pop-culture per rendere il dato più tangibile.

### 🎮 Il Sistema RPG (Livelli, XP e Gradi)
EcoQuest implementa un vero e proprio sistema di progressione composto da 15 livelli massimi.
*   **Assegnazione Punti:** Le missioni giornaliere garantiscono un premio fisso di 100 XP. Le missioni settimanali, più complesse, premiano l'utente con 300 XP.
*   **Level-Up:** Per salire di livello, l'utente deve accumulare 500 XP nel livello corrente. In caso di passaggio di livello, l'eventuale "overflow" di XP viene conservato per il livello successivo. Gli XP totali non si resettano mai e alimentano unicamente il Forziere (Loot Chest).
*   **Avanzamento di Rango:** Raggiungendo livelli specifici (Milestone), la Classe RPG dell'utente si evolve:
    *   Livello 1: Recluta Inquinante
    *   Livello 3: Apprendista Green
    *   Livello 6: Esploratore Sostenibile
    *   Livello 10: Guardiano dell'Energia
    *   Livello 15: Campione dell'Agenda 2030

---

## 👥 Team IMC
EcoQuest è stata ideata e sviluppata come web app da:
* **Antonio Renato Chieppa**
* **Enrico Ajese**
* **Emanuele Carrino**

---

## 💻 Stack Tecnologico

Il progetto è diviso in due macro-componenti (Backend e Frontend) indipendenti tra loro e utilizza le seguenti tecnologie:
* **Backend:** Node.js, Express, Sequelize (ORM) con database SQLite3
* **Frontend:** AngularJS, Sass (pre-processore CSS)

---

## 🚀 Come testare il progetto in locale

Assicurati di avere [Node.js](https://nodejs.org/) installato sul tuo computer prima di procedere.

### 1. Clona la repository
```bash
git clone https://github.com/AntonioRChieppa/EcoQuest-IBM-BoB-Challenge.git
cd eco-quest
```

### 2. Setup del Backend
```bash
cd backend
npm install
```

(Se necessario, rinomina il file .env.example in .env e compila le variabili richieste).

Avvia il server:
```bash
npm start # oppure node server.js
```
Il backend sarà in ascolto (es. su http://localhost:3000). Il database SQLite verrà generato automaticamente.

### 3. Setup del Frontend
```bash
cd frontend
npm install
npm run build
```

A questo punto, apri il file index.html nel browser o visita la porta del tuo server di sviluppo locale per iniziare a giocare!

---

## 📸 Screenshots

![Dashboard EcoQuest](docs/dashboard.png)
*La dashboard dell'utente con la propria Classe RPG e le missioni assegnate da BoB.*

![Weekly Quest](docs/weekly_quest.png)
*Panoramica sulle weekly test generate per un account di test*

![Forziere XP](docs/loot.png)
*Il calcolo dinamico dell'impatto: trasformazione degli XP in Euro e CO2 risparmiata.*

