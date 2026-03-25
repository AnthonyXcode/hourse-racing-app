## Elite Jockey Statistics

*Data fetched: 3/22/2026, 12:46:52 PM*

### Current Season Win Rates

| Rank | Jockey | Code | Wins | Rides | Win % | Tier |
|------|--------|------|------|-------|-------|------|
| 1 | J Moreira | MOJ | 2 | 8 | 25.00% | ⭐⭐⭐ Elite |
| 2 | Z Purton | PZ | 87 | 432 | 20.14% | ⭐⭐⭐ Elite |
| 3 | J McDonald | MCJ | 16 | 101 | 15.84% | ⭐⭐ Strong |
| 4 | H Bowman | BH | 40 | 353 | 11.33% | ⭐ Good |
| 5 | A Atzeni | AA | 40 | 362 | 11.05% | ⭐ Good |
| 6 | L Chau | CJE | 29 | 301 | 9.63% | - |
| 7 | L Ferraris | FEL | 27 | 292 | 9.25% | - |
| 8 | W Wong | WEC | 19 | 212 | 8.96% | - |
| 9 | M Guyon | GM | 15 | 169 | 8.88% | - |
| 10 | Y Ho | HCY | 25 | 285 | 8.77% | - |
| 11 | B McMonagle | MDB | 10 | 129 | 7.75% | - |
| 12 | H Bentley | BHW | 22 | 293 | 7.51% | - |
| 13 | L Hewitson | HEL | 21 | 303 | 6.93% | - |
| 14 | F Poon | PMF | 21 | 309 | 6.80% | - |
| 15 | K Teetan | TEK | 25 | 382 | 6.54% | - |
| 16 | C Leung | LDE | 17 | 267 | 6.37% | - |
| 17 | A Badel | BA | 18 | 297 | 6.06% | - |
| 18 | L Yeung | YML | 15 | 284 | 5.28% | - |
| 19 | B Avdulla | AVB | 11 | 280 | 3.93% | - |
| 20 | M Chadwick | CML | 11 | 289 | 3.81% | - |
| 21 | R Kingscote | KRW | 9 | 291 | 3.09% | - |

### Rating Boosts (for model)

| Win % Range | Rating Boost | Priority |
|-------------|--------------|----------|
| > 20% | +10 | ⭐⭐⭐ Elite |
| 15-20% | +7 | ⭐⭐ Strong |
| 10-15% | +4 | ⭐ Good |
| < 10% | 0 | - |

### Data Source

```bash
# Fetch latest jockey stats
npx tsx tools/fetch-jockey-stats.ts
```

URL: `https://racing.hkjc.com/en-us/local/information/jockeywinstat?JockeyId={code}`