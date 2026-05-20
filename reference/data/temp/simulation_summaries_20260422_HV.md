# Simulation Summaries — Happy Valley 2026-04-22 (R1–R9)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=HV | form=all | ignore-after=2026-04-22
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-04-22 -v "Happy Valley" -r 1-9 -f all --use-saved`

═══════════════════════════════════════════════════════
RACE 1 - Happy Valley | Class 5 | 1200m Turf | 12 runners ❌
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 NEBRASKAN      :  24.4% win,  55.9% place [8 form] rating: 67 diff: 0
  # 8 TEAM HAPPY     :  20.5% win,  49.9% place [9 form] rating: 65 diff: 2
  # 6 HAPPY BOYS     :  14.1% win,  40.9% place [9 form] rating: 63 diff: 4
  # 5 THOUSAND CUPS  :  14.1% win,  41.7% place [8 form] rating: 63 diff: 4
  # 3 CONCORDE STAR  :   7.9% win,  28.1% place [7 form] rating: 59 diff: 8
  #10 TAIHANG SCENERY:   6.3% win,  24.7% place [4 form] rating: 58 diff: 9
  # 7 TURF PHOENIX   :   3.2% win,  13.7% place [6 form] rating: 53 diff: 14
  # 2 GIDDY UP       :   2.6% win,  10.6% place [8 form] rating: 51 diff: 16
  #11 RICH HORSE     :   2.6% win,  11.3% place [7 form] rating: 52 diff: 15
  # 1 HAPPY ALLIANCE :   2.0% win,  10.0% place [7 form] rating: 51 diff: 16
  # 9 BRILLIANT FIRE :   1.4% win,   8.2% place [6 form] rating: 50 diff: 17
  #12 BINGO BABE     :   1.0% win,   5.0% place [9 form] rating: 46 diff: 21

  Differentiation (equiv hist thresholds): avgDiff 11 | diff<8: 4 | sparse: 0 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf HV: 4/10 (40.0%) 🔴 | same class (Class 5): 1/2 (50.0%) 🔴 | same dist (1200m): 1/3 (33.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=4 --avgdiff=11 --gap=2 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Happy Valley | Class 5 | 1650m Turf | 12 runners ⚠️✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 8 VERBIER        :  28.1% win,  59.2% place [10 form] rating: 71 diff: 0
  # 7 PODIUM         :  15.0% win,  41.2% place [8 form] rating: 66 diff: 5
  # 2 SOARING BRONCO :  14.6% win,  40.6% place [9 form] rating: 66 diff: 5
  # 6 DOUBLE BINGO   :  10.6% win,  33.0% place [6 form] rating: 64 diff: 7
  # 4 TELECOM POWER  :   7.1% win,  25.1% place [10 form] rating: 61 diff: 10
  # 9 DOUBLE SHOW    :   7.0% win,  28.1% place [5 form] rating: 62 diff: 9
  #11 SMILING EMPEROR:   6.0% win,  22.0% place [8 form] rating: 60 diff: 11
  #10 ATOMIC BEAUTY  :   4.6% win,  17.9% place [7 form] rating: 58 diff: 13
  # 1 LUCKY BLESSING :   3.6% win,  15.1% place [9 form] rating: 57 diff: 14
  # 5 SPARKLE AND GOL:   2.3% win,  11.1% place [7 form] rating: 55 diff: 16
  # 3 NOBLE FANS     :   0.7% win,   4.1% place [7 form] rating: 48 diff: 23
  #12 CASA LEGEND    :   0.4% win,   2.7% place [4 form] rating: 46 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 4 | sparse: 0 | gap: 5
  **Betting (hist place %):** 🔴 — all Turf HV: 3/5 (60.0%) 🟡 | same class (Class 5): 0/1 (0.0%) 🔴 | same dist (1650m): 1/1 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=4 --avgdiff=12 --gap=5 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Happy Valley | Class 4 | 1650m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 GLORIOUS JOURNE:  27.0% win,  59.9% place [8 form] rating: 69 diff: 0
  # 4 FORTUNE STAR   :  21.9% win,  55.7% place [9 form] rating: 68 diff: 1
  # 3 VERMILION TEMPE:  21.0% win,  52.3% place [6 form] rating: 67 diff: 2
  # 7 SURE JOYFUL    :   8.4% win,  29.6% place [9 form] rating: 61 diff: 8
  # 9 YIU CHEUNG VICT:   4.7% win,  19.0% place [14 form] rating: 57 diff: 12
  #11 OUR LUCKY GLORY:   3.9% win,  18.5% place [7 form] rating: 57 diff: 12
  # 6 STAR ELEGANCE  :   3.8% win,  17.4% place [6 form] rating: 56 diff: 13
  # 5 SHOOTING TO TOP:   2.9% win,  14.2% place [2 form] rating: 55 diff: 14
  # 2 GAZELEY        :   2.0% win,   8.6% place [3 form] rating: 51 diff: 18
  #12 GOOD LUCK WIN  :   1.6% win,   9.3% place [8 form] rating: 52 diff: 17
  #10 APOLAR FIGHTER :   1.6% win,   8.3% place [8 form] rating: 51 diff: 18
  # 8 TO INFINITY    :   1.1% win,   7.1% place [9 form] rating: 50 diff: 19

  Differentiation (equiv hist thresholds): avgDiff 11 | diff<8: 3 | sparse: 0 | gap: 1
  **Betting (hist place %):** 🟡 — all Turf HV: 7/10 (70.0%) 🟢 | same class (Class 4): 3/5 (60.0%) 🟡 | same dist (1650m): 3/5 (60.0%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=11 --gap=1 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Happy Valley | Class 4 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 6 VIGOR EYE      :  33.1% win,  67.0% place [5 form] rating: 71 diff: 0
  # 4 JOLLY COMPANION:  17.8% win,  49.3% place [11 form] rating: 66 diff: 5
  # 9 LEADING AGILITY:  12.9% win,  39.3% place [4 form] rating: 64 diff: 7
  # 2 CAPTAIN LINK   :   9.0% win,  30.5% place [5 form] rating: 61 diff: 10
  # 7 FLYING SNIPER  :   9.0% win,  30.7% place [2 form] rating: 61 diff: 10
  # 3 LUCKY MCQUEEN  :   6.8% win,  26.7% place [9 form] rating: 60 diff: 11
  #10 YEUX DE LIFELIN:   3.8% win,  16.9% place [3 form] rating: 56 diff: 15
  # 5 LUCKY XANDER   :   3.2% win,  14.3% place [8 form] rating: 54 diff: 17
  # 8 KWAI CHUNG TALE:   2.7% win,  13.9% place [3 form] rating: 54 diff: 17
  #11 SOLAR RIVER    :   0.7% win,   5.3% place [0 form] rating: 48 diff: 23
  #12 ZHOU GONGJIN   :   0.4% win,   2.9% place [4 form] rating: 44 diff: 27
  # 1 YOUNG ARROW    :   0.4% win,   3.2% place [7 form] rating: 45 diff: 26

  Differentiation (equiv hist thresholds): avgDiff 14 | diff<8: 3 | sparse: 1 | gap: 5
  **Betting (hist place %):** 🟢 — all Turf HV: 6/7 (85.7%) 🟢 | same class (Class 4): 1/1 (100.0%) 🟢 | same dist (1200m): 3/3 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=3 --avgdiff=14 --gap=5 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Happy Valley | Class 4 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 SPEEDY SMARTIE :  24.5% win,  54.3% place [8 form] rating: 71 diff: 0
  # 9 LOVING VIBES   :  12.8% win,  36.3% place [9 form] rating: 66 diff: 5
  # 4 WINNING MONEY  :  12.6% win,  36.9% place [6 form] rating: 66 diff: 5
  # 7 SILVER SPURS   :  10.0% win,  30.5% place [8 form] rating: 64 diff: 7
  #11 THUNDER PRINCE :   9.5% win,  29.0% place [10 form] rating: 64 diff: 7
  # 3 KING OBERON    :   8.7% win,  26.6% place [8 form] rating: 63 diff: 8
  # 6 FUN ELITE      :   6.0% win,  20.9% place [6 form] rating: 61 diff: 10
  # 2 SUPER LOVE     :   4.9% win,  18.5% place [7 form] rating: 60 diff: 11
  # 8 LITTLE MONSTER :   3.9% win,  15.3% place [8 form] rating: 59 diff: 12
  # 5 TURBO JEFFERIES:   3.6% win,  16.0% place [1 form] rating: 59 diff: 12
  #12 WINNING CHAMPIO:   3.2% win,  13.4% place [9 form] rating: 58 diff: 13
  #10 BLAZING BEAM   :   0.4% win,   2.4% place [7 form] rating: 47 diff: 24

  Differentiation (equiv hist thresholds): avgDiff 10 | diff<8: 5 | sparse: 1 | gap: 5
  **Betting (hist place %):** 🟢 — all Turf HV: 10/14 (71.4%) 🟢 | same class (Class 4): 4/5 (80.0%) 🟢 | same dist (1200m): 7/8 (87.5%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=5 --avgdiff=10 --gap=5 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Happy Valley | Class 4 | 1000m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 BEAUTY SHOW    :  34.9% win,  69.4% place [1 form] rating: 74 diff: 0
  # 3 KING PROFIT    :  21.1% win,  54.6% place [4 form] rating: 70 diff: 4
  # 5 DAY DAY VICTORY:  11.0% win,  36.8% place [8 form] rating: 65 diff: 9
  # 8 JUMBO BLESSING :  10.6% win,  38.6% place [2 form] rating: 65 diff: 9
  # 6 GRAND NOVA     :   9.3% win,  32.9% place [4 form] rating: 64 diff: 10
  #11 HAPPY UNITED   :   3.7% win,  16.3% place [6 form] rating: 58 diff: 16
  # 1 HEALTHY HEALTHY:   3.2% win,  15.5% place [8 form] rating: 57 diff: 17
  # 7 HARMONY FIRE   :   2.2% win,  12.1% place [7 form] rating: 56 diff: 18
  # 9 TOPSPIN KING   :   2.2% win,  12.0% place [2 form] rating: 55 diff: 19
  #12 CRYSTAL POWERFU:   1.3% win,   6.8% place [6 form] rating: 52 diff: 22
  # 2 E HO HO        :   0.4% win,   3.1% place [5 form] rating: 47 diff: 27
  #10 HYANNIS STAR   :   0.2% win,   1.8% place [2 form] rating: 45 diff: 29

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 2 | sparse: 1 | gap: 4
  **Betting (hist place %):** 🟢 — all Turf HV: 3/3 (100.0%) 🟢 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1000m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=2 --avgdiff=15 --gap=4 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Happy Valley | Class 3 | 1000m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  #10 SKY CAP        :  46.0% win,  81.3% place [8 form] rating: 79 diff: 0
  # 1 HORSEPOWER     :  22.5% win,  61.8% place [6 form] rating: 73 diff: 6
  # 5 BUNTA BABY     :  12.1% win,  46.0% place [7 form] rating: 69 diff: 10
  # 4 TOGETHER WE VAL:   7.2% win,  33.2% place [4 form] rating: 65 diff: 14
  # 2 CANDLELIGHT DIN:   5.7% win,  29.5% place [8 form] rating: 64 diff: 15
  #11 SPARKLING FELLO:   2.3% win,  15.9% place [6 form] rating: 59 diff: 20
  # 7 BLUE ILLUSION  :   1.3% win,   9.1% place [7 form] rating: 55 diff: 24
  # 6 CENTRAL BANK   :   1.1% win,   6.8% place [1 form] rating: 53 diff: 26
  # 3 RED ELEGANCE   :   1.1% win,   8.6% place [8 form] rating: 54 diff: 25
  # 8 COPPER CORE    :   0.4% win,   3.8% place [0 form] rating: 50 diff: 29
  # 9 DOUBLE MONEY   :   0.4% win,   2.8% place [2 form] rating: 47 diff: 32
  #12 CASA OF HONOR  :   0.1% win,   1.3% place [7 form] rating: 44 diff: 35

  Differentiation (equiv hist thresholds): avgDiff 20 | diff<8: 2 | sparse: 2 | gap: 6
  **Betting (hist place %):** — — all Turf HV: 0/0 (no past BET) ⚪ | same class (Class 3): 0/0 (no past BET) ⚪ | same dist (1000m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=2 --avgdiff=20 --gap=6 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Happy Valley | Class 3 | 1800m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  #11 ACE WAR        :  52.8% win,  84.1% place [9 form] rating: 78 diff: 0
  # 1 LIVEANDLETLIVE :  18.5% win,  56.0% place [10 form] rating: 69 diff: 9
  # 5 SO YOU WILL    :   8.2% win,  38.3% place [5 form] rating: 64 diff: 14
  # 2 HIGHLAND RAHY  :   6.7% win,  31.8% place [6 form] rating: 62 diff: 16
  # 4 NEZHA          :   5.4% win,  28.3% place [6 form] rating: 61 diff: 17
  # 3 CHINA WIN      :   3.6% win,  22.0% place [9 form] rating: 59 diff: 19
  # 6 MIGHTY STRENGTH:   1.4% win,  10.2% place [5 form] rating: 53 diff: 25
  # 9 VIOLET STAR    :   1.3% win,   9.7% place [5 form] rating: 53 diff: 25
  # 8 THE AUSPICIOUS :   0.8% win,   7.3% place [13 form] rating: 51 diff: 27
  #12 PACKING FIGHTER:   0.8% win,   7.4% place [6 form] rating: 51 diff: 27
  # 7 EXCELLENCE VALU:   0.3% win,   3.7% place [10 form] rating: 46 diff: 32
  #10 MISSION GIANT  :   0.2% win,   1.2% place [1 form] rating: 40 diff: 38

  Differentiation (equiv hist thresholds): avgDiff 21 | diff<8: 1 | sparse: 1 | gap: 9
  **Betting (hist place %):** — — all Turf HV: 0/0 (no past BET) ⚪ | same class (Class 3): 0/0 (no past BET) ⚪ | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=1 --avgdiff=21 --gap=9 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Happy Valley | Class 3 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 AURIO          :  38.4% win,  72.5% place [6 form] rating: 77 diff: 0
  # 3 LOVE TOGETHER  :  19.5% win,  51.2% place [7 form] rating: 71 diff: 6
  # 4 MY DAY MY WAY  :  11.1% win,  37.2% place [5 form] rating: 67 diff: 10
  # 6 GREATER BAE    :  10.2% win,  35.7% place [5 form] rating: 67 diff: 10
  # 5 FLYING FORTRESS:   7.7% win,  30.2% place [7 form] rating: 65 diff: 12
  # 7 SOVEREIGN FUND :   4.9% win,  21.3% place [8 form] rating: 62 diff: 15
  # 9 JUBILANT WINNER:   2.4% win,  13.0% place [7 form] rating: 58 diff: 19
  # 2 MASTEROFMYUNIVE:   1.8% win,   9.5% place [8 form] rating: 56 diff: 21
  # 8 KANSAS         :   1.3% win,  10.1% place [1 form] rating: 56 diff: 21
  #10 WINGS OF WAR   :   1.3% win,   7.9% place [7 form] rating: 55 diff: 22
  #12 PACKING GLORY  :   1.1% win,   8.5% place [6 form] rating: 56 diff: 21
  #11 WITHOUT RHYME  :   0.4% win,   2.8% place [0 form] rating: 50 diff: 27

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 2 | sparse: 2 | gap: 6
  **Betting (hist place %):** 🟢 — all Turf HV: 3/3 (100.0%) 🟢 | same class (Class 3): 2/2 (100.0%) 🟢 | same dist (1200m): 2/2 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=2 --avgdiff=15 --gap=6 --venue=HV --surface=Turf --form=all --ignore-after=2026-04-22` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Class 5 | 1200m | 12 | 0 | #4 NEBRASKAN | 24.4% | 55.9% | 11 | 4 | 2 | 🔴 | 4/10 (40.0%) | 1/2 (50.0%) | 1/3 (33.3%) |
| R2 | Class 5 | 1650m | 12 | 0 | #8 VERBIER | 28.1% | 59.2% | 12 | 4 | 5 | 🔴 | 3/5 (60.0%) | 0/1 (0.0%) | 1/1 (100.0%) |
| R3 | Class 4 | 1650m | 12 | 0 | #1 GLORIOUS JOURNEY | 27.0% | 59.9% | 11 | 3 | 1 | 🟡 | 7/10 (70.0%) | 3/5 (60.0%) | 3/5 (60.0%) |
| R4 | Class 4 | 1200m | 12 | 1 | #6 VIGOR EYE | 33.1% | 67.0% | 14 | 3 | 5 | 🟢 | 6/7 (85.7%) | 1/1 (100.0%) | 3/3 (100.0%) |
| R5 | Class 4 | 1200m | 12 | 1 | #1 SPEEDY SMARTIE | 24.5% | 54.3% | 10 | 5 | 5 | 🟢 | 10/14 (71.4%) | 4/5 (80.0%) | 7/8 (87.5%) |
| R6 | Class 4 | 1000m | 12 | 1 | #4 BEAUTY SHOW | 34.9% | 69.4% | 15 | 2 | 4 | 🟢 | 3/3 (100.0%) | 0/0 (no past BET) | 0/0 (no past BET) |
| R7 | Class 3 | 1000m | 12 | 2 | #10 SKY CAP | 46.0% | 81.3% | 20 | 2 | 6 | — | 0/0 (no past BET) | 0/0 (no past BET) | 0/0 (no past BET) |
| R8 | Class 3 | 1800m | 12 | 1 | #11 ACE WAR | 52.8% | 84.1% | 21 | 1 | 9 | — | 0/0 (no past BET) | 0/0 (no past BET) | 0/0 (no past BET) |
| R9 | Class 3 | 1200m | 12 | 2 | #1 AURIO | 38.4% | 72.5% | 15 | 2 | 6 | 🟢 | 3/3 (100.0%) | 2/2 (100.0%) | 2/2 (100.0%) |
