# Simulation Summaries — Happy Valley 2026-04-29 (R1–R9)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=HV | form=all | ignore-after=2026-04-29
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-04-29 -v "Happy Valley" -r 1-9 -f all --use-saved`

═══════════════════════════════════════════════════════
RACE 1 - Happy Valley | Class 4 | 1800m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 5 FAMILY FORTUNE :  39.1% win,  74.6% place [8 form] rating: 73 diff: 0
  # 7 PERFECT PAIRING:  18.7% win,  53.4% place [12 form] rating: 67 diff: 6
  # 1 CELESTIAL HARMO:  12.4% win,  43.4% place [9 form] rating: 64 diff: 9
  # 6 KASA PAPA      :  11.2% win,  38.9% place [7 form] rating: 63 diff: 10
  # 8 PERFECT PEACH  :   9.2% win,  35.1% place [5 form] rating: 62 diff: 11
  # 4 DASHING MAURISO:   2.9% win,  14.6% place [9 form] rating: 55 diff: 18
  #10 HAPPY BUDDIES  :   2.4% win,  12.8% place [7 form] rating: 53 diff: 20
  # 9 GOLDEN FAIRY   :   1.9% win,  10.7% place [7 form] rating: 52 diff: 21
  #11 ISLAND GOLDEN  :   0.9% win,   6.3% place [8 form] rating: 49 diff: 24
  #12 MR ALADDIN     :   0.8% win,   5.2% place [10 form] rating: 48 diff: 25
  # 2 DILBAGH        :   0.4% win,   3.2% place [6 form] rating: 45 diff: 28
  # 3 SPLENDID FORCE :   0.2% win,   1.8% place [7 form] rating: 43 diff: 30

  Differentiation (equiv hist thresholds): avgDiff 17 | diff<8: 2 | sparse: 0 | gap: 6
  **Betting (hist place %):** 🟢 — all Turf HV: 1/1 (100.0%) 🟢 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=2 --avgdiff=17 --gap=6 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Happy Valley | Class 4 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 HONEST WITNESS :  38.5% win,  72.2% place [7 form] rating: 71 diff: 0
  # 6 THE PERFECT MAT:  24.1% win,  60.6% place [5 form] rating: 68 diff: 3
  # 9 KING GLORIOSO  :   9.2% win,  34.1% place [6 form] rating: 61 diff: 10
  # 8 SEA DIAMOND    :   5.7% win,  24.4% place [3 form] rating: 58 diff: 13
  # 3 EVERSTAR       :   5.0% win,  20.8% place [11 form] rating: 56 diff: 15
  #10 GLACIATED      :   4.5% win,  20.0% place [10 form] rating: 56 diff: 15
  # 2 VERY GRATEFUL  :   4.2% win,  18.6% place [4 form] rating: 55 diff: 16
  # 7 AMO ERGO SUM   :   2.1% win,  11.8% place [2 form] rating: 52 diff: 19
  #12 GOLDEN FRIENDSH:   2.0% win,  12.0% place [9 form] rating: 52 diff: 19
  #11 LEAN MASTER    :   1.8% win,  10.1% place [10 form] rating: 51 diff: 20
  # 5 SOO KOO        :   1.8% win,   9.8% place [0 form] rating: 51 diff: 20
  # 1 CHEAHA         :   1.0% win,   5.7% place [8 form] rating: 47 diff: 24

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 2 | sparse: 1 | gap: 3
  **Betting (hist place %):** 🔴 — all Turf HV: 4/5 (80.0%) 🟢 | same class (Class 4): 0/1 (0.0%) 🔴 | same dist (1200m): 2/2 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=2 --avgdiff=15 --gap=3 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Happy Valley | Class 4 | 2200m Turf | 12 runners ❌
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 2 NOBLE PURSUIT  :  23.0% win,  53.1% place [10 form] rating: 69 diff: 0
  # 9 STAR BROSE     :  16.9% win,  44.3% place [11 form] rating: 67 diff: 2
  #11 ROMANTIC FANTAS:  14.4% win,  41.8% place [10 form] rating: 66 diff: 3
  # 5 DOUBLE WIN     :  12.4% win,  35.6% place [9 form] rating: 65 diff: 4
  # 3 SERANGOON      :  11.9% win,  36.6% place [8 form] rating: 65 diff: 4
  # 8 JOYFUL PROSPERI:   7.1% win,  23.6% place [6 form] rating: 61 diff: 8
  # 6 PACKING HURRICA:   2.8% win,  13.4% place [7 form] rating: 56 diff: 13
  # 1 AGENDA         :   2.8% win,  13.5% place [6 form] rating: 56 diff: 13
  # 4 KING OF SELECTI:   2.7% win,  11.1% place [6 form] rating: 54 diff: 15
  # 7 OCEAN IMPACT   :   2.6% win,  11.6% place [9 form] rating: 55 diff: 14
  #10 SUPER GOLDENDRA:   1.9% win,   8.3% place [5 form] rating: 53 diff: 16
  #12 SMART CITY     :   1.4% win,   7.0% place [9 form] rating: 52 diff: 17

  Differentiation (equiv hist thresholds): avgDiff 9 | diff<8: 5 | sparse: 0 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf HV: 8/19 (42.1%) 🔴 | same class (Class 4): 3/8 (37.5%) 🔴 | same dist (2200m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=9 --gap=2 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Happy Valley | Class 4 | 1200m Turf | 12 runners ✅✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 CROSSBORDERDUDE:  50.1% win,  81.6% place [7 form] rating: 78 diff: 0
  # 3 FIND MY LOVE   :  11.9% win,  44.5% place [7 form] rating: 67 diff: 11
  # 5 ACE POWER      :  11.2% win,  39.3% place [8 form] rating: 66 diff: 12
  # 2 JOY CAPITAL    :   7.0% win,  28.6% place [5 form] rating: 63 diff: 15
  # 4 BRIGHT DAY     :   7.0% win,  29.8% place [9 form] rating: 63 diff: 15
  # 7 STARRY SHOW    :   4.3% win,  22.0% place [8 form] rating: 60 diff: 18
  #10 BRAVE WIN      :   2.6% win,  14.3% place [8 form] rating: 57 diff: 21
  #11 WINNING NOW    :   1.6% win,   9.5% place [6 form] rating: 54 diff: 24
  # 6 LIGHTNING ACE  :   1.3% win,   9.1% place [2 form] rating: 53 diff: 25
  # 9 FLASH STAR     :   1.3% win,   8.4% place [10 form] rating: 53 diff: 25
  #12 HEROIC MASTER  :   1.2% win,   8.5% place [6 form] rating: 53 diff: 25
  # 8 AWESOME TREASUR:   0.5% win,   4.3% place [12 form] rating: 49 diff: 29

  Differentiation (equiv hist thresholds): avgDiff 18 | diff<8: 1 | sparse: 0 | gap: 11
  **Betting (hist place %):** — — all Turf HV: 0/0 (no past BET) ⚪ | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1200m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=1 --avgdiff=18 --gap=11 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Happy Valley | Class 4 | 1200m Turf | 12 runners ❌
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 5 THUNDER PRINCE :  24.8% win,  58.5% place [11 form] rating: 67 diff: 0
  # 2 SUPERB KING    :  24.1% win,  56.9% place [11 form] rating: 67 diff: 0
  # 8 GAMEPLAYER ELIT:  12.5% win,  38.8% place [8 form] rating: 62 diff: 5
  # 4 MIGHTY FIGHTER :  12.4% win,  37.4% place [1 form] rating: 61 diff: 6
  # 9 LEGEND STAR    :   8.1% win,  28.1% place [9 form] rating: 59 diff: 8
  # 7 FORZA LEADER   :   5.0% win,  19.3% place [8 form] rating: 55 diff: 12
  # 3 ORIGIN OF FORM :   4.2% win,  18.9% place [6 form] rating: 55 diff: 12
  # 6 KING CANNON    :   4.0% win,  17.3% place [2 form] rating: 54 diff: 13
  #12 VIGOR ELLEEGANT:   1.5% win,   7.4% place [7 form] rating: 49 diff: 18
  #10 SWEET BRIAR    :   1.4% win,   7.6% place [6 form] rating: 49 diff: 18
  #11 QUICK MONEY    :   1.1% win,   5.4% place [10 form] rating: 47 diff: 20
  # 1 LUCKY DOCTOR   :   0.8% win,   4.5% place [4 form] rating: 45 diff: 22

  Differentiation (equiv hist thresholds): avgDiff 11 | diff<8: 4 | sparse: 1 | gap: 0
  **Betting (hist place %):** 🔴 — all Turf HV: 20/33 (60.6%) 🟡 | same class (Class 4): 8/14 (57.1%) 🔴 | same dist (1200m): 9/13 (69.2%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=4 --avgdiff=11 --gap=0 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Happy Valley | Class 4 | 1650m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 MIGHTY STEED   :  28.9% win,  62.2% place [9 form] rating: 73 diff: 0
  # 3 BEAUTY VIVA    :  21.2% win,  52.3% place [11 form] rating: 70 diff: 3
  # 8 GENERAL REDWOOD:  12.2% win,  36.9% place [4 form] rating: 66 diff: 7
  #10 VIVACIOUS WIN  :   9.3% win,  32.2% place [7 form] rating: 64 diff: 9
  # 9 JUSTIFYING     :   8.0% win,  27.9% place [5 form] rating: 63 diff: 10
  # 2 ROMANTIC LAOS  :   6.3% win,  22.9% place [9 form] rating: 61 diff: 12
  # 6 NEVER TOO SOON :   3.6% win,  15.8% place [8 form] rating: 59 diff: 14
  # 7 THE ABSOLUTE   :   3.5% win,  15.8% place [3 form] rating: 58 diff: 15
  #12 WINNING DATA   :   2.5% win,  11.5% place [7 form] rating: 56 diff: 17
  #11 EXCELLENT BOY  :   2.3% win,  11.3% place [7 form] rating: 56 diff: 17
  # 4 ANOTHER ZONDA  :   1.4% win,   6.4% place [12 form] rating: 52 diff: 21
  # 5 LUCKY TOGETHER :   0.8% win,   4.7% place [6 form] rating: 50 diff: 23

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 3 | sparse: 0 | gap: 3
  **Betting (hist place %):** 🔴 — all Turf HV: 4/6 (66.7%) 🟡 | same class (Class 4): 1/2 (50.0%) 🔴 | same dist (1650m): 2/3 (66.7%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=12 --gap=3 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Happy Valley | Class 4 | 1000m Turf | 10 runners ✅✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 10 horses, 5,000 iterations):
  # 2 COLOURFUL KING :  40.9% win,  74.9% place [7 form] rating: 75 diff: 0
  # 8 GLOWING PRAISES:  21.4% win,  56.7% place [4 form] rating: 70 diff: 5
  # 3 BOTTOMUPTOGETHE:  10.9% win,  38.1% place [6 form] rating: 65 diff: 10
  #10 CANDLELIGHT DIN:   6.8% win,  29.7% place [9 form] rating: 62 diff: 13
  # 1 STELLAR EXPRESS:   6.8% win,  30.1% place [9 form] rating: 62 diff: 13
  # 5 BRAVE STAR     :   4.7% win,  23.6% place [7 form] rating: 60 diff: 15
  # 9 YOUTHFUL SPIRIT:   3.2% win,  15.9% place [10 form] rating: 57 diff: 18
  # 6 AKASHVANI      :   3.1% win,  15.7% place [11 form] rating: 57 diff: 18
  # 4 MAGIC CONTROL  :   1.7% win,  12.5% place [11 form] rating: 55 diff: 20
  # 7 SON PAK FU     :   0.4% win,   2.7% place [5 form] rating: 46 diff: 29

  Differentiation (equiv hist thresholds): avgDiff 14 | diff<8: 2 | sparse: 0 | gap: 5
  **Betting (hist place %):** 🟢 — all Turf HV: 3/3 (100.0%) 🟢 | same class (Class 4): 1/1 (100.0%) 🟢 | same dist (1000m): 1/1 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=2 --avgdiff=14 --gap=5 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Happy Valley | Class 4 | 1200m Turf | 12 runners ✅✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 GIANT BALLON   :  53.8% win,  85.5% place [9 form] rating: 81 diff: 0
  # 2 HAPPY INDEX    :  18.1% win,  57.4% place [4 form] rating: 72 diff: 9
  # 8 EMBRACE ABERDEE:   7.0% win,  31.6% place [5 form] rating: 65 diff: 16
  #12 MEOWTH         :   5.9% win,  27.9% place [8 form] rating: 64 diff: 17
  # 6 FLYING WROTE   :   4.2% win,  25.0% place [9 form] rating: 63 diff: 18
  # 3 SPORTS LEGEND  :   3.8% win,  21.3% place [8 form] rating: 61 diff: 20
  #11 SPIRIT OF PEACE:   2.3% win,  15.2% place [12 form] rating: 59 diff: 22
  # 1 MID WINTER WIND:   1.5% win,  10.7% place [6 form] rating: 57 diff: 24
  # 5 CAUSEWAY KING  :   1.1% win,   8.3% place [1 form] rating: 54 diff: 27
  #10 HEY BROS       :   1.0% win,   7.8% place [3 form] rating: 54 diff: 27
  # 9 COPARTNER FLEET:   0.8% win,   6.4% place [8 form] rating: 53 diff: 28
  # 7 TACTICAL ACE   :   0.4% win,   3.0% place [2 form] rating: 49 diff: 32

  Differentiation (equiv hist thresholds): avgDiff 20 | diff<8: 1 | sparse: 1 | gap: 9
  **Betting (hist place %):** 🟢 — all Turf HV: 1/1 (100.0%) 🟢 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1200m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=1 --avgdiff=20 --gap=9 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Happy Valley | Class 4 | 1650m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 6 ARMOR GOLDEN EA:  31.2% win,  64.8% place [7 form] rating: 74 diff: 0
  # 5 FANTASTIC FUN  :  23.2% win,  57.8% place [11 form] rating: 72 diff: 2
  # 1 SOLID WIN      :  13.8% win,  42.2% place [8 form] rating: 68 diff: 6
  # 2 KEEFY          :  10.5% win,  35.6% place [9 form] rating: 66 diff: 8
  # 9 STORMI         :   7.8% win,  27.8% place [8 form] rating: 64 diff: 10
  # 3 CORLEONE       :   3.7% win,  17.8% place [5 form] rating: 60 diff: 14
  # 7 CALIFORNIA MOXI:   3.0% win,  13.5% place [9 form] rating: 58 diff: 16
  #10 VIVA GRACIOUSNE:   1.8% win,   8.9% place [9 form] rating: 55 diff: 19
  #11 LUCKY TWIN STAR:   1.6% win,  10.8% place [7 form] rating: 56 diff: 18
  #12 WITHALLMYFAITH :   1.5% win,   8.7% place [11 form] rating: 55 diff: 19
  # 4 I CAN          :   1.3% win,   7.2% place [11 form] rating: 53 diff: 21
  # 8 SPICY GOLD     :   0.6% win,   4.8% place [9 form] rating: 51 diff: 23

  Differentiation (equiv hist thresholds): avgDiff 13 | diff<8: 3 | sparse: 0 | gap: 2
  **Betting (hist place %):** 🟢 — all Turf HV: 4/5 (80.0%) 🟢 | same class (Class 4): 1/1 (100.0%) 🟢 | same dist (1650m): 2/2 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=13 --gap=2 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-29` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Class 4 | 1800m | 12 | 0 | #5 FAMILY FORTUNE | 39.1% | 74.6% | 17 | 2 | 6 | 🟢 | 1/1 (100.0%) | 0/0 (no past BET) | 0/0 (no past BET) |
| R2 | Class 4 | 1200m | 12 | 1 | #4 HONEST WITNESS | 38.5% | 72.2% | 15 | 2 | 3 | 🔴 | 4/5 (80.0%) | 0/1 (0.0%) | 2/2 (100.0%) |
| R3 | Class 4 | 2200m | 12 | 0 | #2 NOBLE PURSUIT | 23.0% | 53.1% | 9 | 5 | 2 | 🔴 | 8/19 (42.1%) | 3/8 (37.5%) | 0/0 (no past BET) |
| R4 | Class 4 | 1200m | 12 | 0 | #1 CROSSBORDERDUDE | 50.1% | 81.6% | 18 | 1 | 11 | — | 0/0 (no past BET) | 0/0 (no past BET) | 0/0 (no past BET) |
| R5 | Class 4 | 1200m | 12 | 1 | #5 THUNDER PRINCE | 24.8% | 58.5% | 11 | 4 | 0 | 🔴 | 20/33 (60.6%) | 8/14 (57.1%) | 9/13 (69.2%) |
| R6 | Class 4 | 1650m | 12 | 0 | #1 MIGHTY STEED | 28.9% | 62.2% | 12 | 3 | 3 | 🔴 | 4/6 (66.7%) | 1/2 (50.0%) | 2/3 (66.7%) |
| R7 | Class 4 | 1000m | 10 | 0 | #2 COLOURFUL KING | 40.9% | 74.9% | 14 | 2 | 5 | 🟢 | 3/3 (100.0%) | 1/1 (100.0%) | 1/1 (100.0%) |
| R8 | Class 4 | 1200m | 12 | 1 | #4 GIANT BALLON | 53.8% | 85.5% | 20 | 1 | 9 | 🟢 | 1/1 (100.0%) | 0/0 (no past BET) | 0/0 (no past BET) |
| R9 | Class 4 | 1650m | 12 | 0 | #6 ARMOR GOLDEN EAGLE | 31.2% | 64.8% | 13 | 3 | 2 | 🟢 | 4/5 (80.0%) | 1/1 (100.0%) | 2/2 (100.0%) |
