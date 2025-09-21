# Weekendje Weg – Quick Planner (MVP)

React + Vite + Tailwind app.

## Deployen met Vercel (zonder lokaal draaien)
1. Maak een **nieuwe GitHub repository** en upload alle bestanden uit deze map (zorg dat `package.json` en `vite.config.js` in de root staan).
2. Ga naar **Vercel → Add New → Project** en selecteer de repo.
3. Instellingen:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**. Klaar.

> Let op: omdat `package.json` `"type": "module"` bevat, gebruiken we **`postcss.config.cjs`** en **`tailwind.config.cjs`** (CommonJS). Dit voorkomt de PostCSS/Tailwind ESM fout op Vercel.
