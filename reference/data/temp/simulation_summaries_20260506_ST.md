# Simulation Summaries — Sha Tin 2026-05-06 (R1–R9)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=ST | form=all | ignore-after=2026-05-06
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-05-06 -v ST -r 1-9 -f all --use-saved`

═══════════════════════════════════════════════════════
RACE 1 - Sha Tin | Class 5 | 1650m AWT | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 HAILTOTHEVICTOR:  43.2% win,  81.3% place [9 form] rating: 75 diff: 0
  # 9 MEEPMEEP       :  23.0% win,  64.4% place [12 form] rating: 71 diff: 4
  # 6 LUCKY GENERATIO:  17.1% win,  55.5% place [9 form] rating: 69 diff: 6
  #12 PHANTOM CYCLONE:   7.7% win,  33.9% place [7 form] rating: 65 diff: 10
  # 7 CONCORDE STAR  :   2.7% win,  17.7% place [9 form] rating: 61 diff: 14
  #11 GO GO GO       :   2.1% win,  14.7% place [10 form] rating: 60 diff: 15
  #13 ORIENTAL SURPRI:   2.0% win,  14.9% place [16 form] rating: 60 diff: 15
  # 2 SMART CITY     :   0.9% win,   5.7% place [10 form] rating: 55 diff: 20
  # 3 FLOOF          :   0.9% win,   6.8% place [6 form] rating: 55 diff: 20
  #10 HAPPYDEARHAPPYD:   0.2% win,   1.9% place [5 form] rating: 50 diff: 25
  # 8 FORTUNE WARRIOR:   0.1% win,   1.0% place [8 form] rating: 47 diff: 28
  # 5 SPANGLE FORTUNE:   0.1% win,   1.3% place [5 form] rating: 49 diff: 26
  # 4 MEGA FORCE     :   0.0% win,   0.7% place [8 form] rating: 47 diff: 28
  #14 ALL EYES ON ME :   0.0% win,   0.4% place [9 form] rating: 46 diff: 29

  Differentiation (equiv hist thresholds): avgDiff 17 | diff<8: 3 | sparse: 0 | gap: 4 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 2/4 (50.0%) 🔴 | same class (Class 5): 0/2 (0.0%) 🔴 | same dist (1650m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=17 --gap=4 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Sha Tin | Class 5 | 1200m AWT | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 NOBLE DELUXE   :  36.5% win,  73.1% place [14 form] rating: 76 diff: 0
  # 6 SPICY SPANGLE  :  18.5% win,  53.2% place [8 form] rating: 72 diff: 4
  # 8 MACANESE MASTER:  15.2% win,  49.7% place [9 form] rating: 71 diff: 5
  #10 VIVA CHALEUR   :  12.8% win,  43.6% place [7 form] rating: 70 diff: 6
  # 9 ROBOT KNIGHT   :   7.1% win,  29.9% place [5 form] rating: 67 diff: 9
  # 3 NO OTHER CHOICE:   6.7% win,  29.5% place [9 form] rating: 67 diff: 9
  # 7 TOP TO SKY     :   1.5% win,   9.0% place [7 form] rating: 60 diff: 16
  # 4 SHINYU KOKOROE :   0.7% win,   5.0% place [10 form] rating: 57 diff: 19
  # 2 HAPPY ACTION   :   0.5% win,   3.0% place [6 form] rating: 55 diff: 21
  # 5 VON BAER       :   0.3% win,   3.0% place [8 form] rating: 55 diff: 21
  #12 BINGO BABE     :   0.0% win,   0.8% place [11 form] rating: 50 diff: 26
  #11 BRILLIANT FIRE :   0.0% win,   0.1% place [8 form] rating: 45 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 14 | diff<8: 4 | sparse: 0 | gap: 4 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 5/7 (71.4%) 🟢 | same class (Class 5): 0/2 (0.0%) 🔴 | same dist (1200m): 3/5 (60.0%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=4 --avgdiff=14 --gap=4 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Sha Tin | Class 4 | 1200m AWT | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 7 JUICY DRAGON   :  46.1% win,  83.4% place [9 form] rating: 73 diff: 0
  # 4 CLOUD NINE     :  28.4% win,  72.8% place [4 form] rating: 70 diff: 3
  # 3 SIGHT DREAMER  :  10.4% win,  44.3% place [9 form] rating: 64 diff: 9
  # 8 PERFECT TRIUMPH:   4.1% win,  24.1% place [3 form] rating: 60 diff: 13
  # 5 KOL            :   3.6% win,  19.2% place [1 form] rating: 58 diff: 15
  #10 JOY STAR       :   2.0% win,  13.5% place [4 form] rating: 56 diff: 17
  # 6 MEGA CAPTAIN   :   1.8% win,  12.0% place [1 form] rating: 56 diff: 17
  # 9 TOPSPIN KING   :   1.2% win,   9.4% place [3 form] rating: 54 diff: 19
  #12 LAKESHORE HERO :   1.0% win,   8.1% place [7 form] rating: 54 diff: 19
  # 2 VULCANUS       :   1.0% win,   8.9% place [14 form] rating: 54 diff: 19
  # 1 PRESTIGE WIN   :   0.2% win,   1.9% place [3 form] rating: 46 diff: 27
  #11 ZETA HEDGE     :   0.1% win,   2.5% place [5 form] rating: 47 diff: 26

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 2 | sparse: 2 | gap: 3 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 3/8 (37.5%) 🔴 | same class (Class 4): 1/3 (33.3%) 🔴 | same dist (1200m): 1/5 (20.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=2 --avgdiff=15 --gap=3 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Sha Tin | Class 4 | 1800m AWT | 11 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 11 horses, 5,000 iterations):
  # 1 HAPPY UNIVERSE :  39.3% win,  73.7% place [7 form] rating: 70 diff: 0
  # 2 ENTHRALLED     :  17.0% win,  48.3% place [10 form] rating: 65 diff: 5
  # 3 FOREVER FOLKS  :  12.3% win,  39.6% place [8 form] rating: 63 diff: 7
  # 5 GLORIOUS SUCCES:   7.6% win,  29.4% place [6 form] rating: 61 diff: 9
  # 4 PERFECT TEAM   :   5.9% win,  22.9% place [7 form] rating: 59 diff: 11
  # 8 GLORIOUS ST PAU:   5.5% win,  22.6% place [4 form] rating: 59 diff: 11
  # 9 YODA'S CHOICE  :   3.9% win,  18.5% place [10 form] rating: 58 diff: 12
  # 6 ARIEL          :   3.3% win,  15.5% place [13 form] rating: 57 diff: 13
  # 7 THE LION KING  :   2.5% win,  14.5% place [10 form] rating: 57 diff: 13
  #11 VIVA TASTE     :   1.6% win,   8.7% place [9 form] rating: 54 diff: 16
  #10 FIREFOOT       :   1.1% win,   6.3% place [12 form] rating: 53 diff: 17

  Differentiation (equiv hist thresholds): avgDiff 10 | diff<8: 3 | sparse: 0 | gap: 5 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 3/6 (50.0%) 🔴 | same class (Class 4): 2/3 (66.7%) 🟡 | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=10 --gap=5 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Sha Tin | Class 4 | 1200m AWT | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 2 LIGHT YEARS GLO:  53.2% win,  90.0% place [8 form] rating: 77 diff: 0
  # 3 ONE MAN SHOW   :  27.6% win,  78.4% place [8 form] rating: 73 diff: 4
  # 1 TOURBILLON GOLF:  12.4% win,  55.8% place [10 form] rating: 68 diff: 9
  # 5 MEGA AWESOME   :   1.6% win,  15.8% place [0 form] rating: 59 diff: 18
  # 8 FLYING SNIPER  :   1.6% win,  14.9% place [3 form] rating: 59 diff: 18
  # 4 DIAMOND SPARKLE:   1.1% win,  13.0% place [1 form] rating: 58 diff: 19
  # 7 SUPREME VOYAGER:   1.0% win,  11.1% place [5 form] rating: 57 diff: 20
  # 6 WORD OF KINDNES:   0.6% win,   8.5% place [2 form] rating: 56 diff: 21
  #10 CALIFORNIA BAY :   0.6% win,   7.8% place [12 form] rating: 56 diff: 21
  # 9 FOREVER FANCY  :   0.3% win,   3.9% place [3 form] rating: 52 diff: 25
  #11 MAGIC SUPER    :   0.0% win,   0.5% place [5 form] rating: 44 diff: 33
  #12 REGROWTH WINNER:   0.0% win,   0.3% place [5 form] rating: 41 diff: 36

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 2 | sparse: 2 | gap: 4 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 1/2 (50.0%) 🔴 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1200m): 1/2 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=2 --avgdiff=19 --gap=4 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Sha Tin | Class 4 | 1650m AWT | 13 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 13 horses, 5,000 iterations):
  # 6 NEVER PETER OUT:  50.5% win,  82.0% place [8 form] rating: 78 diff: 0
  # 5 BLOSSOMY       :  16.2% win,  51.1% place [5 form] rating: 71 diff: 7
  # 3 CALIFORNIA STAR:  10.2% win,  43.0% place [9 form] rating: 69 diff: 9
  #11 BULL ATTITUDE  :   7.6% win,  32.6% place [13 form] rating: 67 diff: 11
  # 9 DAILY TROPHY   :   6.3% win,  29.2% place [10 form] rating: 66 diff: 12
  # 7 HINOKAMI KAGURA:   3.7% win,  19.3% place [7 form] rating: 63 diff: 15
  # 8 SHOTGUN        :   2.5% win,  17.3% place [12 form] rating: 63 diff: 15
  # 4 LUCK IS BACK   :   1.7% win,  12.3% place [6 form] rating: 61 diff: 17
  #10 LEAPING STAR   :   0.8% win,   7.5% place [9 form] rating: 58 diff: 20
  #12 FASHION LEGEND :   0.3% win,   2.8% place [9 form] rating: 54 diff: 24
  #13 NIGHT PUROSANGU:   0.2% win,   1.7% place [11 form] rating: 53 diff: 25
  # 1 ALLCASH        :   0.0% win,   0.6% place [7 form] rating: 50 diff: 28
  # 2 CHILL KAKA     :   0.0% win,   0.6% place [8 form] rating: 48 diff: 30

  Differentiation (equiv hist thresholds): avgDiff 16 | diff<8: 2 | sparse: 0 | gap: 7 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 2/4 (50.0%) 🔴 | same class (Class 4): 1/1 (100.0%) 🟢 | same dist (1650m): 1/1 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=2 --avgdiff=16 --gap=7 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Sha Tin | Class 4 | 1200m AWT | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 2 NATURAL HIGH   :  26.7% win,  60.7% place [3 form] rating: 74 diff: 0
  # 4 GOOD CHAP      :  22.6% win,  55.6% place [7 form] rating: 73 diff: 1
  # 3 FUN N FUN TOGET:  11.3% win,  34.7% place [8 form] rating: 69 diff: 5
  # 7 BIGTIME GENERAT:   9.9% win,  32.2% place [9 form] rating: 68 diff: 6
  # 1 NOTTHESILLYONE :   9.2% win,  30.8% place [6 form] rating: 68 diff: 6
  # 6 GOOD LUCK BABE :   6.2% win,  22.7% place [11 form] rating: 66 diff: 8
  # 5 HAPPY SHOOTER  :   6.1% win,  22.9% place [5 form] rating: 66 diff: 8
  # 8 MAPOGO         :   2.9% win,  13.7% place [2 form] rating: 63 diff: 11
  #11 CONRAD THE GREA:   2.6% win,  13.0% place [7 form] rating: 63 diff: 11
  #10 SILVER SPURS   :   2.3% win,  12.5% place [9 form] rating: 62 diff: 12
  # 9 SKY PHOENIX    :   0.1% win,   1.1% place [3 form] rating: 52 diff: 22
  #12 FULL OF LAUGHTE:   0.1% win,   0.4% place [5 form] rating: 47 diff: 27

  Differentiation (equiv hist thresholds): avgDiff 10 | diff<8: 5 | sparse: 0 | gap: 1 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 8/16 (50.0%) 🔴 | same class (Class 4): 3/6 (50.0%) 🔴 | same dist (1200m): 5/7 (71.4%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=10 --gap=1 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Sha Tin | Class 3 | 1650m AWT | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 TALENTS AMBITIO:  46.3% win,  80.4% place [7 form] rating: 79 diff: 0
  #14 SUPREME AGILITY:  17.3% win,  54.4% place [7 form] rating: 73 diff: 6
  # 5 DRAGON AIR FORC:  12.3% win,  45.5% place [8 form] rating: 71 diff: 8
  # 7 SKY VINO       :  11.9% win,  43.5% place [10 form] rating: 71 diff: 8
  # 9 ENDEARED       :   3.8% win,  21.5% place [12 form] rating: 66 diff: 13
  # 6 LOCH TAY       :   3.6% win,  19.2% place [6 form] rating: 65 diff: 14
  # 8 GLITTERING LEGE:   3.0% win,  17.7% place [4 form] rating: 65 diff: 14
  #10 NOISY BOY      :   0.9% win,   6.5% place [9 form] rating: 59 diff: 20
  #11 NEZHA          :   0.3% win,   4.5% place [7 form] rating: 58 diff: 21
  # 2 STEPS AHEAD    :   0.2% win,   2.7% place [8 form] rating: 56 diff: 23
  # 3 SWORD POINT    :   0.1% win,   1.9% place [9 form] rating: 53 diff: 26
  #13 TURIN MASCOT   :   0.1% win,   0.9% place [5 form] rating: 51 diff: 28
  #12 FORTUNATE SON  :   0.1% win,   1.4% place [10 form] rating: 53 diff: 26
  # 4 WINNING DRAGON :   0.0% win,   0.0% place [1 form] rating: 43 diff: 36

  Differentiation (equiv hist thresholds): avgDiff 17 | diff<8: 2 | sparse: 1 | gap: 6 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 1/5 (20.0%) 🔴 | same class (Class 3): 1/2 (50.0%) 🔴 | same dist (1650m): 0/1 (0.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=2 --avgdiff=17 --gap=6 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Sha Tin | Class 3 | 1200m AWT | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 2 VICTORY SKY    :  48.2% win,  84.4% place [8 form] rating: 84 diff: 0
  #11 TARGET AUDIENCE:  21.7% win,  64.6% place [1 form] rating: 79 diff: 5
  # 5 SYMBOL OF STREN:   8.5% win,  38.7% place [9 form] rating: 74 diff: 10
  # 4 AURORA PATCH   :   8.4% win,  38.8% place [10 form] rating: 74 diff: 10
  # 7 BLAZING WIND   :   7.2% win,  34.2% place [7 form] rating: 73 diff: 11
  # 1 ROMANTIC SON   :   5.2% win,  29.3% place [10 form] rating: 72 diff: 12
  # 3 GALACTIC VOYAGE:   0.4% win,   3.7% place [6 form] rating: 62 diff: 22
  # 8 MUST GO        :   0.3% win,   3.3% place [11 form] rating: 61 diff: 23
  # 6 CITY GOLD BANNE:   0.1% win,   2.4% place [3 form] rating: 59 diff: 25
  # 9 SUPER JOY N FUN:   0.0% win,   0.5% place [8 form] rating: 55 diff: 29
  #10 HIGH PRAISE    :   0.0% win,   0.1% place [0 form] rating: 50 diff: 34
  #12 GIANT SPIRIT   :   0.0% win,   0.0% place [3 form] rating: 38 diff: 46

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 2 | sparse: 2 | gap: 5 | diff scan (info): **BET**
  **Betting (hist place %):** 🔴 — all AWT ST: 1/2 (50.0%) 🔴 | same class (Class 3): 1/1 (100.0%) 🟢 | same dist (1200m): 1/2 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=2 --avgdiff=19 --gap=5 --venue=ST --surface=AWT --form=all --ignore-after=2026-05-06` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Class 5 | 1650m | 14 | 0 | #1 HAILTOTHEVICTORS | 43.2% | 81.3% | 17 | 3 | 4 | 🔴 | 2/4 (50.0%) | 0/2 (0.0%) | 0/0 (no past BET) |
| R2 | Class 5 | 1200m | 12 | 0 | #1 NOBLE DELUXE | 36.5% | 73.1% | 14 | 4 | 4 | 🔴 | 5/7 (71.4%) | 0/2 (0.0%) | 3/5 (60.0%) |
| R3 | Class 4 | 1200m | 12 | 2 | #7 JUICY DRAGON | 46.1% | 83.4% | 15 | 2 | 3 | 🔴 | 3/8 (37.5%) | 1/3 (33.3%) | 1/5 (20.0%) |
| R4 | Class 4 | 1800m | 11 | 0 | #1 HAPPY UNIVERSE | 39.3% | 73.7% | 10 | 3 | 5 | 🔴 | 3/6 (50.0%) | 2/3 (66.7%) | 0/0 (no past BET) |
| R5 | Class 4 | 1200m | 12 | 2 | #2 LIGHT YEARS GLORY | 53.2% | 90.0% | 19 | 2 | 4 | 🔴 | 1/2 (50.0%) | 0/0 (no past BET) | 1/2 (50.0%) |
| R6 | Class 4 | 1650m | 13 | 0 | #6 NEVER PETER OUT | 50.5% | 82.0% | 16 | 2 | 7 | 🔴 | 2/4 (50.0%) | 1/1 (100.0%) | 1/1 (100.0%) |
| R7 | Class 4 | 1200m | 12 | 0 | #2 NATURAL HIGH | 26.7% | 60.7% | 10 | 5 | 1 | 🔴 | 8/16 (50.0%) | 3/6 (50.0%) | 5/7 (71.4%) |
| R8 | Class 3 | 1650m | 14 | 1 | #1 TALENTS AMBITION | 46.3% | 80.4% | 17 | 2 | 6 | 🔴 | 1/5 (20.0%) | 1/2 (50.0%) | 0/1 (0.0%) |
| R9 | Class 3 | 1200m | 12 | 2 | #2 VICTORY SKY | 48.2% | 84.4% | 19 | 2 | 5 | 🔴 | 1/2 (50.0%) | 1/1 (100.0%) | 1/2 (50.0%) |
