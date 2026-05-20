# Simulation Summaries — Sha Tin 2026-05-17 (R1–R11)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=ST | form=all | ignore-after=2026-05-17
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-05-17 -v ST -r 1-11 -f all --use-saved`

═══════════════════════════════════════════════════════
RACE 1 - Sha Tin | Class 5 | 1800m Turf | 14 runners ❌ (Class 5)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 5 FAMILY FORTUNE :  40.0% win,  77.6% place [9 form] rating: 80 diff: 0
  # 1 HAILTOTHEVICTOR:  17.4% win,  54.6% place [10 form] rating: 75 diff: 5
  # 9 PERFECT PAIRING:  14.6% win,  49.5% place [13 form] rating: 74 diff: 6
  # 6 ON THE LASH    :  12.6% win,  44.6% place [6 form] rating: 73 diff: 7
  # 8 ALL ARE MINE   :  11.8% win,  44.2% place [6 form] rating: 73 diff: 7
  # 7 SUPER HONG KONG:   1.6% win,  12.3% place [9 form] rating: 65 diff: 15
  #10 ROSEWOOD FLEETF:   1.4% win,   9.5% place [7 form] rating: 63 diff: 17
  #13 GOLD TACK      :   0.5% win,   3.9% place [7 form] rating: 60 diff: 20
  #12 RUN YES RUN    :   0.1% win,   1.8% place [5 form] rating: 56 diff: 24
  # 2 KOLACHI        :   0.0% win,   0.9% place [10 form] rating: 54 diff: 26
  # 3 MATSU VICTOR   :   0.0% win,   0.6% place [8 form] rating: 52 diff: 28
  #11 SMART BEAUTY   :   0.0% win,   0.3% place [7 form] rating: 49 diff: 31
  # 4 SPECIAL HEDGE  :   0.0% win,   0.0% place [10 form] rating: 34 diff: 46
  #14 CHATEAU LE PECH:   0.0% win,   0.2% place [6 form] rating: 48 diff: 32

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 5 | sparse: 0 | gap: 5 ❌
  **Betting (hist place %):** 🔴 — all Turf ST: 2/4 (50.0%) 🔴 | same class (Class 5): 0/0 (no past BET) ⚪ | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=19 --gap=5 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Sha Tin | Class 4 | 1000m Turf | 14 runners ❌ (Sparse 5)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 RUN RUN SUNRISE:  38.4% win,  76.6% place [5 form] rating: 75 diff: 0
  # 2 MABUBU         :  20.4% win,  56.7% place [3 form] rating: 71 diff: 4
  # 5 DAY DAY VICTORY:  20.1% win,  57.9% place [9 form] rating: 71 diff: 4
  # 3 CLOUD NINE     :  11.6% win,  42.9% place [5 form] rating: 68 diff: 7
  # 8 KINGDOM        :   2.6% win,  14.9% place [0 form] rating: 61 diff: 14
  #12 ZOUPER FELLOW  :   2.6% win,  16.7% place [8 form] rating: 62 diff: 13
  #14 LAHORE         :   1.2% win,   9.3% place [6 form] rating: 59 diff: 16
  #13 COMET RADIANCE :   1.1% win,   8.0% place [6 form] rating: 58 diff: 17
  #10 BUSTLING CITY  :   0.7% win,   5.1% place [3 form] rating: 56 diff: 19
  #11 PRECISION MIND :   0.6% win,   4.5% place [2 form] rating: 55 diff: 20
  # 7 HERO RISING    :   0.4% win,   2.7% place [0 form] rating: 54 diff: 21
  # 4 COUNTRY PRIDE  :   0.2% win,   3.3% place [0 form] rating: 54 diff: 21
  # 6 FLOWING        :   0.0% win,   1.3% place [0 form] rating: 51 diff: 24
  # 9 RUBY THRIVE    :   0.0% win,   0.3% place [1 form] rating: 44 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 4 | sparse: 5 | gap: 4 ❌
  **Betting (hist place %):** 🔴 — all Turf ST: 27/55 (49.1%) 🔴 | same class (Class 4): 7/17 (41.2%) 🔴 | same dist (1000m): 2/3 (66.7%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=5 --close=4 --avgdiff=15 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Sha Tin | Class 5 | 1200m Turf | 12 runners ❌ (Class 5)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 MAJESTIC DELIGH:  32.4% win,  66.3% place [12 form] rating: 76 diff: 0
  #10 HAPPY BOYS     :  24.7% win,  58.1% place [11 form] rating: 74 diff: 2
  # 1 ALWAYS FLUKE   :  10.7% win,  37.0% place [5 form] rating: 70 diff: 6
  #11 DOUBLE BINGO   :   6.7% win,  27.5% place [7 form] rating: 68 diff: 8
  # 5 NO OTHER CHOICE:   6.2% win,  25.6% place [10 form] rating: 67 diff: 9
  # 9 TRIUMPHANT WARR:   5.9% win,  23.0% place [6 form] rating: 67 diff: 9
  # 7 CALL TO COMMAND:   4.9% win,  20.8% place [12 form] rating: 66 diff: 10
  #12 TURF PHOENIX   :   3.9% win,  17.1% place [8 form] rating: 65 diff: 11
  # 6 BLUE BARON     :   2.4% win,  12.6% place [4 form] rating: 63 diff: 13
  # 8 DASH           :   2.1% win,  11.5% place [7 form] rating: 63 diff: 13
  # 3 ENJOY GOLF     :   0.0% win,   0.3% place [9 form] rating: 49 diff: 27
  # 2 RUBY SAILING   :   0.0% win,   0.1% place [8 form] rating: 43 diff: 33

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 3 | sparse: 0 | gap: 2 ❌
  **Betting (hist place %):** 🔴 — all Turf ST: 10/17 (58.8%) 🔴 | same class (Class 5): 1/3 (33.3%) 🔴 | same dist (1200m): 0/3 (0.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=12 --gap=2 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Sha Tin | Class 4 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 PAPAYA BROSE   :  46.0% win,  84.9% place [2 form] rating: 78 diff: 0
  # 2 A TIME FOR US  :  29.6% win,  72.9% place [7 form] rating: 75 diff: 3
  # 8 MIGHTY FIGHTER :  10.3% win,  45.7% place [2 form] rating: 69 diff: 9
  # 5 OLDTOWN        :   8.4% win,  39.6% place [6 form] rating: 68 diff: 10
  #11 LITTLE MONSTER :   1.4% win,  12.0% place [9 form] rating: 61 diff: 17
  # 7 LIGHTNESS OF BE:   1.2% win,  11.4% place [7 form] rating: 60 diff: 18
  # 9 AMO ERGO SUM   :   1.2% win,  11.2% place [3 form] rating: 60 diff: 18
  #10 BETTER AND BETT:   0.7% win,   8.2% place [9 form] rating: 59 diff: 19
  # 3 MASSIVE REWARD :   0.4% win,   3.4% place [1 form] rating: 54 diff: 24
  #12 VIVA BOSS      :   0.4% win,   5.2% place [5 form] rating: 56 diff: 22
  # 4 NAVAS G        :   0.3% win,   4.3% place [1 form] rating: 56 diff: 22
  # 6 SPEEDY POWER   :   0.1% win,   1.1% place [0 form] rating: 51 diff: 27

  Differentiation (equiv hist thresholds): avgDiff 16 | diff<8: 2 | sparse: 3 | gap: 3 ✅
  **Betting (hist place %):** 🔴 — all Turf ST: 16/34 (47.1%) 🔴 | same class (Class 4): 5/10 (50.0%) 🔴 | same dist (1200m): 3/11 (27.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=3 --close=2 --avgdiff=16 --gap=3 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Sha Tin | Class 4 | 1200m Turf | 12 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 7 SUPERB SPIRIT  :  42.2% win,  79.7% place [1 form] rating: 75 diff: 0
  # 2 ISLAND BUDDY   :  26.2% win,  67.1% place [6 form] rating: 72 diff: 3
  # 4 GOLDENTRONICMIG:  14.2% win,  47.6% place [10 form] rating: 68 diff: 7
  # 3 LUCRATIVE EIGHT:   4.7% win,  27.4% place [2 form] rating: 64 diff: 11
  #10 PHOENIX LIGHT  :   4.5% win,  23.8% place [5 form] rating: 63 diff: 12
  # 9 TURBO JEFFERIES:   3.1% win,  18.1% place [2 form] rating: 61 diff: 14
  # 5 INCREDIBLE MOME:   2.2% win,  14.4% place [11 form] rating: 60 diff: 15
  # 6 DANCING BLAZE  :   1.1% win,   8.2% place [0 form] rating: 57 diff: 18
  #11 SYNERGY EXPRESS:   0.8% win,   5.8% place [3 form] rating: 55 diff: 20
  # 8 CASA BUDDY     :   0.7% win,   4.8% place [2 form] rating: 54 diff: 21
  # 1 ANODE          :   0.2% win,   1.9% place [11 form] rating: 51 diff: 24
  #12 HONORARY       :   0.1% win,   1.2% place [6 form] rating: 50 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 14 | diff<8: 3 | sparse: 2 | gap: 3 ✅
  **Betting (hist place %):** 🔴 — all Turf ST: 21/43 (48.8%) 🔴 | same class (Class 4): 7/14 (50.0%) 🔴 | same dist (1200m): 5/12 (41.7%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=3 --avgdiff=14 --gap=3 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Sha Tin | Class 3 | 1200m Turf | 12 runners ✅⚠️ (odds>7)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 2 CELESTIAL HERO :  40.0% win,  78.2% place [7 form] rating: 74 diff: 0
  # 3 LIFELINE EXPRES:  25.0% win,  65.7% place [8 form] rating: 71 diff: 3
  # 7 PEGAS          :  12.3% win,  45.1% place [8 form] rating: 67 diff: 7
  # 1 SAVVY BRILLIANT:  11.2% win,  41.6% place [4 form] rating: 66 diff: 8
  # 5 BIENVENUE      :   5.3% win,  28.2% place [7 form] rating: 63 diff: 11
  #10 THUNDER KIT    :   2.0% win,  12.8% place [5 form] rating: 59 diff: 15
  # 8 MASTER CHAMPION:   1.6% win,   9.5% place [4 form] rating: 57 diff: 17
  # 4 MEGASTAR HEART :   1.2% win,   8.9% place [0 form] rating: 57 diff: 17
  # 9 GLORIOUS DYNAST:   0.7% win,   4.4% place [0 form] rating: 54 diff: 20
  # 6 KING EQUINE    :   0.6% win,   4.7% place [0 form] rating: 54 diff: 20
  #11 CHICKEN DINNER :   0.1% win,   0.7% place [2 form] rating: 47 diff: 27
  #12 IRON SECURITY  :   0.0% win,   0.2% place [3 form] rating: 43 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 3 | sparse: 3 | gap: 3 ✅
  **Betting (hist place %):** 🔴 — all Turf ST: 25/49 (51.0%) 🔴 | same class (Class 3): 9/22 (40.9%) 🔴 | same dist (1200m): 6/15 (40.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=3 --close=3 --avgdiff=15 --gap=3 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Sha Tin | Class 4 | 1400m Turf | 14 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 2 FORZA TORO     :  42.3% win,  79.3% place [8 form] rating: 79 diff: 0
  # 3 MASTER LUCKY   :  22.4% win,  63.2% place [6 form] rating: 75 diff: 4
  # 4 SOLID CAR      :  14.1% win,  47.2% place [4 form] rating: 72 diff: 7
  # 1 RUN RUN SMART  :  11.3% win,  42.8% place [11 form] rating: 71 diff: 8
  #12 NINJA DERBY    :   4.5% win,  24.3% place [5 form] rating: 67 diff: 12
  # 9 KING GLORIOSO  :   2.3% win,  14.5% place [7 form] rating: 64 diff: 15
  # 6 NEXT FORTUNE   :   1.2% win,   8.5% place [2 form] rating: 61 diff: 18
  # 7 SUPERB BOY     :   0.6% win,   5.9% place [10 form] rating: 59 diff: 20
  # 8 SEA DIAMOND    :   0.4% win,   3.1% place [4 form] rating: 57 diff: 22
  #10 DUKE OF ORANGE :   0.4% win,   4.2% place [5 form] rating: 58 diff: 21
  # 5 MERLION        :   0.3% win,   3.9% place [2 form] rating: 57 diff: 22
  #11 MULTISUPERSTAR :   0.2% win,   2.1% place [7 form] rating: 55 diff: 24
  #13 AQUAMAN        :   0.0% win,   0.8% place [7 form] rating: 51 diff: 28
  #14 SUPER MASTERMIN:   0.0% win,   0.4% place [7 form] rating: 48 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 17 | diff<8: 3 | sparse: 0 | gap: 4 ✅
  **Betting (hist place %):** 🔴 — all Turf ST: 5/10 (50.0%) 🔴 | same class (Class 4): 1/1 (100.0%) 🟢 | same dist (1400m): 2/4 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=3 --avgdiff=17 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Sha Tin | Class 4 | 1800m Turf | 14 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 4 VERMILION TEMPE:  61.6% win,  87.9% place [8 form] rating: 76 diff: 0
  # 5 ABSOLUTE HONOUR:   9.6% win,  44.5% place [11 form] rating: 65 diff: 11
  #14 ROMANTIC FANTAS:   6.5% win,  33.7% place [11 form] rating: 63 diff: 13
  # 8 GRAND TURBO    :   5.8% win,  29.6% place [4 form] rating: 62 diff: 14
  # 6 STATE SECURITY :   5.4% win,  26.3% place [2 form] rating: 61 diff: 15
  # 9 STAR ELEGANCE  :   5.2% win,  28.6% place [7 form] rating: 62 diff: 14
  #11 KYRUS TREASURE :   1.6% win,  11.2% place [7 form] rating: 56 diff: 20
  #10 STAR BROSE     :   1.4% win,  11.8% place [12 form] rating: 57 diff: 19
  # 2 CHARITY GAIN   :   1.3% win,  10.4% place [6 form] rating: 56 diff: 20
  # 7 SUPER GOLDENDRA:   1.2% win,   9.7% place [6 form] rating: 56 diff: 20
  #12 KINGLY DEMEANOR:   0.4% win,   4.9% place [11 form] rating: 53 diff: 23
  # 1 PACKING FIGHTER:   0.1% win,   0.5% place [7 form] rating: 45 diff: 31
  #13 FORTUNE KINGO  :   0.0% win,   0.6% place [9 form] rating: 44 diff: 32
  # 3 FLUORESCENCE   :   0.0% win,   0.2% place [4 form] rating: 38 diff: 38

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 1 | sparse: 0 | gap: 11 ✅
  **Betting (hist place %):** 🔴 — all Turf ST: 0/1 (0.0%) 🔴 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1800m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=1 --avgdiff=19 --gap=11 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Sha Tin | Class 4 | 1400m Turf | 14 runners ❌ (diff<8 = 5)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 8 PRESTIGE RICKY :  25.6% win,  60.1% place [10 form] rating: 68 diff: 0
  #10 VOYAGE BOSS    :  24.3% win,  58.9% place [8 form] rating: 68 diff: 0
  #11 ACE            :  17.3% win,  50.2% place [7 form] rating: 66 diff: 2
  # 4 STRATHPEFFER   :  14.0% win,  43.4% place [6 form] rating: 65 diff: 3
  #12 STAR FIGURE    :   8.1% win,  30.8% place [7 form] rating: 62 diff: 6
  # 2 BUCEPHALAS     :   4.5% win,  19.6% place [7 form] rating: 59 diff: 9
  # 7 PROUD BOX      :   2.2% win,  12.8% place [8 form] rating: 57 diff: 11
  # 6 HIGH RISE VICTO:   1.9% win,  10.1% place [1 form] rating: 55 diff: 13
  # 9 PRESTIGE SUPERI:   0.7% win,   3.6% place [6 form] rating: 50 diff: 18
  # 5 MEANINGFUL DRAG:   0.6% win,   4.1% place [1 form] rating: 51 diff: 17
  #13 QUICK CONTRIBUT:   0.6% win,   3.7% place [4 form] rating: 51 diff: 17
  #14 SILVER UP      :   0.2% win,   1.7% place [3 form] rating: 48 diff: 20
  # 3 JOLTIN         :   0.1% win,   0.9% place [5 form] rating: 45 diff: 23
  # 1 GRATIFIDE      :   0.0% win,   0.1% place [4 form] rating: 38 diff: 30

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 5 | sparse: 2 | gap: 0 ❌
  **Betting (hist place %):** 🔴 — all Turf ST: 41/87 (47.1%) 🔴 | same class (Class 4): 16/29 (55.2%) 🔴 | same dist (1400m): 14/29 (48.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=5 --avgdiff=12 --gap=0 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 10 - Sha Tin | Class 3 | 1400m Turf | 14 runners ❌ (avgDiff 9 + diff<8: 5)
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 2 WINDLORD       :  22.9% win,  52.2% place [6 form] rating: 67 diff: 0
  # 1 MAKE YOU SMILE :  20.1% win,  47.5% place [2 form] rating: 66 diff: 1
  # 3 MR ENERGIA     :  13.0% win,  37.2% place [5 form] rating: 64 diff: 3
  # 6 THE UNIQUE STAR:  11.1% win,  31.9% place [4 form] rating: 63 diff: 4
  # 8 CHILL EASY     :   9.7% win,  33.5% place [4 form] rating: 63 diff: 4
  #10 PERFECTDAY     :   4.8% win,  18.0% place [6 form] rating: 59 diff: 8
  # 4 CITY GOLD BANNE:   4.5% win,  18.1% place [4 form] rating: 59 diff: 8
  # 5 ENDEARED       :   3.9% win,  17.0% place [13 form] rating: 59 diff: 8
  #11 PATONGA HEART  :   2.9% win,  13.0% place [0 form] rating: 57 diff: 10
  # 9 DARYL FLASH    :   2.9% win,  13.2% place [6 form] rating: 57 diff: 10
  # 7 KANSAS         :   2.0% win,   8.4% place [3 form] rating: 54 diff: 13
  #13 EXCEED THE LIMI:   1.9% win,   8.8% place [4 form] rating: 55 diff: 12
  #14 LADY'S LOVE    :   0.2% win,   1.1% place [3 form] rating: 46 diff: 21
  #12 JUMBO STEPS    :   0.0% win,   0.2% place [1 form] rating: 42 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 9 | diff<8: 5 | sparse: 2 | gap: 1 ❌
  **Betting (hist place %):** 🔴 — all Turf ST: 41/83 (49.4%) 🔴 | same class (Class 3): 10/24 (41.7%) 🔴 | same dist (1400m): 13/26 (50.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=5 --avgdiff=9 --gap=1 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 11 - Sha Tin | Class 3 | 1400m Turf | 14 runners ✅
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 8 HAPPY BOSS     :  44.3% win,  84.3% place [5 form] rating: 80 diff: 0
  # 2 AEROVOLANIC    :  23.1% win,  69.3% place [10 form] rating: 76 diff: 4
  # 1 EVERYONE'S STAR:  20.1% win,  65.6% place [7 form] rating: 75 diff: 5
  # 3 BRILLIANT EXPRE:   7.2% win,  37.4% place [6 form] rating: 70 diff: 10
  # 4 URANUS STAR    :   3.4% win,  21.6% place [9 form] rating: 66 diff: 14
  # 7 ALL'S WELL     :   1.1% win,  11.0% place [8 form] rating: 63 diff: 17
  # 6 NATURAL NUMBERS:   0.5% win,   4.1% place [7 form] rating: 58 diff: 22
  # 5 DREAMING TOGETH:   0.1% win,   2.3% place [3 form] rating: 54 diff: 26
  #11 WELL ENOUGH    :   0.1% win,   1.5% place [0 form] rating: 54 diff: 26
  # 9 KEMPES         :   0.1% win,   1.4% place [5 form] rating: 54 diff: 26
  #10 COMPLETE UNKNOW:   0.0% win,   0.8% place [2 form] rating: 52 diff: 28
  #13 GHORGAN        :   0.0% win,   0.3% place [8 form] rating: 51 diff: 29
  #12 WITHOUT RHYME  :   0.0% win,   0.0% place [1 form] rating: 42 diff: 38
  #14 TIN FOOK       :   0.0% win,   0.3% place [8 form] rating: 49 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 20 | diff<8: 3 | sparse: 2 | gap: 4 ✅
  **Betting (hist place %):** 🔴 — all Turf ST: 5/10 (50.0%) 🔴 | same class (Class 3): 3/7 (42.9%) 🔴 | same dist (1400m): 1/3 (33.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=3 --avgdiff=20 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-17` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Class 5 | 1800m | 14 | 0 | #5 FAMILY FORTUNE | 40.0% | 77.6% | 19 | 5 | 5 | 🔴 | 2/4 (50.0%) | 0/0 (no past BET) | 0/0 (no past BET) |
| R2 | Class 4 | 1000m | 14 | 5 | #1 RUN RUN SUNRISE | 38.4% | 76.6% | 15 | 4 | 4 | 🔴 | 27/55 (49.1%) | 7/17 (41.2%) | 2/3 (66.7%) |
| R3 | Class 5 | 1200m | 12 | 0 | #4 MAJESTIC DELIGHT | 32.4% | 66.3% | 12 | 3 | 2 | 🔴 | 10/17 (58.8%) | 1/3 (33.3%) | 0/3 (0.0%) |
| R4 | Class 4 | 1200m | 12 | 3 | #1 PAPAYA BROSE | 46.0% | 84.9% | 16 | 2 | 3 | 🔴 | 16/34 (47.1%) | 5/10 (50.0%) | 3/11 (27.3%) |
| R5 | Class 4 | 1200m | 12 | 2 | #7 SUPERB SPIRIT | 42.2% | 79.7% | 14 | 3 | 3 | 🔴 | 21/43 (48.8%) | 7/14 (50.0%) | 5/12 (41.7%) |
| R6 | Class 3 | 1200m | 12 | 3 | #2 CELESTIAL HERO | 40.0% | 78.2% | 15 | 3 | 3 | 🔴 | 25/49 (51.0%) | 9/22 (40.9%) | 6/15 (40.0%) |
| R7 | Class 4 | 1400m | 14 | 0 | #2 FORZA TORO | 42.3% | 79.3% | 17 | 3 | 4 | 🔴 | 5/10 (50.0%) | 1/1 (100.0%) | 2/4 (50.0%) |
| R8 | Class 4 | 1800m | 14 | 0 | #4 VERMILION TEMPEST | 61.6% | 87.9% | 19 | 1 | 11 | 🔴 | 0/1 (0.0%) | 0/0 (no past BET) | 0/0 (no past BET) |
| R9 | Class 4 | 1400m | 14 | 2 | #8 PRESTIGE RICKY | 25.6% | 60.1% | 12 | 5 | 0 | 🔴 | 41/87 (47.1%) | 16/29 (55.2%) | 14/29 (48.3%) |
| R10 | Class 3 | 1400m | 14 | 2 | #2 WINDLORD | 22.9% | 52.2% | 9 | 5 | 1 | 🔴 | 41/83 (49.4%) | 10/24 (41.7%) | 13/26 (50.0%) |
| R11 | Class 3 | 1400m | 14 | 2 | #8 HAPPY BOSS | 44.3% | 84.3% | 20 | 3 | 4 | 🔴 | 5/10 (50.0%) | 3/7 (42.9%) | 1/3 (33.3%) |
