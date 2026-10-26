# Seller Rescue Kit

A small web app for Amazon sellers whose account health has slipped. It answers two questions that existing free tools don't:

1. **When will my account be healthy again?** Amazon measures sellers over rolling windows (60 days for Order Defect Rate, 30 for Late Shipment Rate, 7 for Pre-fulfilment Cancel Rate), so old problems drop off one day at a time. The **recovery planner** shows the exact day each problem leaves the window, the date the rate goes back under the limit, and what happens if more goes wrong (what-if slider).
2. **What do I write in my Plan of Action?** The **Plan of Action builder** walks through a 5 Whys root-cause analysis (Lean Six Sigma), the fixes already made and the prevention steps, writes a structured draft, and scores it out of 100 for the things a reviewer looks for: numbers and dates, a specific root cause, dated fixes, owners and frequencies, and no blame.

It opens with **sample data** for Kalamkari Kraft, a made-up Hyderabad saree seller whose Order Defect Rate went over 1% after monsoon courier delays. Paste your own daily numbers as CSV under **Your data**; they stay in your browser.

## Run it

Open `index.html`, or visit it on the site's GitHub Pages address under `/rescue-kit/`. No build step and no libraries.

## How it works

- `app.js` generates the sample seller (seeded, so it looks the same each visit, with dates ending today), computes each metric's rolling window, forecasts 60 days ahead from the orders per day you set, and draws the chart as SVG.
- Health targets used: Order Defect Rate under 1% (60 days), Late Shipment Rate under 4% (30 days), Pre-fulfilment Cancel Rate under 2.5% (7 days), Valid Tracking Rate over 95% (30 days).
- Each defect counts as one defective order. Amazon counts some orders after a short delay, so Seller Central can differ by a few days and is the official source.

Not affiliated with or endorsed by Amazon. Built by Shraddha Biswas with Claude Code.
