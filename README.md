# KuroX Discord Bot 🤖

Ein moderner, in Node.js geschriebener Discord-Bot (basierend auf `discord.js` v14), der nützliche Utility-Features wie Minecraft-Server-Statusabfragen und Profil-Tools mit Anime- und Unterhaltungs-Commands verbindet.

---

## ✨ Features

* **🎮 Minecraft Server Status (`/mcstatus`):** Prüft in Echtzeit, ob dein Minecraft-Server online ist, zeigt Spielerzahlen, die aktuelle Version, MOTD und das Server-Icon an (inklusive IP-Versteck-Option).
* **🖼️ Discord Profil-Viewer (`/discordpfp`):** Zeigt den Avatar und den Profil-Banner eines Discord-Nutzers in voller Auflösung an, mitsamt direkten Download-Links.
* **✨ Anime & Unterhaltung:**
  * `/cat` – Holt zufällige Catgirl-Bilder (über die Nekosia API) mit Live-Aktualisierungs-Button.
  * `/waifu` – Zeigt Anime-Bilder wahlweise nach Kategorien (*Waifu*, *Neko*, *Fox Girl*).
  * `/male` – Sendet zufällige Anime-Boy-Bilder inklusive Künstler-Angabe.
  * `/tsundere` – Interaktive Tsundere-Stimmungsauswahl (*Blush*, *Pout*, *Angry*, *Smug*) mit passendem Spruch und Bild.
* **🔒 Ephemere Antworten:** Jeder Befehl unterstützt eine `hidden`-Option, damit Antworten (auf Wunsch) nur für dich sichtbar sind.

---

## 🛠️ Installation & Setup

### 1. Voraussetzungen
Stelle sicher, dass du [Node.js](https://nodejs.org/) (ab Version 18 oder neuer) auf deinem System installiert hast.

### 2. Projekt klonen & Abhängigkeiten installieren
```bash
git clone [https://github.com/DEIN-BENUTZERNAME/DEIN-REPO.git](https://github.com/DEIN-BENUTZERNAME/DEIN-REPO.git)
cd DEIN-REPO
npm install discord.js
