# Simulation Summaries — Sha Tin 2026-05-09 (R1–R11)
# MC: 5,000 iterations | Form data: all venues (HV + ST)
# Hist hit rates: each race uses its own sparse / close<8 / avgDiff / gap as `backtest-differentiation` thresholds (see race block). Pool: months=all | venue=ST | form=all | ignore-after=2026-05-09
# Equiv batch: `npx tsx tools/batch-analyze.ts -d 2026-05-09 -v ST -r 1-11 -f all --use-saved`

═══════════════════════════════════════════════════════
RACE 1 - Sha Tin | Griffin | 1000m Turf | 10 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 10 horses, 5,000 iterations):
  # 4 SILVERY KNIGHT :  27.0% win,  58.9% place [1 form] rating: 65 diff: 0
  # 9 SECRET INGREDIE:  14.8% win,  42.7% place [1 form] rating: 62 diff: 3
  # 1 ALMIGHTY WARRIO:  14.4% win,  41.7% place [0 form] rating: 62 diff: 3
  # 7 GAUDIUM MAGNUM :  11.5% win,  34.3% place [0 form] rating: 60 diff: 5
  # 2 SHARP PLANET   :   8.2% win,  29.2% place [0 form] rating: 59 diff: 6
  #10 TALENTS CHAMPIO:   7.8% win,  27.9% place [1 form] rating: 59 diff: 6
  # 6 EVER WEALTH    :   5.3% win,  21.1% place [0 form] rating: 57 diff: 8
  # 3 SHOW ME YOUR LO:   4.7% win,  17.8% place [0 form] rating: 56 diff: 9
  # 5 SPICE BAG      :   4.6% win,  18.7% place [0 form] rating: 56 diff: 9
  # 8 GLORIOUS HERO  :   1.7% win,   7.7% place [1 form] rating: 51 diff: 14

  Differentiation (equiv hist thresholds): avgDiff 6 | diff<8: 6 | sparse: 10 | gap: 3
  **Betting (hist place %):** 🔴 — all Turf ST: 43/85 (50.6%) 🔴 | same class (Griffin): 0/0 (no past BET) ⚪ | same dist (1000m): 3/8 (37.5%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=10 --close=6 --avgdiff=6 --gap=3 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 2 - Sha Tin | Class 4 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 NORTHERN FIRE B:  30.4% win,  66.9% place [8 form] rating: 72 diff: 0
  # 7 QUARTZ LEGEND  :  30.3% win,  66.4% place [9 form] rating: 72 diff: 0
  # 3 RYUI KOKOROE   :  13.6% win,  43.2% place [7 form] rating: 67 diff: 5
  # 5 WARRIORS DREAM :   8.5% win,  33.9% place [8 form] rating: 65 diff: 7
  # 4 BRIGHT DAY     :   6.8% win,  28.6% place [10 form] rating: 64 diff: 8
  #11 RUSSET GLOW    :   2.9% win,  14.2% place [4 form] rating: 60 diff: 12
  # 8 SPIRITED STEED :   2.6% win,  14.6% place [0 form] rating: 60 diff: 12
  # 2 MATZDEN        :   1.9% win,  11.8% place [5 form] rating: 59 diff: 13
  #12 LIGHTNING ACE  :   1.9% win,   9.8% place [3 form] rating: 57 diff: 15
  #10 EXTRAORDINARY G:   0.7% win,   6.5% place [2 form] rating: 55 diff: 17
  # 6 ACA FAST       :   0.4% win,   3.1% place [0 form] rating: 52 diff: 20
  # 9 THE COSMIC POWE:   0.1% win,   0.9% place [1 form] rating: 47 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 11 | diff<8: 4 | sparse: 3 | gap: 0
  **Betting (hist place %):** 🔴 — all Turf ST: 43/85 (50.6%) 🔴 | same class (Class 4): 17/28 (60.7%) 🟡 | same dist (1200m): 10/25 (40.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=3 --close=4 --avgdiff=11 --gap=0 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 3 - Sha Tin | Class 5 | 1400m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 6 GENERAL SMART  :  48.9% win,  81.0% place [6 form] rating: 80 diff: 0
  # 5 ONLY U         :  13.4% win,  45.9% place [9 form] rating: 72 diff: 8
  #10 VERBIER        :  12.8% win,  44.0% place [11 form] rating: 72 diff: 8
  #11 SPEEDY TRIDENT :   6.1% win,  26.2% place [9 form] rating: 68 diff: 12
  # 8 SUPERB GUY     :   6.0% win,  27.0% place [12 form] rating: 68 diff: 12
  #13 TEAM HAPPY     :   3.8% win,  21.6% place [11 form] rating: 67 diff: 13
  # 7 WINNING CIGAR  :   3.7% win,  19.3% place [7 form] rating: 66 diff: 14
  #12 JOLLY JUMPER   :   2.2% win,  12.9% place [9 form] rating: 64 diff: 16
  # 9 SPARKLE AND GOL:   1.5% win,  11.0% place [8 form] rating: 63 diff: 17
  #14 RUN YES RUN    :   1.5% win,   8.7% place [4 form] rating: 61 diff: 19
  # 2 FIGHT TIME     :   0.2% win,   1.8% place [9 form] rating: 56 diff: 24
  # 1 THE ALL ROUNDER:   0.0% win,   0.3% place [9 form] rating: 49 diff: 31
  # 3 WAVE GARDEN    :   0.0% win,   0.1% place [7 form] rating: 46 diff: 34
  # 4 GOLDEN FORTUNE :   0.0% win,   0.1% place [7 form] rating: 42 diff: 38

  Differentiation (equiv hist thresholds): avgDiff 18 | diff<8: 1 | sparse: 0 | gap: 8
  **Betting (hist place %):** 🟡 — all Turf ST: 2/3 (66.7%) 🟡 | same class (Class 5): 0/0 (no past BET) ⚪ | same dist (1400m): 1/1 (100.0%) 🟢
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=1 --avgdiff=18 --gap=8 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 4 - Sha Tin | Class 4 | 1000m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 ALSONSO        :  26.9% win,  67.0% place [9 form] rating: 76 diff: 0
  # 6 GRAND NOVA     :  25.4% win,  66.7% place [5 form] rating: 76 diff: 0
  # 3 BEAUTY THUNDER :  21.1% win,  62.7% place [10 form] rating: 75 diff: 1
  # 4 MASTER PAYMENT :  20.7% win,  62.5% place [1 form] rating: 75 diff: 1
  # 7 RAPID PHANTOM  :   2.8% win,  15.3% place [1 form] rating: 65 diff: 11
  #14 CAP LINER      :   1.2% win,   8.0% place [5 form] rating: 61 diff: 15
  #12 CASA PRIMO     :   0.6% win,   5.5% place [2 form] rating: 60 diff: 16
  #13 COMET RADIANCE :   0.4% win,   4.2% place [5 form] rating: 59 diff: 17
  # 9 WINALOT        :   0.4% win,   2.8% place [0 form] rating: 57 diff: 19
  #10 ONESHOT        :   0.2% win,   2.1% place [2 form] rating: 55 diff: 21
  #11 BUSTLING CITY  :   0.1% win,   1.9% place [2 form] rating: 54 diff: 22
  # 5 TACTICAL VICTOR:   0.1% win,   0.7% place [7 form] rating: 50 diff: 26
  # 8 STORM MIRROR   :   0.1% win,   0.5% place [0 form] rating: 51 diff: 25
  # 2 E HO HO        :   0.0% win,   0.1% place [6 form] rating: 46 diff: 30

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 4 | sparse: 4 | gap: 0
  **Betting (hist place %):** 🔴 — all Turf ST: 38/74 (51.4%) 🔴 | same class (Class 4): 15/25 (60.0%) 🟡 | same dist (1000m): 1/3 (33.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=4 --close=4 --avgdiff=15 --gap=0 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 5 - Sha Tin | Class 4 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 1 CONRAD PATCH   :  66.6% win,  92.1% place [5 form] rating: 75 diff: 0
  # 5 GRACEFUL HEART :   7.7% win,  40.7% place [1 form] rating: 62 diff: 13
  # 3 FLASHING FIGHTE:   7.2% win,  37.5% place [1 form] rating: 62 diff: 13
  # 9 BROWNNEEDSFURTH:   6.3% win,  38.9% place [7 form] rating: 62 diff: 13
  # 8 TRENDY RUSH    :   4.5% win,  26.2% place [2 form] rating: 59 diff: 16
  # 7 E HOPEFUL      :   3.8% win,  25.3% place [2 form] rating: 59 diff: 16
  # 6 GROUPER        :   2.2% win,  16.5% place [0 form] rating: 56 diff: 19
  #10 IMPENDING LEGAC:   1.0% win,  11.0% place [3 form] rating: 54 diff: 21
  # 4 REAL GENTLEMAN :   0.4% win,   4.5% place [6 form] rating: 49 diff: 26
  # 2 POSITIVE SMILE :   0.2% win,   3.5% place [10 form] rating: 49 diff: 26
  #11 EMERGING STAR  :   0.1% win,   2.5% place [1 form] rating: 46 diff: 29
  #12 AMAZING FUN    :   0.1% win,   1.3% place [11 form] rating: 45 diff: 30

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 1 | sparse: 4 | gap: 13
  **Betting (hist place %):** 🔴 — all Turf ST: 0/1 (0.0%) 🔴 | same class (Class 4): 0/0 (no past BET) ⚪ | same dist (1200m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=4 --close=1 --avgdiff=19 --gap=13 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 6 - Sha Tin | Class 4 | 1400m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  #13 THE CONCENTRATI:  29.1% win,  64.0% place [10 form] rating: 73 diff: 0
  # 6 INVICTUS DRAGON:  20.2% win,  52.5% place [8 form] rating: 71 diff: 2
  # 8 SUPER DRAGON   :  13.1% win,  41.3% place [4 form] rating: 69 diff: 4
  # 5 STAR SATYR     :  11.9% win,  37.4% place [11 form] rating: 68 diff: 5
  #11 DECISION LINK  :  10.9% win,  36.9% place [10 form] rating: 68 diff: 5
  # 3 INVICTUS       :   6.3% win,  25.3% place [1 form] rating: 65 diff: 8
  # 4 LUCKY BID      :   3.2% win,  15.6% place [1 form] rating: 62 diff: 11
  # 9 CHEERFUL WONGCH:   2.6% win,  11.9% place [3 form] rating: 61 diff: 12
  # 1 FLYING FORTUNE :   1.1% win,   5.2% place [4 form] rating: 57 diff: 16
  # 7 LUCKY MAN      :   0.8% win,   4.6% place [9 form] rating: 57 diff: 16
  # 2 BEST WORLD     :   0.5% win,   3.2% place [0 form] rating: 55 diff: 18
  #10 CELESTIAL STRID:   0.2% win,   1.2% place [4 form] rating: 51 diff: 22
  #12 LEATHER GOODS  :   0.1% win,   0.3% place [4 form] rating: 46 diff: 27
  #14 MONEY TYCOON   :   0.0% win,   0.5% place [4 form] rating: 48 diff: 25

  Differentiation (equiv hist thresholds): avgDiff 12 | diff<8: 5 | sparse: 3 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf ST: 38/75 (50.7%) 🔴 | same class (Class 4): 15/25 (60.0%) 🟡 | same dist (1400m): 14/24 (58.3%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=3 --close=5 --avgdiff=12 --gap=2 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 7 - Sha Tin | Class 4 | 1600m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 GALLANT EPOCH  :  25.9% win,  63.2% place [7 form] rating: 78 diff: 0
  # 5 AUDACIOUS PURSU:  22.2% win,  57.3% place [8 form] rating: 77 diff: 1
  #13 BLING BLING GEN:  17.7% win,  50.8% place [9 form] rating: 76 diff: 2
  # 9 VICTOR SUPREME :  13.2% win,  42.5% place [5 form] rating: 74 diff: 4
  # 6 BEAUTY VIVA    :  11.4% win,  38.5% place [12 form] rating: 73 diff: 5
  # 4 TURIN CHAMPIONS:   6.8% win,  28.2% place [7 form] rating: 71 diff: 7
  # 8 LUCKY YEAR     :   2.0% win,  10.1% place [3 form] rating: 65 diff: 13
  #12 RED BRICK WARRI:   0.6% win,   5.2% place [6 form] rating: 62 diff: 16
  # 7 CIRCUIT MARSHAL:   0.2% win,   2.5% place [5 form] rating: 59 diff: 19
  #14 FIGHTING MACHIN:   0.1% win,   0.9% place [10 form] rating: 55 diff: 23
  # 2 KA YING SUPERB :   0.0% win,   0.3% place [5 form] rating: 51 diff: 27
  #10 ILLUMINOUS     :   0.0% win,   0.3% place [5 form] rating: 52 diff: 26
  # 3 SUPERB KID     :   0.0% win,   0.0% place [11 form] rating: 45 diff: 33
  #11 AMAZING DUCK   :   0.0% win,   0.1% place [6 form] rating: 48 diff: 30

  Differentiation (equiv hist thresholds): avgDiff 15 | diff<8: 6 | sparse: 0 | gap: 1
  **Betting (hist place %):** 🔴 — all Turf ST: 12/21 (57.1%) 🔴 | same class (Class 4): 4/5 (80.0%) 🟢 | same dist (1600m): 2/3 (66.7%) 🟡
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=6 --avgdiff=15 --gap=1 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 8 - Sha Tin | Class 3 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 3 GOLD PATCH     :  62.5% win,  96.7% place [4 form] rating: 84 diff: 0
  #10 SPICY STANDARD :  29.2% win,  91.2% place [4 form] rating: 79 diff: 5
  # 4 CHILL BUDDY    :   6.8% win,  63.4% place [7 form] rating: 71 diff: 13
  # 2 JUBILANT WINNER:   1.1% win,  24.2% place [8 form] rating: 64 diff: 20
  # 5 KANSAS         :   0.3% win,  11.5% place [2 form] rating: 59 diff: 25
  # 1 SUPERB CAPITALI:   0.0% win,   1.9% place [7 form] rating: 51 diff: 33
  # 9 ACE CHAMPION   :   0.0% win,   2.5% place [4 form] rating: 53 diff: 31
  # 7 EFFORTLESS WIN :   0.0% win,   4.7% place [0 form] rating: 55 diff: 29
  #11 THRIVING BROTHE:   0.0% win,   1.9% place [11 form] rating: 52 diff: 32
  # 6 LUCKY MY WAY   :   0.0% win,   0.4% place [4 form] rating: 45 diff: 39
  # 8 THUNDER ACTION :   0.0% win,   1.6% place [0 form] rating: 51 diff: 33
  #12 RISING FROM ASH:   0.0% win,   0.0% place [6 form] rating: 29 diff: 55

  Differentiation (equiv hist thresholds): avgDiff 26 | diff<8: 2 | sparse: 2 | gap: 5
  **Betting (hist place %):** 🔴 — all Turf ST: 0/1 (0.0%) 🔴 | same class (Class 3): 0/1 (0.0%) 🔴 | same dist (1200m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=2 --close=2 --avgdiff=26 --gap=5 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 9 - Sha Tin | Class 3 | 1000m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 2 MICKLEY        :  38.6% win,  79.0% place [9 form] rating: 75 diff: 0
  # 5 EVER LUCK      :  29.0% win,  73.1% place [5 form] rating: 73 diff: 2
  # 1 FAST RESPONDER :  19.4% win,  62.7% place [10 form] rating: 71 diff: 4
  # 4 ALPHA STRIKE   :   7.9% win,  36.6% place [5 form] rating: 66 diff: 9
  # 3 METRO POWER    :   2.0% win,  16.5% place [11 form] rating: 61 diff: 14
  # 7 STRAIGHT TO GLO:   1.4% win,  11.9% place [9 form] rating: 59 diff: 16
  #10 PARENTS' LOVE  :   0.7% win,   5.6% place [11 form] rating: 55 diff: 20
  #14 SPARKLING FELLO:   0.6% win,   7.5% place [7 form] rating: 57 diff: 18
  #11 LOOKING BRIGHT :   0.2% win,   3.0% place [4 form] rating: 53 diff: 22
  # 6 MASTER OF ALL  :   0.1% win,   1.4% place [8 form] rating: 49 diff: 26
  # 8 WATCH LEGEND   :   0.1% win,   1.6% place [0 form] rating: 51 diff: 24
  #12 LIGHTNESS OF MU:   0.0% win,   0.2% place [2 form] rating: 43 diff: 32
  # 9 FIERY STEED    :   0.0% win,   0.1% place [2 form] rating: 40 diff: 35
  #13 LUCKY CANDY    :   0.0% win,   0.8% place [6 form] rating: 48 diff: 27

  Differentiation (equiv hist thresholds): avgDiff 18 | diff<8: 3 | sparse: 1 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf ST: 10/18 (55.6%) 🔴 | same class (Class 3): 2/7 (28.6%) 🔴 | same dist (1000m): 0/0 (no past BET) ⚪
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=3 --avgdiff=18 --gap=2 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 10 - Sha Tin | Class 3 | 1600m Turf | 14 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 14 horses, 5,000 iterations):
  # 1 MISTER DAPPER  :  44.2% win,  82.0% place [7 form] rating: 78 diff: 0
  # 3 ENDUED         :  22.9% win,  66.0% place [9 form] rating: 74 diff: 4
  # 4 AMAZING PARTNER:  18.5% win,  61.3% place [6 form] rating: 73 diff: 5
  # 5 SMART AVENUE   :   5.5% win,  30.4% place [8 form] rating: 67 diff: 11
  # 6 FAMILY JEWEL   :   4.2% win,  25.9% place [4 form] rating: 66 diff: 12
  # 2 BLAZING WUKONG :   3.9% win,  23.0% place [9 form] rating: 65 diff: 13
  # 7 GOLDEN CHAMP   :   0.4% win,   4.3% place [3 form] rating: 56 diff: 22
  # 8 CALL ME MAGNIFI:   0.1% win,   1.5% place [0 form] rating: 52 diff: 26
  #11 LEGEND WINNER  :   0.1% win,   1.5% place [6 form] rating: 52 diff: 26
  #12 MASTER TRILLION:   0.1% win,   1.3% place [9 form] rating: 52 diff: 26
  # 9 HYMNBOOK       :   0.1% win,   2.1% place [3 form] rating: 53 diff: 25
  #13 RISING PHOENIX :   0.0% win,   0.3% place [12 form] rating: 48 diff: 30
  #14 WITHALLMYFAITH :   0.0% win,   0.2% place [12 form] rating: 48 diff: 30
  #10 M M CONCORD    :   0.0% win,   0.4% place [3 form] rating: 47 diff: 31

  Differentiation (equiv hist thresholds): avgDiff 19 | diff<8: 3 | sparse: 1 | gap: 4
  **Betting (hist place %):** 🔴 — all Turf ST: 4/9 (44.4%) 🔴 | same class (Class 3): 2/5 (40.0%) 🔴 | same dist (1600m): 0/1 (0.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=1 --close=3 --avgdiff=19 --gap=4 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
RACE 11 - Sha Tin | Class 2 | 1200m Turf | 12 runners
═══════════════════════════════════════════════════════

Win Probability Rankings (all 12 horses, 5,000 iterations):
  # 4 PATCH OF STARS :  29.9% win,  67.4% place [6 form] rating: 71 diff: 0
  # 6 BULB GENERAL   :  21.9% win,  57.5% place [3 form] rating: 69 diff: 2
  #11 HOT DELIGHT    :  19.9% win,  57.0% place [3 form] rating: 69 diff: 2
  # 2 CRIMSON FLASH  :  10.2% win,  35.7% place [7 form] rating: 65 diff: 6
  # 5 YOUNG CHAMPION :   8.3% win,  31.9% place [13 form] rating: 64 diff: 7
  # 1 LUCKY WITH YOU :   4.7% win,  20.9% place [7 form] rating: 61 diff: 10
  # 3 INVINCIBLE SAGE:   2.4% win,  11.5% place [7 form] rating: 58 diff: 13
  #12 PUBLIC ATTENTIO:   2.1% win,  12.1% place [5 form] rating: 58 diff: 13
  #10 AKASHVANI      :   0.5% win,   3.6% place [12 form] rating: 52 diff: 19
  # 7 VICTOR THE WINN:   0.1% win,   1.3% place [10 form] rating: 48 diff: 23
  # 9 LADY'S CHOICE  :   0.1% win,   1.1% place [10 form] rating: 48 diff: 23
  # 8 GUSTOSISIMO    :   0.0% win,   0.0% place [10 form] rating: 37 diff: 34

  Differentiation (equiv hist thresholds): avgDiff 13 | diff<8: 5 | sparse: 0 | gap: 2
  **Betting (hist place %):** 🔴 — all Turf ST: 9/19 (47.4%) 🔴 | same class (Class 2): 2/4 (50.0%) 🔴 | same dist (1200m): 0/4 (0.0%) 🔴
  Equiv CLI: `npx tsx tools/backtest-differentiation.ts --sparse=0 --close=5 --avgdiff=13 --gap=2 --venue=ST --surface=Turf --form=all --ignore-after=2026-05-09` (+ optional `--months=`)

═══════════════════════════════════════════════════════
MEETING OVERVIEW
═══════════════════════════════════════════════════════

| Race | Class | Dist | Field | Sparse | Top Horse | Win% | Place% | AvgDiff | Diff<8 | Gap | Betting | Hist all | Hist class | Hist dist |
|------|-------|------|-------|--------|-----------|------|--------|---------|--------|-----|---------|----------|------------|-----------|
| R1 | Griffin | 1000m | 10 | 10 | #4 SILVERY KNIGHT | 27.0% | 58.9% | 6 | 6 | 3 | 🔴 | 43/85 (50.6%) | 0/0 (no past BET) | 3/8 (37.5%) |
| R2 | Class 4 | 1200m | 12 | 3 | #1 NORTHERN FIRE BALL | 30.4% | 66.9% | 11 | 4 | 0 | 🔴 | 43/85 (50.6%) | 17/28 (60.7%) | 10/25 (40.0%) |
| R3 | Class 5 | 1400m | 14 | 0 | #6 GENERAL SMART | 48.9% | 81.0% | 18 | 1 | 8 | 🟡 | 2/3 (66.7%) | 0/0 (no past BET) | 1/1 (100.0%) |
| R4 | Class 4 | 1000m | 14 | 4 | #1 ALSONSO | 26.9% | 67.0% | 15 | 4 | 0 | 🔴 | 38/74 (51.4%) | 15/25 (60.0%) | 1/3 (33.3%) |
| R5 | Class 4 | 1200m | 12 | 4 | #1 CONRAD PATCH | 66.6% | 92.1% | 19 | 1 | 13 | 🔴 | 0/1 (0.0%) | 0/0 (no past BET) | 0/0 (no past BET) |
| R6 | Class 4 | 1400m | 14 | 3 | #13 THE CONCENTRATION | 29.1% | 64.0% | 12 | 5 | 2 | 🔴 | 38/75 (50.7%) | 15/25 (60.0%) | 14/24 (58.3%) |
| R7 | Class 4 | 1600m | 14 | 0 | #1 GALLANT EPOCH | 25.9% | 63.2% | 15 | 6 | 1 | 🔴 | 12/21 (57.1%) | 4/5 (80.0%) | 2/3 (66.7%) |
| R8 | Class 3 | 1200m | 12 | 2 | #3 GOLD PATCH | 62.5% | 96.7% | 26 | 2 | 5 | 🔴 | 0/1 (0.0%) | 0/1 (0.0%) | 0/0 (no past BET) |
| R9 | Class 3 | 1000m | 14 | 1 | #2 MICKLEY | 38.6% | 79.0% | 18 | 3 | 2 | 🔴 | 10/18 (55.6%) | 2/7 (28.6%) | 0/0 (no past BET) |
| R10 | Class 3 | 1600m | 14 | 1 | #1 MISTER DAPPER | 44.2% | 82.0% | 19 | 3 | 4 | 🔴 | 4/9 (44.4%) | 2/5 (40.0%) | 0/1 (0.0%) |
| R11 | Class 2 | 1200m | 12 | 0 | #4 PATCH OF STARS | 29.9% | 67.4% | 13 | 5 | 2 | 🔴 | 9/19 (47.4%) | 2/4 (50.0%) | 0/4 (0.0%) |
