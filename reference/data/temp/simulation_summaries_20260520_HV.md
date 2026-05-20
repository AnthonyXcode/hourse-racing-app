# Simulation Summaries — Happy Valley 2026-05-20 (R1–R9)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=HV | form=all | ignore-after=2026-05-20
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-05-20 -v "Happy Valley" -r 1-9 -f all --use-saved`

═══════════════════════════════════════════════════════
RACE 1 - Happy Valley | Class 5 | 1000m Turf | 12 runners ❌(odds:>7)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 3 MAJESTIC DELIGH:  25.1% win,  59.0% place [13 form] rating: 69 diff: 0
  # 8 SPICY SPANGLE  :  23.7% win,  55.9% place [9 form] rating: 68 diff: 1
  # 5 COUNTRY DANCER :  11.9% win,  36.7% place [4 form] rating: 63 diff: 6
  # 9 ISLAND BREEZES :  11.9% win,  37.6% place [9 form] rating: 63 diff: 6
  # 7 KING ALLOY     :   7.8% win,  28.7% place [9 form] rating: 61 diff: 8
  #10 CIRCUIT VICTORY:   7.7% win,  27.9% place [7 form] rating: 60 diff: 9
  #11 TAIHANG SCENERY:   6.3% win,  23.9% place [6 form] rating: 59 diff: 10
  # 1 HEROIC MASTER  :   2.5% win,  12.3% place [7 form] rating: 54 diff: 15
  # 4 YOUNG STRIKER  :   1.1% win,   6.8% place [5 form] rating: 49 diff: 20
  #12 BRILLIANT FIRE :   1.0% win,   5.4% place [9 form] rating: 48 diff: 21
  # 2 CONSPIRATOR    :   0.7% win,   4.5% place [8 form] rating: 47 diff: 22
  # 6 HANDSOME BLOND :   0.3% win,   1.5% place [4 form] rating: 41 diff: 28

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 4 | sparse: 0 | gap: 1
  **Betting (hist place %):** 🔴 — all Turf HV: 18/29 (62.1%) 🟡 | same class (Class 5): 3/6 (50.0%) 🔴 | same dist (1000m): 2/4 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=4 --avgdiff=12 --gap=1 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Happy Valley | Class 4 | 1650m Turf | 12 runnersrunners ❌(odds:>7)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 3 NEVER TOO SOON :  25.5% win,  58.7% place [9 form] rating: 72 diff: 0
  # 2 GLORIOUS JOURNE:  20.2% win,  51.1% place [9 form] rating: 70 diff: 2
  #10 VIVACIOUS WIN  :  12.8% win,  38.8% place [8 form] rating: 67 diff: 5
  # 6 AESTHETICISM   :   9.1% win,  30.0% place [12 form] rating: 64 diff: 8
  # 5 THE ABSOLUTE   :   8.6% win,  29.3% place [4 form] rating: 64 diff: 8
  #11 BULL ATTITUDE  :   7.7% win,  27.9% place [14 form] rating: 63 diff: 9
  # 7 DAILY ACCLAIM  :   6.5% win,  23.7% place [3 form] rating: 62 diff: 10
  # 4 VERY GRATEFUL  :   5.9% win,  21.3% place [5 form] rating: 61 diff: 11
  # 8 TURIN WARRIOR  :   2.5% win,  11.7% place [7 form] rating: 57 diff: 15
  # 9 BEAUTY GEMINI  :   0.9% win,   4.4% place [3 form] rating: 50 diff: 22
  #12 TO INFINITY    :   0.2% win,   1.8% place [11 form] rating: 46 diff: 26
  # 1 IVY LEAGUE     :   0.1% win,   1.4% place [4 form] rating: 45 diff: 27

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 3 | sparse: 0 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf HV: 15/22 (68.2%) 🟡 | same class (Class 4): 7/10 (70.0%) 🟢 | same dist (1650m): 5/9 (55.6%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=12 --gap=2 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Happy Valley | Class 4 | 1200m Turf | 12 runners ❌(avgDiff 9, diff<8: 5, gap: 0)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  #10 CAPTAIN LINK   :  23.9% win,  53.4% place [6 form] rating: 66 diff: 0
  # 6 LIVE WIRE      :  23.1% win,  52.9% place [5 form] rating: 66 diff: 0
  # 4 GEORGIAN SIGMA :  11.9% win,  35.7% place [3 form] rating: 61 diff: 5
  # 8 BROWNNEEDSFURTH:  10.1% win,  32.1% place [8 form] rating: 60 diff: 6
  # 5 FREE PONY      :   7.7% win,  28.1% place [9 form] rating: 59 diff: 7
  # 9 LEGEND STAR    :   6.7% win,  23.3% place [10 form] rating: 57 diff: 9
  # 1 COPARTNER FLEET:   5.3% win,  20.5% place [9 form] rating: 56 diff: 10
  #11 STORMY KNIGHT  :   2.8% win,  14.2% place [5 form] rating: 53 diff: 13
  # 7 HEROIC VANGUARD:   2.8% win,  11.9% place [2 form] rating: 52 diff: 14
  # 3 CHEAHA         :   2.6% win,  12.2% place [9 form] rating: 52 diff: 14
  #12 VIGOR ELLEEGANT:   2.2% win,  10.2% place [8 form] rating: 51 diff: 15
  # 2 VULCANUS       :   0.9% win,   5.7% place [15 form] rating: 47 diff: 19

  Differentiation (equiv hist thresholds): avgDiff 9 | diff<8: 5 | sparse: 0 | gap: 0
  **Betting (hist place %):** 🟡 — all Turf HV: 29/48 (60.4%) 🟡 | same class (Class 4): 15/24 (62.5%) 🟡 | same dist (1200m): 9/13 (69.2%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=9 --gap=0 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Happy Valley | Class 4 | 1650m Turf | 12 runners ⚠️(odds: 6.9)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 6 FORTUNE STAR   :  31.8% win,  64.1% place [10 form] rating: 71 diff: 0
  # 8 DECISION LINK  :  16.1% win,  46.0% place [11 form] rating: 66 diff: 5
  # 1 ANOTHER ZONDA  :  12.2% win,  38.2% place [13 form] rating: 64 diff: 7
  # 7 SURE JOYFUL    :  11.2% win,  35.5% place [10 form] rating: 63 diff: 8
  # 4 LUCKY TOGETHER :   7.6% win,  25.3% place [7 form] rating: 60 diff: 11
  # 3 FLYING FORTUNE :   6.2% win,  23.5% place [5 form] rating: 59 diff: 12
  # 2 LUCK IS BACK   :   6.0% win,  23.0% place [7 form] rating: 59 diff: 12
  # 5 COLOURFUL GAN  :   2.9% win,  12.5% place [7 form] rating: 54 diff: 17
  #12 OUR LUCKY GLORY:   2.6% win,  13.8% place [8 form] rating: 55 diff: 16
  # 9 LEAPING STAR   :   2.0% win,   9.4% place [10 form] rating: 52 diff: 19
  #10 NORTHERN BEAST :   0.9% win,   4.9% place [9 form] rating: 48 diff: 23
  #11 BLAZING BEAM   :   0.6% win,   3.7% place [8 form] rating: 47 diff: 24

  Differentiation (equiv hist thresholds): avgDiff 13 | diff<8: 3 | sparse: 0 | gap: 5
  **Betting (hist place %):** 🟡 — all Turf HV: 11/14 (78.6%) 🟢 | same class (Class 4): 5/6 (83.3%) 🟢 | same dist (1650m): 2/3 (66.7%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=13 --gap=5 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Happy Valley | Class 4 | 1000m Turf | 12 runners ⚠️(odds: 6.1)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 BEAUTY SHOW    :  24.0% win,  56.0% place [2 form] rating: 72 diff: 0
  # 2 TYCOON RESOURCE:  16.6% win,  43.9% place [1 form] rating: 69 diff: 3
  # 7 GRAND NOVA     :  15.7% win,  41.7% place [6 form] rating: 68 diff: 4
  # 5 WINNING MONEY  :  14.5% win,  41.9% place [7 form] rating: 68 diff: 4
  #10 BITS SUPERSTAR :   7.4% win,  25.0% place [7 form] rating: 63 diff: 9
  # 3 BEAUTY THUNDER :   6.6% win,  25.4% place [11 form] rating: 63 diff: 9
  # 9 SUPER SIXTY    :   5.7% win,  21.8% place [6 form] rating: 62 diff: 10
  # 8 HARMONY FIRE   :   4.7% win,  18.4% place [8 form] rating: 61 diff: 11
  #12 HAPPY UNITED   :   2.6% win,  12.9% place [7 form] rating: 58 diff: 14
  #11 ZEPHYR         :   1.2% win,   6.8% place [5 form] rating: 53 diff: 19
  # 6 FLYING TING LOK:   1.0% win,   5.5% place [3 form] rating: 52 diff: 20
  # 1 GIANT SPIRIT   :   0.0% win,   0.5% place [4 form] rating: 40 diff: 32

  Differentiation (equiv hist thresholds): avgDiff 11 | diff<8: 4 | sparse: 1 | gap: 3
  **Betting (hist place %):** 🔴 — all Turf HV: 28/45 (62.2%) 🟡 | same class (Class 4): 13/23 (56.5%) 🔴 | same dist (1000m): 3/5 (60.0%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=4 --avgdiff=11 --gap=3 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Happy Valley | Class 4 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 3 SUPERB KING    :  29.9% win,  62.0% place [12 form] rating: 74 diff: 0
  # 5 THE HEIR       :  18.2% win,  48.3% place [12 form] rating: 70 diff: 4
  # 7 FATAL BLOW     :  12.5% win,  36.8% place [7 form] rating: 67 diff: 7
  # 8 THUNDER PRINCE :  11.5% win,  37.2% place [12 form] rating: 67 diff: 7
  # 1 ARGENTO OCEAN  :   7.3% win,  24.5% place [7 form] rating: 63 diff: 11
  #10 GOR GOR        :   5.2% win,  21.6% place [7 form] rating: 62 diff: 12
  # 4 EVERSTAR       :   3.7% win,  13.8% place [12 form] rating: 59 diff: 15
  # 2 MEOWTH         :   3.2% win,  14.3% place [9 form] rating: 59 diff: 15
  # 6 VIRTUS GLORY   :   3.2% win,  14.9% place [1 form] rating: 59 diff: 15
  # 9 STARRY SHOW    :   3.1% win,  14.7% place [9 form] rating: 59 diff: 15
  #12 YEUX DE LIFELIN:   1.3% win,   7.4% place [4 form] rating: 54 diff: 20
  #11 FALCON HUNTER  :   0.9% win,   4.6% place [6 form] rating: 51 diff: 23

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 4 | sparse: 1 | gap: 4
  **Betting (hist place %):** 🟡 — all Turf HV: 23/35 (65.7%) 🟡 | same class (Class 4): 10/16 (62.5%) 🟡 | same dist (1200m): 12/15 (80.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=4 --avgdiff=12 --gap=4 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Happy Valley | Class 3 | 1650m Turf | 12 runners ⚠️(odds: 6.7)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 3 LOVERO         :  35.3% win,  70.5% place [8 form] rating: 74 diff: 0
  # 1 SKY VINO       :  19.1% win,  53.0% place [11 form] rating: 69 diff: 5
  # 5 DO YOUR PART   :  16.8% win,  49.8% place [9 form] rating: 68 diff: 6
  # 2 RIDING TOGETHER:   9.8% win,  35.5% place [9 form] rating: 64 diff: 10
  # 4 POWER OF VITAM :   6.9% win,  27.7% place [4 form] rating: 62 diff: 12
  #12 WIN METHOD     :   6.5% win,  27.7% place [11 form] rating: 62 diff: 12
  # 8 CALIFORNIA MOXI:   2.1% win,  11.5% place [10 form] rating: 55 diff: 19
  # 6 ANOTHER WORLD  :   1.8% win,  10.3% place [9 form] rating: 54 diff: 20
  #11 VIOLET STAR    :   0.6% win,   5.1% place [6 form] rating: 50 diff: 24
  #10 MAGNEMITE      :   0.5% win,   4.5% place [2 form] rating: 49 diff: 25
  # 9 CASA ROCHESTER :   0.4% win,   2.9% place [2 form] rating: 48 diff: 26
  # 7 HOTT SHOTT     :   0.2% win,   1.5% place [2 form] rating: 42 diff: 32

  Differentiation (equiv hist thresholds): avgDiff 16 | diff<8: 3 | sparse: 0 | gap: 5
  **Betting (hist place %):** 🟢 — all Turf HV: 6/6 (100.0%) 🟢 | same class (Class 3): 1/1 (100.0%) 🟢 | same dist (1650m): 1/1 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=16 --gap=5 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Happy Valley | Class 3 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 3 GIANT BALLON   :  45.6% win,  80.8% place [10 form] rating: 77 diff: 0
  # 9 SKY CAP        :  18.7% win,  57.4% place [9 form] rating: 70 diff: 7
  # 7 STORMING DRAGON:  14.9% win,  51.5% place [14 form] rating: 68 diff: 9
  # 6 FLYING WROTE   :   8.8% win,  35.6% place [10 form] rating: 64 diff: 13
  # 5 KING MILES     :   4.5% win,  24.1% place [8 form] rating: 60 diff: 17
  #12 SUNNY DA BEST  :   2.7% win,  15.5% place [10 form] rating: 57 diff: 20
  # 4 A AMERIC TE SPE:   1.6% win,  12.0% place [10 form] rating: 55 diff: 22
  # 2 CHATEAUNEUF    :   1.3% win,   8.0% place [10 form] rating: 52 diff: 25
  #10 BLUE ILLUSION  :   1.1% win,   7.8% place [8 form] rating: 52 diff: 25
  # 1 ALL OUT FOR SIX:   0.5% win,   3.7% place [3 form] rating: 48 diff: 29
  #11 GRIT SPIRIT    :   0.2% win,   1.7% place [2 form] rating: 43 diff: 34
  # 8 TELECOM FIGHTER:   0.1% win,   1.9% place [13 form] rating: 44 diff: 33

  Differentiation (equiv hist thresholds): avgDiff 20 | diff<8: 2 | sparse: 0 | gap: 7
  **Betting (hist place %):** — — all Turf HV: 0/0 (no past BET) ⚪ | same class (Class 3): 0/0 (no past BET) ⚪ | same dist (1200m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=2 --avgdiff=20 --gap=7 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Happy Valley | Class 2 | 1200m Turf | 12 runners ❌(avgDiff 10 | diff<8: 5)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  #10 GENEVA         :  23.6% win,  55.0% place [3 form] rating: 72 diff: 0
  # 9 SIGHT HERMOSO  :  17.5% win,  46.5% place [10 form] rating: 70 diff: 2
  #11 TURQUOISE VELOC:  15.1% win,  40.9% place [6 form] rating: 69 diff: 3
  # 1 BOTTOMUPTOGETHE:  13.6% win,  38.3% place [7 form] rating: 68 diff: 4
  # 2 STORM RIDER    :   8.5% win,  28.6% place [11 form] rating: 65 diff: 7
  # 3 COLOURFUL KING :   5.4% win,  20.7% place [8 form] rating: 62 diff: 10
  # 7 RISING FORCE   :   5.1% win,  21.0% place [5 form] rating: 62 diff: 10
  # 4 SKY TRUST      :   4.9% win,  19.7% place [10 form] rating: 62 diff: 10
  #12 GLOWING PRAISES:   4.2% win,  18.2% place [5 form] rating: 61 diff: 11
  # 6 REGAL GEM      :   1.3% win,   7.1% place [8 form] rating: 55 diff: 17
  # 5 EMBLAZON       :   0.4% win,   2.4% place [8 form] rating: 48 diff: 24
  # 8 VICTOR THE WINN:   0.4% win,   1.8% place [11 form] rating: 47 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 10 | diff<8: 5 | sparse: 0 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf HV: 19/36 (52.8%) 🔴 | same class (Class 2): 0/3 (0.0%) 🔴 | same dist (1200m): 7/11 (63.6%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=10 --gap=2 --venue=HV --surface=Turf --form=all --ignore-after=2026-05-20` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Class 5 | 1000m | 12 | 0 | #3 MAJESTIC DELIGHT | 25.1% | 59.0% | 12 | 4 | 1 | 🔴 | 18/29 (62.1%) | 3/6 (50.0%) | 2/4 (50.0%) |
| R2 | Class 4 | 1650m | 12 | 0 | #3 NEVER TOO SOON | 25.5% | 58.7% | 12 | 3 | 2 | 🔴 | 15/22 (68.2%) | 7/10 (70.0%) | 5/9 (55.6%) |
| R3 | Class 4 | 1200m | 12 | 0 | #10 CAPTAIN LINK | 23.9% | 53.4% | 9 | 5 | 0 | 🟡 | 29/48 (60.4%) | 15/24 (62.5%) | 9/13 (69.2%) |
| R4 | Class 4 | 1650m | 12 | 0 | #6 FORTUNE STAR | 31.8% | 64.1% | 13 | 3 | 5 | 🟡 | 11/14 (78.6%) | 5/6 (83.3%) | 2/3 (66.7%) |
| R5 | Class 4 | 1000m | 12 | 1 | #4 BEAUTY SHOW | 24.0% | 56.0% | 11 | 4 | 3 | 🔴 | 28/45 (62.2%) | 13/23 (56.5%) | 3/5 (60.0%) |
| R6 | Class 4 | 1200m | 12 | 1 | #3 SUPERB KING | 29.9% | 62.0% | 12 | 4 | 4 | 🟡 | 23/35 (65.7%) | 10/16 (62.5%) | 12/15 (80.0%) |
| R7 | Class 3 | 1650m | 12 | 0 | #3 LOVERO | 35.3% | 70.5% | 16 | 3 | 5 | 🟢 | 6/6 (100.0%) | 1/1 (100.0%) | 1/1 (100.0%) |
| R8 | Class 3 | 1200m | 12 | 0 | #3 GIANT BALLON | 45.6% | 80.8% | 20 | 2 | 7 | — | 0/0 (no past BET) | 0/0 (no past BET) | 0/0 (no past BET) |
| R9 | Class 2 | 1200m | 12 | 0 | #10 GENEVA | 23.6% | 55.0% | 10 | 5 | 2 | 🔴 | 19/36 (52.8%) | 0/3 (0.0%) | 7/11 (63.6%) |
