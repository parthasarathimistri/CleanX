# CleanX — Real-Time Civic Action & Waste Management

**CleanX** is a high-performance, real-time reporting tool designed to bridge the gap between citizens, volunteers, and authorities. [cite_start]Built for the **DevFest SRMIST "Kernel Panic" Hackathon**, this project solves urban garbage dumping through a fast, interactive, and gamified interface[cite: 13, 16].

---

## 🚀 Key Features (Round 1 MVP)

[cite_start]CleanX meets and exceeds all **Minimum Viable Expectations** for Round 1[cite: 25]:

-   [cite_start]**Constraint-Compliant Reporting:** Implements a strict "Real Location Only" flow[cite: 33]. [cite_start]Users must either use the **Browser Geolocation API** or a **map-click** to drop a pin[cite: 34]. [cite_start]Manual coordinate entry is strictly prohibited to ensure data integrity[cite: 35].
-   **AI-Powered Severity Detection:** Features a simulated **Claude Vision AI** integration that analyzes "uploaded" photos to auto-suggest severity levels and identify environmental risks like toxic runoff or drainage blockage.
-   [cite_start]**Live Interactive Map:** A high-contrast **Dark CartoDB** tile layer rendering real coordinates[cite: 27]. [cite_start]Markers are color-coded based on severity: **Red (High)**, **Orange (Medium)**, and **Green (Low)**[cite: 19].
-   [cite_start]**Volunteer Action Flow:** Any user can tap a marker and "Claim" it for cleanup[cite: 20]. [cite_start]Status changes to "In Progress" reflect **live** without a page reload[cite: 28].
-   **Real-World Navigation:** Every report includes a one-tap link to **Google Maps Directions** for immediate volunteer deployment.
-   [cite_start]**Gamified Leaderboard:** A live status dashboard tracks "Total Reported," "In Progress," and "Cleaned" counts[cite: 21]. Volunteers earn points to drive community engagement.

---

## 🛠️ Tech Stack & Architecture

-   **Frontend:** React (Vite) for a blazing-fast, responsive UI.
-   **Mapping:** Leaflet.js with OpenStreetMap (OSM) data and CartoDB Dark tiles.
-   **Icons:** Lucide-React for crisp iconography.
-   **Gamification:** Canvas-Confetti for cleanup celebrations.
-   **Architecture:** Modular component-based structure designed for scalability into Round 2 (Firebase Integration).

---

## 📂 Project Structure

```text
src/
├── components/
│   └── Dashboard.jsx   # Real-time stats & Leaderboard
├── data/
│   └── dummyData.js    # 6 seed reports across India for immediate interaction
├── App.jsx             # Core Logic: Map, AI Simulation, & Reporting Flow
├── index.css           # Tailwind directives & Custom Animations
└── main.jsx            # React Entry Point


---
Partha Sarathi Mistri
Akshita Guha Thakurta
Riddhiman Basu
Debadrita Dasgupta