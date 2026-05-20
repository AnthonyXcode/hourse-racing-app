# Simulation Summaries — Sha Tin 2026-05-17 (R1–R11)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=ST | form=all | ignore-after=2026-05-17
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-05-17 -v ST -r 1-11 -f all`

═══════════════════════════════════════════════════════
RACE 1 - Sha Tin | Class 5 | 1800m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 5 FAMILY FORTUNE :  43.1% win,  80.2% place [9 form] rating: 81 diff: 0
  # 9 PERFECT PAIRING:  18.8% win,  57.8% place [13 form] rating: 76 diff: 5
  # 8 ALL ARE MINE   :  14.5% win,  53.3% place [6 form] rating: 75 diff: 6
  # 6 ON THE LASH    :  12.3% win,  47.0% place [6 form] rating: 74 diff: 7
  # 1 HAILTOTHEVICTOR:   8.3% win,  36.8% place [10 form] rating: 72 diff: 9
  #10 ROSEWOOD FLEETF:   1.1% win,   8.2% place [7 form] rating: 63 diff: 18
  # 7 SUPER HONG KONG:   1.0% win,   8.1% place [9 form] rating: 63 diff: 18
  #12 RUN YES RUN    :   0.4% win,   3.7% place [5 form] rating: 59 diff: 22
  #13 GOLD TACK      :   0.4% win,   3.4% place [7 form] rating: 59 diff: 22
  # 2 KOLACHI        :   0.0% win,   0.8% place [10 form] rating: 54 diff: 27
  # 3 MATSU VICTOR   :   0.0% win,   0.3% place [8 form] rating: 51 diff: 30
  # 4 SPECIAL HEDGE  :   0.0% win,   0.0% place [10 form] rating: 37 diff: 44
  #11 SMART BEAUTY   :   0.0% win,   0.1% place [7 form] rating: 48 diff: 33
  #14 CHATEAU LE PECH:   0.0% win,   0.3% place [6 form] rating: 50 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 4 | sparse: 0 | gap: 5
  **Betting (hist place %):** 🟡 — all Turf ST: 4/6 (66.7%) 🟡 | same class (Class 5): 1/1 (100.0%) 🟢 | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=4 --avgdiff=19 --gap=5 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Sha Tin | Class 4 | 1000m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 RUN RUN SUNRISE:  40.0% win,  77.3% place [5 form] rating: 75 diff: 0
  # 2 MABUBU         :  21.1% win,  58.8% place [3 form] rating: 71 diff: 4
  # 5 DAY DAY VICTORY:  17.3% win,  53.2% place [9 form] rating: 70 diff: 5
  # 3 CLOUD NINE     :  11.0% win,  41.6% place [5 form] rating: 68 diff: 7
  #12 ZOUPER FELLOW  :   3.1% win,  16.4% place [8 form] rating: 62 diff: 13
  # 8 KINGDOM        :   2.5% win,  15.0% place [0 form] rating: 61 diff: 14
  #10 BUSTLING CITY  :   1.6% win,  10.3% place [3 form] rating: 59 diff: 16
  #14 LAHORE         :   1.5% win,   9.7% place [6 form] rating: 59 diff: 16
  #13 COMET RADIANCE :   0.6% win,   4.6% place [6 form] rating: 55 diff: 20
  #11 PRECISION MIND :   0.5% win,   5.0% place [2 form] rating: 55 diff: 20
  # 4 COUNTRY PRIDE  :   0.4% win,   3.6% place [0 form] rating: 54 diff: 21
  # 7 HERO RISING    :   0.2% win,   3.2% place [0 form] rating: 54 diff: 21
  # 6 FLOWING        :   0.2% win,   1.2% place [0 form] rating: 51 diff: 24
  # 9 RUBY THRIVE    :   0.0% win,   0.2% place [1 form] rating: 44 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 4 | sparse: 5 | gap: 4
  **Betting (hist place %):** 🔴 — all Turf ST: 38/79 (48.1%) 🔴 | same class (Class 4): 12/25 (48.0%) 🔴 | same dist (1000m): 2/4 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=5 --close=4 --avgdiff=15 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Sha Tin | Class 5 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 MAJESTIC DELIGH:  28.2% win,  61.8% place [12 form] rating: 75 diff: 0
  #10 HAPPY BOYS     :  24.1% win,  57.5% place [11 form] rating: 74 diff: 1
  # 1 ALWAYS FLUKE   :  11.4% win,  36.9% place [5 form] rating: 70 diff: 5
  # 7 CALL TO COMMAND:  10.3% win,  32.8% place [12 form] rating: 69 diff: 6
  #11 DOUBLE BINGO   :   7.4% win,  27.9% place [7 form] rating: 68 diff: 7
  # 9 TRIUMPHANT WARR:   6.0% win,  23.1% place [6 form] rating: 67 diff: 8
  # 5 NO OTHER CHOICE:   5.8% win,  24.0% place [10 form] rating: 67 diff: 8
  #12 TURF PHOENIX   :   2.8% win,  14.2% place [8 form] rating: 64 diff: 11
  # 8 DASH           :   2.1% win,  11.4% place [7 form] rating: 63 diff: 12
  # 6 BLUE BARON     :   1.9% win,  10.0% place [4 form] rating: 62 diff: 13
  # 3 ENJOY GOLF     :   0.0% win,   0.3% place [9 form] rating: 48 diff: 27
  # 2 RUBY SAILING   :   0.0% win,   0.0% place [8 form] rating: 42 diff: 33

  Differentiation (equiv hist thresholds): avgDiff 11 | diff<8: 5 | sparse: 0 | gap: 1
  **Betting (hist place %):** 🔴 — all Turf ST: 20/37 (54.1%) 🔴 | same class (Class 5): 5/12 (41.7%) 🔴 | same dist (1200m): 4/10 (40.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=11 --gap=1 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Sha Tin | Class 4 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 PAPAYA BROSE   :  48.5% win,  86.1% place [2 form] rating: 78 diff: 0
  # 2 A TIME FOR US  :  26.0% win,  70.2% place [7 form] rating: 74 diff: 4
  # 8 MIGHTY FIGHTER :  10.8% win,  46.7% place [2 form] rating: 69 diff: 9
  # 5 OLDTOWN        :   7.3% win,  36.8% place [6 form] rating: 67 diff: 11
  # 9 AMO ERGO SUM   :   2.1% win,  14.6% place [3 form] rating: 61 diff: 17
  # 7 LIGHTNESS OF BE:   1.6% win,  13.1% place [7 form] rating: 60 diff: 18
  #11 LITTLE MONSTER :   1.3% win,  11.0% place [9 form] rating: 60 diff: 18
  #12 VIVA BOSS      :   0.7% win,   4.8% place [5 form] rating: 55 diff: 23
  #10 BETTER AND BETT:   0.6% win,   6.9% place [9 form] rating: 58 diff: 20
  # 4 NAVAS G        :   0.5% win,   4.5% place [1 form] rating: 56 diff: 22
  # 3 MASSIVE REWARD :   0.3% win,   3.9% place [1 form] rating: 54 diff: 24
  # 6 SPEEDY POWER   :   0.3% win,   1.5% place [0 form] rating: 51 diff: 27

  Differentiation (equiv hist thresholds): avgDiff 16 | diff<8: 2 | sparse: 3 | gap: 4
  **Betting (hist place %):** 🔴 — all Turf ST: 18/42 (42.9%) 🔴 | same class (Class 4): 3/10 (30.0%) 🔴 | same dist (1200m): 5/15 (33.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=3 --close=2 --avgdiff=16 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Sha Tin | Class 4 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 7 SUPERB SPIRIT  :  44.0% win,  80.2% place [1 form] rating: 75 diff: 0
  # 2 ISLAND BUDDY   :  24.1% win,  63.7% place [6 form] rating: 71 diff: 4
  # 4 GOLDENTRONICMIG:  13.8% win,  48.9% place [10 form] rating: 68 diff: 7
  # 3 LUCRATIVE EIGHT:   5.7% win,  29.3% place [2 form] rating: 64 diff: 11
  #10 PHOENIX LIGHT  :   4.0% win,  21.8% place [5 form] rating: 62 diff: 13
  # 9 TURBO JEFFERIES:   3.4% win,  18.6% place [2 form] rating: 61 diff: 14
  # 5 INCREDIBLE MOME:   2.1% win,  14.5% place [11 form] rating: 60 diff: 15
  # 6 DANCING BLAZE  :   1.2% win,   8.4% place [0 form] rating: 57 diff: 18
  #11 SYNERGY EXPRESS:   0.7% win,   5.7% place [3 form] rating: 55 diff: 20
  # 8 CASA BUDDY     :   0.6% win,   5.3% place [2 form] rating: 54 diff: 21
  # 1 ANODE          :   0.2% win,   1.7% place [11 form] rating: 50 diff: 25
  #12 HONORARY       :   0.2% win,   1.9% place [6 form] rating: 50 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 14 | diff<8: 3 | sparse: 2 | gap: 4
  **Betting (hist place %):** 🔴 — all Turf ST: 22/52 (42.3%) 🔴 | same class (Class 4): 5/15 (33.3%) 🔴 | same dist (1200m): 6/15 (40.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=3 --avgdiff=14 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Sha Tin | Class 3 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 2 CELESTIAL HERO :  43.1% win,  80.2% place [7 form] rating: 74 diff: 0
  # 3 LIFELINE EXPRES:  22.7% win,  62.3% place [8 form] rating: 70 diff: 4
  # 1 SAVVY BRILLIANT:  11.4% win,  43.1% place [4 form] rating: 66 diff: 8
  # 7 PEGAS          :  11.4% win,  41.6% place [8 form] rating: 66 diff: 8
  # 5 BIENVENUE      :   6.2% win,  28.0% place [7 form] rating: 63 diff: 11
  #10 THUNDER KIT    :   2.0% win,  14.1% place [5 form] rating: 59 diff: 15
  # 4 MEGASTAR HEART :   1.3% win,   9.9% place [0 form] rating: 57 diff: 17
  # 8 MASTER CHAMPION:   0.9% win,   8.1% place [4 form] rating: 56 diff: 18
  # 9 GLORIOUS DYNAST:   0.6% win,   5.7% place [0 form] rating: 54 diff: 20
  # 6 KING EQUINE    :   0.4% win,   5.5% place [0 form] rating: 54 diff: 20
  #11 CHICKEN DINNER :   0.0% win,   1.1% place [2 form] rating: 47 diff: 27
  #12 IRON SECURITY  :   0.0% win,   0.3% place [3 form] rating: 43 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 2 | sparse: 3 | gap: 4
  **Betting (hist place %):** 🔴 — all Turf ST: 23/49 (46.9%) 🔴 | same class (Class 3): 7/21 (33.3%) 🔴 | same dist (1200m): 7/17 (41.2%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=3 --close=2 --avgdiff=15 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Sha Tin | Class 4 | 1400m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 2 FORZA TORO     :  46.7% win,  82.9% place [8 form] rating: 79 diff: 0
  # 3 MASTER LUCKY   :  21.7% win,  63.5% place [6 form] rating: 74 diff: 5
  # 4 SOLID CAR      :  12.6% win,  46.7% place [4 form] rating: 71 diff: 8
  # 1 RUN RUN SMART  :  10.2% win,  42.1% place [11 form] rating: 70 diff: 9
  #12 NINJA DERBY    :   4.1% win,  23.6% place [5 form] rating: 66 diff: 13
  # 9 KING GLORIOSO  :   1.4% win,  12.1% place [7 form] rating: 62 diff: 17
  # 6 NEXT FORTUNE   :   1.3% win,  10.3% place [2 form] rating: 61 diff: 18
  # 7 SUPERB BOY     :   0.7% win,   6.0% place [10 form] rating: 58 diff: 21
  # 5 MERLION        :   0.4% win,   4.0% place [2 form] rating: 57 diff: 22
  #10 DUKE OF ORANGE :   0.3% win,   3.4% place [5 form] rating: 57 diff: 22
  #11 MULTISUPERSTAR :   0.3% win,   2.4% place [7 form] rating: 55 diff: 24
  # 8 SEA DIAMOND    :   0.2% win,   1.7% place [4 form] rating: 54 diff: 25
  #13 AQUAMAN        :   0.0% win,   1.0% place [7 form] rating: 51 diff: 28
  #14 SUPER MASTERMIN:   0.0% win,   0.2% place [7 form] rating: 47 diff: 32

  Differentiation (equiv hist thresholds): avgDiff 17 | diff<8: 2 | sparse: 0 | gap: 5
  **Betting (hist place %):** 🔴 — all Turf ST: 5/10 (50.0%) 🔴 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1400m): 3/5 (60.0%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=2 --avgdiff=17 --gap=5 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Sha Tin | Class 4 | 1800m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 4 VERMILION TEMPE:  71.6% win,  93.7% place [8 form] rating: 79 diff: 0
  # 8 GRAND TURBO    :   8.3% win,  44.9% place [4 form] rating: 65 diff: 14
  # 5 ABSOLUTE HONOUR:   6.7% win,  41.3% place [11 form] rating: 65 diff: 14
  # 6 STATE SECURITY :   3.5% win,  25.0% place [2 form] rating: 61 diff: 18
  # 9 STAR ELEGANCE  :   3.0% win,  24.6% place [7 form] rating: 61 diff: 18
  #14 ROMANTIC FANTAS:   2.9% win,  23.9% place [11 form] rating: 61 diff: 18
  # 7 SUPER GOLDENDRA:   1.7% win,  17.2% place [6 form] rating: 59 diff: 20
  # 2 CHARITY GAIN   :   0.9% win,  10.3% place [6 form] rating: 56 diff: 23
  #11 KYRUS TREASURE :   0.7% win,   6.8% place [7 form] rating: 54 diff: 25
  #10 STAR BROSE     :   0.4% win,   6.5% place [12 form] rating: 54 diff: 25
  #12 KINGLY DEMEANOR:   0.2% win,   3.8% place [11 form] rating: 52 diff: 27
  #13 FORTUNE KINGO  :   0.1% win,   1.2% place [9 form] rating: 47 diff: 32
  # 1 PACKING FIGHTER:   0.0% win,   0.7% place [7 form] rating: 45 diff: 34
  # 3 FLUORESCENCE   :   0.0% win,   0.2% place [4 form] rating: 38 diff: 41

  Differentiation (equiv hist thresholds): avgDiff 22 | diff<8: 1 | sparse: 0 | gap: 14
  **Betting (hist place %):** — — all Turf ST: 0/0 (no past BET) ⚪ | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=1 --avgdiff=22 --gap=14 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Sha Tin | Class 4 | 1400m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  #10 VOYAGE BOSS    :  23.7% win,  59.0% place [8 form] rating: 67 diff: 0
  # 8 PRESTIGE RICKY :  22.8% win,  57.3% place [10 form] rating: 67 diff: 0
  #11 ACE            :  20.4% win,  53.0% place [7 form] rating: 66 diff: 1
  # 4 STRATHPEFFER   :  13.7% win,  42.5% place [6 form] rating: 64 diff: 3
  #12 STAR FIGURE    :   7.1% win,  27.9% place [7 form] rating: 61 diff: 6
  # 2 BUCEPHALAS     :   4.3% win,  18.3% place [7 form] rating: 58 diff: 9
  # 7 PROUD BOX      :   3.7% win,  17.1% place [8 form] rating: 58 diff: 9
  # 6 HIGH RISE VICTO:   2.2% win,  10.9% place [1 form] rating: 55 diff: 12
  # 5 MEANINGFUL DRAG:   0.7% win,   4.4% place [1 form] rating: 51 diff: 16
  # 9 PRESTIGE SUPERI:   0.5% win,   3.5% place [6 form] rating: 49 diff: 18
  #13 QUICK CONTRIBUT:   0.5% win,   3.3% place [4 form] rating: 50 diff: 17
  #14 SILVER UP      :   0.3% win,   2.1% place [3 form] rating: 48 diff: 19
  # 3 JOLTIN         :   0.1% win,   0.8% place [5 form] rating: 44 diff: 23
  # 1 GRATIFIDE      :   0.0% win,   0.1% place [4 form] rating: 38 diff: 29

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 5 | sparse: 2 | gap: 0
  **Betting (hist place %):** 🔴 — all Turf ST: 50/108 (46.3%) 🔴 | same class (Class 4): 21/37 (56.8%) 🔴 | same dist (1400m): 18/39 (46.2%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=5 --avgdiff=12 --gap=0 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 10 - Sha Tin | Class 3 | 1400m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 2 WINDLORD       :  21.5% win,  49.7% place [6 form] rating: 66 diff: 0
  # 1 MAKE YOU SMILE :  21.0% win,  50.4% place [2 form] rating: 66 diff: 0
  # 3 MR ENERGIA     :  14.3% win,  40.2% place [5 form] rating: 64 diff: 2
  # 6 THE UNIQUE STAR:  10.1% win,  31.7% place [4 form] rating: 62 diff: 4
  # 8 CHILL EASY     :   9.7% win,  30.0% place [4 form] rating: 62 diff: 4
  #10 PERFECTDAY     :   4.8% win,  19.3% place [6 form] rating: 59 diff: 7
  # 5 ENDEARED       :   4.4% win,  18.4% place [13 form] rating: 59 diff: 7
  #11 PATONGA HEART  :   3.7% win,  14.0% place [0 form] rating: 57 diff: 9
  # 4 CITY GOLD BANNE:   3.6% win,  15.5% place [4 form] rating: 58 diff: 8
  # 9 DARYL FLASH    :   3.3% win,  13.5% place [6 form] rating: 57 diff: 9
  # 7 KANSAS         :   2.3% win,   9.6% place [3 form] rating: 54 diff: 12
  #13 EXCEED THE LIMI:   1.1% win,   6.3% place [4 form] rating: 53 diff: 13
  #14 LADY'S LOVE    :   0.2% win,   0.8% place [3 form] rating: 44 diff: 22
  #12 JUMBO STEPS    :   0.1% win,   0.6% place [1 form] rating: 42 diff: 24

  Differentiation (equiv hist thresholds): avgDiff 9 | diff<8: 7 | sparse: 2 | gap: 0
  **Betting (hist place %):** 🔴 — all Turf ST: 59/125 (47.2%) 🔴 | same class (Class 3): 11/34 (32.4%) 🔴 | same dist (1400m): 22/46 (47.8%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=7 --avgdiff=9 --gap=0 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 11 - Sha Tin | Class 3 | 1400m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 8 HAPPY BOSS     :  42.0% win,  83.3% place [5 form] rating: 79 diff: 0
  # 2 AEROVOLANIC    :  23.7% win,  67.1% place [10 form] rating: 75 diff: 4
  # 1 EVERYONE'S STAR:  19.8% win,  62.3% place [7 form] rating: 74 diff: 5
  # 3 BRILLIANT EXPRE:   8.1% win,  40.4% place [6 form] rating: 70 diff: 9
  # 4 URANUS STAR    :   4.0% win,  23.3% place [9 form] rating: 66 diff: 13
  # 7 ALL'S WELL     :   1.7% win,  12.3% place [8 form] rating: 63 diff: 16
  # 6 NATURAL NUMBERS:   0.4% win,   3.7% place [7 form] rating: 57 diff: 22
  #11 WELL ENOUGH    :   0.1% win,   1.9% place [0 form] rating: 54 diff: 25
  # 9 KEMPES         :   0.1% win,   1.3% place [5 form] rating: 53 diff: 26
  # 5 DREAMING TOGETH:   0.1% win,   1.8% place [3 form] rating: 53 diff: 26
  #10 COMPLETE UNKNOW:   0.0% win,   1.1% place [2 form] rating: 52 diff: 27
  #14 TIN FOOK       :   0.0% win,   0.9% place [8 form] rating: 51 diff: 28
  #12 WITHOUT RHYME  :   0.0% win,   0.1% place [1 form] rating: 42 diff: 37
  #13 GHORGAN        :   0.0% win,   0.6% place [8 form] rating: 50 diff: 29

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 3 | sparse: 2 | gap: 4
  **Betting (hist place %):** 🔴 — all Turf ST: 10/20 (50.0%) 🔴 | same class (Class 3): 4/10 (40.0%) 🔴 | same dist (1400m): 4/8 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=3 --avgdiff=19 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Class 5 | 1800m | 14 | 0 | #5 FAMILY FORTUNE | 43.1% | 80.2% | 19 | 4 | 5 | 🟡 | 4/6 (66.7%) | 1/1 (100.0%) | 0/0 (no past BET) |
| R2 | Class 4 | 1000m | 14 | 5 | #1 RUN RUN SUNRISE | 40.0% | 77.3% | 15 | 4 | 4 | 🔴 | 38/79 (48.1%) | 12/25 (48.0%) | 2/4 (50.0%) |
| R3 | Class 5 | 1200m | 12 | 0 | #4 MAJESTIC DELIGHT | 28.2% | 61.8% | 11 | 5 | 1 | 🔴 | 20/37 (54.1%) | 5/12 (41.7%) | 4/10 (40.0%) |
| R4 | Class 4 | 1200m | 12 | 3 | #1 PAPAYA BROSE | 48.5% | 86.1% | 16 | 2 | 4 | 🔴 | 18/42 (42.9%) | 3/10 (30.0%) | 5/15 (33.3%) |
| R5 | Class 4 | 1200m | 12 | 2 | #7 SUPERB SPIRIT | 44.0% | 80.2% | 14 | 3 | 4 | 🔴 | 22/52 (42.3%) | 5/15 (33.3%) | 6/15 (40.0%) |
| R6 | Class 3 | 1200m | 12 | 3 | #2 CELESTIAL HERO | 43.1% | 80.2% | 15 | 2 | 4 | 🔴 | 23/49 (46.9%) | 7/21 (33.3%) | 7/17 (41.2%) |
| R7 | Class 4 | 1400m | 14 | 0 | #2 FORZA TORO | 46.7% | 82.9% | 17 | 2 | 5 | 🔴 | 5/10 (50.0%) | 0/0 (no past BET) | 3/5 (60.0%) |
| R8 | Class 4 | 1800m | 14 | 0 | #4 VERMILION TEMPEST | 71.6% | 93.7% | 22 | 1 | 14 | — | 0/0 (no past BET) | 0/0 (no past BET) | 0/0 (no past BET) |
| R9 | Class 4 | 1400m | 14 | 2 | #10 VOYAGE BOSS | 23.7% | 59.0% | 12 | 5 | 0 | 🔴 | 50/108 (46.3%) | 21/37 (56.8%) | 18/39 (46.2%) |
| R10 | Class 3 | 1400m | 14 | 2 | #2 WINDLORD | 21.5% | 49.7% | 9 | 7 | 0 | 🔴 | 59/125 (47.2%) | 11/34 (32.4%) | 22/46 (47.8%) |
| R11 | Class 3 | 1400m | 14 | 2 | #8 HAPPY BOSS | 42.0% | 83.3% | 19 | 3 | 4 | 🔴 | 10/20 (50.0%) | 4/10 (40.0%) | 4/8 (50.0%) |
