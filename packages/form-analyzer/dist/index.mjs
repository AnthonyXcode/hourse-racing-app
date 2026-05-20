// src/analysis/formAnalysis.ts
import { differenceInDays } from "date-fns";

// src/utils.ts
function oddsToProb(odds) {
  if (odds <= 1) return 1;
  return 1 / odds;
}
function probToOdds(prob) {
  if (prob <= 0) return Infinity;
  if (prob >= 1) return 1;
  return 1 / prob;
}
function calculateEdge(modelProb, marketProb) {
  if (marketProb === 0) return 0;
  return (modelProb - marketProb) / marketProb * 100;
}
function parseFormString(form) {
  return form.split("-").map((pos) => {
    const num = parseInt(pos, 10);
    return isNaN(num) ? 0 : num;
  }).filter((pos) => pos > 0);
}
function calculateFormScore(positions, fieldSizes = []) {
  if (positions.length === 0) return 0;
  const weights = [1, 0.85, 0.7, 0.55, 0.4, 0.25];
  let totalWeight = 0;
  let weightedScore = 0;
  for (let i = 0; i < Math.min(positions.length, 6); i++) {
    const position = positions[i];
    const fieldSize = fieldSizes[i] ?? 14;
    const weight = weights[i];
    const score = (fieldSize - position + 1) / fieldSize;
    weightedScore += score * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}
function formatCurrency(amount, currency = "HKD") {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
function formatPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function randomNormal(mean = 0, stdDev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// src/analysis/speedRating.ts
var PAR_TIMES = {
  "Sha Tin": {
    Turf: {
      1e3: {
        "Class 1": 55.5,
        "Class 2": 56,
        "Class 3": 56.5,
        "Class 4": 57.2,
        "Class 5": 58,
        Griffin: 58.5,
        "Group 1": 54.8,
        "Group 2": 55.2,
        "Group 3": 55.5,
        "4 Year Olds": 55.5,
        Handicap: 56.5
      },
      1200: {
        "Class 1": 68,
        "Class 2": 68.8,
        "Class 3": 69.5,
        "Class 4": 70.3,
        "Class 5": 71.2,
        Griffin: 71.8,
        "Group 1": 67,
        "Group 2": 67.5,
        "Group 3": 68,
        "4 Year Olds": 68,
        Handicap: 69
      },
      1400: {
        "Class 1": 80.5,
        "Class 2": 81.3,
        "Class 3": 82.2,
        "Class 4": 83.2,
        "Class 5": 84.5,
        Griffin: 85,
        "Group 1": 79.5,
        "Group 2": 80,
        "Group 3": 80.5,
        "4 Year Olds": 80.5,
        Handicap: 81.5
      },
      1600: {
        "Class 1": 93,
        "Class 2": 94,
        "Class 3": 95,
        "Class 4": 96.2,
        "Class 5": 97.5,
        Griffin: 98,
        "Group 1": 91.5,
        "Group 2": 92,
        "Group 3": 92.5,
        "4 Year Olds": 92.5,
        Handicap: 94
      },
      1800: {
        "Class 1": 106,
        "Class 2": 107.2,
        "Class 3": 108.5,
        "Class 4": 110,
        "Class 5": 111.5,
        Griffin: 112,
        "Group 1": 104.5,
        "Group 2": 105,
        "Group 3": 105.5,
        "4 Year Olds": 105.5,
        Handicap: 107.5
      },
      2e3: {
        "Class 1": 119.5,
        "Class 2": 121,
        "Class 3": 122.5,
        "Class 4": 124,
        "Class 5": 126,
        Griffin: 127,
        "Group 1": 118,
        "Group 2": 118.5,
        "Group 3": 119,
        "4 Year Olds": 119,
        Handicap: 121
      },
      2400: {
        "Class 1": 145,
        "Class 2": 147,
        "Class 3": 149,
        "Class 4": 151.5,
        "Class 5": 154,
        Griffin: 155,
        "Group 1": 142,
        "Group 2": 143,
        "Group 3": 144,
        "4 Year Olds": 144,
        Handicap: 147
      }
    },
    AWT: {
      1200: {
        "Class 1": 69.5,
        "Class 2": 70.3,
        "Class 3": 71,
        "Class 4": 71.8,
        "Class 5": 72.8,
        Griffin: 73.5,
        "Group 1": 68.5,
        "Group 2": 69,
        "Group 3": 69.5,
        "4 Year Olds": 69.5,
        Handicap: 70.5
      },
      1650: {
        "Class 1": 98,
        "Class 2": 99,
        "Class 3": 100,
        "Class 4": 101.5,
        "Class 5": 103,
        Griffin: 104,
        "Group 1": 96.5,
        "Group 2": 97,
        "Group 3": 97.5,
        "4 Year Olds": 97.5,
        Handicap: 99
      }
    }
  },
  "Happy Valley": {
    Turf: {
      1e3: {
        "Class 1": 56,
        "Class 2": 56.5,
        "Class 3": 57,
        "Class 4": 57.8,
        "Class 5": 58.5,
        Griffin: 59,
        "Group 1": 55,
        "Group 2": 55.5,
        "Group 3": 56,
        "4 Year Olds": 56,
        Handicap: 57
      },
      1200: {
        "Class 1": 69,
        "Class 2": 69.8,
        "Class 3": 70.5,
        "Class 4": 71.3,
        "Class 5": 72.2,
        Griffin: 72.8,
        "Group 1": 68,
        "Group 2": 68.5,
        "Group 3": 69,
        "4 Year Olds": 69,
        Handicap: 70
      },
      1650: {
        "Class 1": 98.5,
        "Class 2": 99.5,
        "Class 3": 100.5,
        "Class 4": 101.8,
        "Class 5": 103,
        Griffin: 104,
        "Group 1": 97,
        "Group 2": 97.5,
        "Group 3": 98,
        "4 Year Olds": 98,
        Handicap: 99.5
      },
      1800: {
        "Class 1": 107.5,
        "Class 2": 108.8,
        "Class 3": 110,
        "Class 4": 111.5,
        "Class 5": 113,
        Griffin: 114,
        "Group 1": 106,
        "Group 2": 106.5,
        "Group 3": 107,
        "4 Year Olds": 107,
        Handicap: 109
      },
      2200: {
        "Class 1": 133,
        "Class 2": 134.5,
        "Class 3": 136,
        "Class 4": 138,
        "Class 5": 140,
        Griffin: 141.5,
        "Group 1": 131,
        "Group 2": 131.5,
        "Group 3": 132,
        "4 Year Olds": 132,
        Handicap: 134.5
      }
    },
    AWT: {}
    // Happy Valley doesn't have AWT
  }
};
var GOING_ADJUSTMENTS = {
  Firm: -0.3,
  "Good to Firm": -0.15,
  Good: 0,
  "Good to Yielding": 0.2,
  Yielding: 0.5,
  Soft: 0.8,
  Heavy: 1.2,
  "Wet Fast": -0.1,
  // AWT
  "Wet Slow": 0.3
  // AWT
};
var STANDARD_WEIGHT = 126;
var WEIGHT_ADJUSTMENT_PER_LB_PER_200M = 0.08;
var SpeedRatingCalculator = class {
  constructor() {
    this.baseRating = 100;
    // Par performance = 100
    this.secondsPerRatingPoint = 0.2;
  }
  // 0.2 seconds = 1 rating point
  /**
   * Get par time for a race configuration
   */
  getParTime(venue, surface, distance, raceClass) {
    const venuePars = PAR_TIMES[venue];
    if (!venuePars) return null;
    const surfacePars = venuePars[surface];
    if (!surfacePars) return null;
    const distances = Object.keys(surfacePars).map(Number);
    if (distances.length === 0) return null;
    const closestDistance = distances.reduce(
      (prev, curr) => Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev
    );
    const classPars = surfacePars[closestDistance];
    if (!classPars) return null;
    return classPars[raceClass] ?? classPars["Class 4"] ?? null;
  }
  /**
   * Calculate going adjustment for a race
   */
  calculateGoingAdjustment(going, distance) {
    const adjustmentPer200m = GOING_ADJUSTMENTS[going] ?? 0;
    return distance / 200 * adjustmentPer200m;
  }
  /**
   * Calculate weight adjustment
   */
  calculateWeightAdjustment(weight, distance) {
    const weightDiff = weight - STANDARD_WEIGHT;
    const adjustmentPer200m = weightDiff * WEIGHT_ADJUSTMENT_PER_LB_PER_200M;
    return distance / 200 * adjustmentPer200m;
  }
  /**
   * Calculate speed figure for a single performance
   */
  calculateSpeedFigure(performance, raceId = "") {
    if (!performance.finishTime || performance.finishTime <= 0) {
      return null;
    }
    const parTime = this.getParTime(
      performance.venue,
      performance.surface,
      performance.distance,
      performance.raceClass
    );
    if (!parTime) {
      return null;
    }
    const goingAdj = this.calculateGoingAdjustment(
      performance.going,
      performance.distance
    );
    const weightAdj = this.calculateWeightAdjustment(
      performance.weight,
      performance.distance
    );
    const adjustedTime = performance.finishTime - goingAdj - weightAdj;
    const speedRating = this.baseRating + (parTime - adjustedTime) / this.secondsPerRatingPoint;
    const clampedRating = Math.max(40, Math.min(130, Math.round(speedRating)));
    return {
      horseCode: "",
      // Will be set by caller
      raceId,
      rawTime: performance.finishTime,
      adjustedTime,
      speedRating: clampedRating,
      classAdjustment: 0,
      // Already factored into par time
      goingAdjustment: goingAdj,
      weightAdjustment: weightAdj
    };
  }
  /**
   * Calculate speed figures for all of a horse's past performances
   */
  calculateHorseSpeedFigures(horse, maxRaces = 6) {
    const figures = [];
    const perfs = horse.pastPerformances.slice(0, maxRaces);
    for (const perf of perfs) {
      const figure = this.calculateSpeedFigure(
        perf,
        `${perf.date.toISOString().split("T")[0]}-${perf.venue === "Sha Tin" ? "ST" : "HV"}-${perf.raceNumber}`
      );
      if (figure) {
        figures.push({
          ...figure,
          horseCode: horse.code
        });
      }
    }
    return figures;
  }
  /**
   * Get average speed rating for last N races
   */
  getAverageSpeedRating(figures, lastN = 3) {
    if (figures.length === 0) return this.baseRating;
    const recentFigures = figures.slice(0, lastN);
    const sum = recentFigures.reduce((acc, f) => acc + f.speedRating, 0);
    return Math.round(sum / recentFigures.length);
  }
  /**
   * Get best speed rating from last N races
   */
  getBestSpeedRating(figures, lastN = 6) {
    if (figures.length === 0) return this.baseRating;
    const recentFigures = figures.slice(0, lastN);
    return Math.max(...recentFigures.map((f) => f.speedRating));
  }
  /**
   * Get last speed rating
   */
  getLastSpeedRating(figures) {
    if (figures.length === 0) return this.baseRating;
    return figures[0].speedRating;
  }
  /**
   * Calculate projected speed rating for upcoming race
   * Adjusts based on class change, surface change, distance change
   */
  projectSpeedRating(horse, targetVenue, targetSurface, targetDistance, targetClass) {
    const figures = this.calculateHorseSpeedFigures(horse);
    if (figures.length === 0) {
      return this.baseRating;
    }
    const avgRating = this.getAverageSpeedRating(figures);
    const bestRating = this.getBestSpeedRating(figures);
    let projection = avgRating * 0.6 + bestRating * 0.4;
    const surfacePerfs = horse.pastPerformances.filter(
      (p) => p.surface === targetSurface
    );
    if (surfacePerfs.length >= 2) {
      const surfaceFigures = surfacePerfs.map((p, i) => this.calculateSpeedFigure(p, `perf-${i}`)).filter((f) => f !== null);
      if (surfaceFigures.length > 0) {
        const surfaceAvg = this.getAverageSpeedRating(surfaceFigures);
        projection = projection * 0.5 + surfaceAvg * 0.5;
      }
    } else if (surfacePerfs.length === 0) {
      projection -= 3;
    }
    const distancePerfs = horse.pastPerformances.filter(
      (p) => Math.abs(p.distance - targetDistance) <= 200
    );
    if (distancePerfs.length >= 2) {
      const distFigures = distancePerfs.map((p, i) => this.calculateSpeedFigure(p, `perf-${i}`)).filter((f) => f !== null);
      if (distFigures.length > 0) {
        const distAvg = this.getAverageSpeedRating(distFigures);
        projection = projection * 0.5 + distAvg * 0.5;
      }
    } else if (distancePerfs.length === 0) {
      projection -= 2;
    }
    return Math.round(projection);
  }
  /**
   * Analyze speed rating trend
   * Returns positive for improving, negative for declining
   */
  calculateTrend(figures, lastN = 4) {
    if (figures.length < 2) return 0;
    const recentFigures = figures.slice(0, Math.min(lastN, figures.length));
    if (recentFigures.length < 2) return 0;
    let weightedSum = 0;
    let weightSum = 0;
    for (let i = 0; i < recentFigures.length - 1; i++) {
      const current = recentFigures[i].speedRating;
      const previous = recentFigures[i + 1].speedRating;
      const change = current - previous;
      const weight = recentFigures.length - i;
      weightedSum += change * weight;
      weightSum += weight;
    }
    return weightSum > 0 ? weightedSum / weightSum : 0;
  }
};
var speedRatingCalculator = new SpeedRatingCalculator();
function calculateSpeedFigure(performance) {
  return speedRatingCalculator.calculateSpeedFigure(performance);
}
function projectSpeedRating(horse, venue, surface, distance, raceClass) {
  return speedRatingCalculator.projectSpeedRating(
    horse,
    venue,
    surface,
    distance,
    raceClass
  );
}

// src/analysis/formAnalysis.ts
var DRAW_BIAS = {
  "Sha Tin": {
    Turf: {
      // Distance -> Draw -> Bias adjustment
      1e3: {
        1: 0.08,
        2: 0.06,
        3: 0.05,
        4: 0.04,
        5: 0.02,
        6: 0.01,
        7: 0,
        8: -0.01,
        9: -0.02,
        10: -0.03,
        11: -0.04,
        12: -0.05,
        13: -0.06,
        14: -0.07
      },
      1200: {
        1: 0.06,
        2: 0.05,
        3: 0.04,
        4: 0.03,
        5: 0.02,
        6: 0.01,
        7: 0,
        8: -0.01,
        9: -0.01,
        10: -0.02,
        11: -0.03,
        12: -0.03,
        13: -0.04,
        14: -0.05
      },
      1400: {
        1: 0.04,
        2: 0.03,
        3: 0.02,
        4: 0.02,
        5: 0.01,
        6: 0,
        7: 0,
        8: 0,
        9: -0.01,
        10: -0.01,
        11: -0.02,
        12: -0.02,
        13: -0.03,
        14: -0.03
      },
      1600: {
        1: 0.02,
        2: 0.02,
        3: 0.01,
        4: 0.01,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: -0.01,
        12: -0.01,
        13: -0.02,
        14: -0.02
      },
      // Longer distances - minimal bias
      1800: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0])),
      2e3: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0])),
      2400: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0]))
    },
    AWT: {
      // AWT at Sha Tin - more balanced
      1200: Object.fromEntries(
        Array.from({ length: 14 }, (_, i) => [i + 1, i < 7 ? 0.02 : -0.02])
      ),
      1650: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0]))
    }
  },
  "Happy Valley": {
    Turf: {
      // Happy Valley - tight track, outside draws can be better
      1e3: {
        1: -0.02,
        2: -0.01,
        3: 0,
        4: 0.01,
        5: 0.02,
        6: 0.03,
        7: 0.03,
        8: 0.02,
        9: 0.01,
        10: 0,
        11: -0.01,
        12: -0.02
      },
      1200: {
        1: -0.01,
        2: 0,
        3: 0.01,
        4: 0.02,
        5: 0.02,
        6: 0.02,
        7: 0.02,
        8: 0.01,
        9: 0,
        10: -0.01,
        11: -0.02,
        12: -0.03
      },
      1650: {
        1: 0,
        2: 0.01,
        3: 0.01,
        4: 0.01,
        5: 0.01,
        6: 0,
        7: 0,
        8: 0,
        9: -0.01,
        10: -0.01,
        11: -0.01,
        12: -0.02
      },
      1800: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0])),
      2200: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0]))
    },
    AWT: {}
  }
};
var CLASS_RATINGS = {
  "Group 1": 120,
  "Group 2": 115,
  "Group 3": 110,
  "4 Year Olds": 110,
  "Class 1": 100,
  "Class 2": 90,
  "Class 3": 80,
  "Class 4": 70,
  "Class 5": 60,
  Griffin: 55,
  Handicap: 85
};
var FormAnalyzer = class {
  constructor() {
    this.speedCalculator = new SpeedRatingCalculator();
  }
  /**
   * Analyze a horse's form for an upcoming race
   */
  analyzeHorse(horse, race, entry) {
    const speedFigures = this.speedCalculator.calculateHorseSpeedFigures(horse);
    const analysis = {
      horseCode: horse.code,
      horseName: horse.name,
      averageSpeedRating: this.speedCalculator.getAverageSpeedRating(speedFigures),
      bestSpeedRating: this.speedCalculator.getBestSpeedRating(speedFigures),
      lastSpeedRating: this.speedCalculator.getLastSpeedRating(speedFigures),
      formScore: this.calculateFormScore(horse),
      classIndicator: this.calculateClassIndicator(horse, race.class),
      daysSinceLastRace: this.calculateDaysSinceLastRace(horse, race.date),
      drawAdvantage: this.calculateDrawAdvantage(
        entry.draw,
        race.venue,
        race.surface,
        race.distance
      ),
      jockeyEdge: this.calculateJockeyEdge(entry.jockey, race),
      trainerForm: this.calculateTrainerForm(entry.trainer),
      surfacePreference: this.calculateSurfacePreference(horse, race.surface),
      goingPreference: this.calculateGoingPreference(horse, race.going),
      distancePreference: this.calculateDistancePreference(horse, race.distance),
      ratingMomentum: this.calculateRatingMomentum(horse, race),
      formRecordCount: horse.pastPerformances?.length ?? 0,
      overallRating: 0
    };
    return analysis;
  }
  /**
   * Calculate composite overall rating.
   * Uses venue/surface/class-specific weights:
   * - HV: tight tactical track — jockey skill, form momentum, class matter more than raw speed
   * - AWT: par times less calibrated, going preference useless (all "wet"), surface specialist matters
   * - ST Turf C3: transition class — raw speed less predictive (mixed C2/C4 context), class
   *   movement direction and rating trajectory are the key differentiators
   * - ST Turf default: speed rating is the dominant predictor
   */
  calculateOverallRating(analysis, venue, surface, raceClass) {
    const isC3 = raceClass === "Class 3";
    const weights = venue === "Happy Valley" ? {
      speedRating: 0.18,
      formScore: 0.14,
      classIndicator: 0.1,
      ratingMomentum: 0.13,
      fitness: 0.1,
      drawAdvantage: 0.07,
      jockeyEdge: 0.13,
      trainerForm: 0.07,
      surfacePreference: 0.03,
      goingPreference: 0.03,
      distancePreference: 0.02
    } : surface === "AWT" ? {
      // AWT-specific: speed rating less reliable (only 2 hardcoded par distances),
      // going preference is always -0.2 (no wet history) so zeroed out,
      // surface specialist history matters much more than on Turf.
      speedRating: 0.25,
      formScore: 0.18,
      classIndicator: 0.08,
      ratingMomentum: 0.08,
      fitness: 0.1,
      drawAdvantage: 0.06,
      jockeyEdge: 0.1,
      trainerForm: 0.06,
      surfacePreference: 0.07,
      goingPreference: 0,
      distancePreference: 0.02
    } : isC3 ? {
      // C3 ST Turf: highly competitive transition class. Speed figures from
      // mixed C2/C4 contexts are unreliable. classIndicator and ratingMomentum
      // also tend to overstate false confidence (backed by data: avgDiff 14-16
      // C3 Turf bets hit only 25%). Jockey booking is the primary real-world
      // signal — top jockeys at HKJC are carefully allocated and their bookings
      // directly reflect trainer confidence and horse fitness.
      speedRating: 0.3,
      formScore: 0.16,
      classIndicator: 0.06,
      ratingMomentum: 0.08,
      fitness: 0.1,
      drawAdvantage: 0.07,
      jockeyEdge: 0.14,
      trainerForm: 0.05,
      surfacePreference: 0.02,
      goingPreference: 0.02,
      distancePreference: 0
    } : {
      speedRating: 0.35,
      formScore: 0.13,
      classIndicator: 0.06,
      ratingMomentum: 0.06,
      fitness: 0.1,
      drawAdvantage: 0.08,
      jockeyEdge: 0.08,
      trainerForm: 0.05,
      surfacePreference: 0.03,
      goingPreference: 0.03,
      distancePreference: 0.03
    };
    const normalizedSpeed = Math.max(0, Math.min(1, (analysis.averageSpeedRating - 60) / 60));
    const fitnessScore = this.calculateFitnessScore(analysis.daysSinceLastRace);
    const normalizedClass = (analysis.classIndicator + 5) / 10;
    const normalizedMomentum = (analysis.ratingMomentum + 1) / 2;
    const rating = normalizedSpeed * weights.speedRating + analysis.formScore * weights.formScore + normalizedClass * weights.classIndicator + normalizedMomentum * weights.ratingMomentum + fitnessScore * weights.fitness + (analysis.drawAdvantage + 0.1) * 5 * weights.drawAdvantage + (analysis.jockeyEdge + 0.1) * 5 * weights.jockeyEdge + analysis.trainerForm * weights.trainerForm + (analysis.surfacePreference + 1) / 2 * weights.surfacePreference + (analysis.goingPreference + 1) / 2 * weights.goingPreference + (analysis.distancePreference + 1) / 2 * weights.distancePreference;
    return Math.round(rating * 100);
  }
  /**
   * Calculate form score from recent finishes
   */
  calculateFormScore(horse) {
    const recentPerfs = horse.pastPerformances.slice(0, 6);
    if (recentPerfs.length === 0) return 0.5;
    const positions = recentPerfs.map((p) => p.finishPosition);
    const fieldSizes = recentPerfs.map((p) => p.fieldSize);
    return calculateFormScore(positions, fieldSizes);
  }
  /**
   * Returns true for Group 1/2/3 races.
   * Group races use weight-for-age / penalty systems, not the Class 1-5 rating bands.
   */
  isGroupClass(cls) {
    return cls === "Group 1" || cls === "Group 2" || cls === "Group 3";
  }
  /**
   * Calculate class indicator (positive = dropping, negative = rising).
   * Uses the actual HKJC handicap rating when available for intra-class
   * differentiation — except for Group races, where the rating band concept
   * does not apply (weight-for-age / penalties system).
   * Return value is clamped to [-5, +5] so calculateOverallRating normalises
   * correctly regardless of the size of the class jump.
   *
   * Distressed dropper check: a horse that recently raced at a higher class but
   * consistently finished in the bottom 40% of those fields is an involuntary
   * dropper (handicapper demoted them). The naive "dropping in class = good"
   * bonus is heavily discounted for these horses.
   */
  calculateClassIndicator(horse, targetClass) {
    const targetClassRating = CLASS_RATINGS[targetClass];
    if (horse.currentRating > 0 && horse.pastPerformances.length > 0) {
      const recentPerfs2 = horse.pastPerformances.slice(0, 3);
      const avgRecentClass2 = recentPerfs2.reduce((sum, p) => sum + CLASS_RATINGS[p.raceClass], 0) / recentPerfs2.length;
      let classComponent2 = (avgRecentClass2 - targetClassRating) / 10;
      if (this.isGroupClass(targetClass)) {
        return Math.max(-5, Math.min(5, classComponent2));
      }
      classComponent2 = this.adjustForDistressedDropper(classComponent2, recentPerfs2, targetClassRating);
      const classMid = targetClassRating - 5;
      const ratingAdvantage = (classMid - horse.currentRating) / 20;
      return Math.max(-5, Math.min(5, classComponent2 * 0.6 + ratingAdvantage * 0.4));
    }
    if (horse.pastPerformances.length === 0) return 0;
    const recentPerfs = horse.pastPerformances.slice(0, 3);
    const avgRecentClass = recentPerfs.reduce((sum, p) => sum + CLASS_RATINGS[p.raceClass], 0) / recentPerfs.length;
    let classComponent = (avgRecentClass - targetClassRating) / 10;
    classComponent = this.adjustForDistressedDropper(classComponent, recentPerfs, targetClassRating);
    return Math.max(-5, Math.min(5, classComponent));
  }
  /**
   * Discount the class-drop bonus for "distressed droppers" — horses that were
   * recently racing at a higher class level but consistently finishing in the
   * bottom 40% of those fields. This indicates an involuntary demotion by the
   * handicapper rather than a strategic placement, and the horse is unlikely
   * to dominate simply by virtue of the lower class level.
   *
   * Only applies when classComponent > 0 (horse is dropping in class) and at
   * least 2 of the recent runs were at the higher class level.
   */
  adjustForDistressedDropper(classComponent, recentPerfs, targetClassRating) {
    if (classComponent <= 0) return classComponent;
    const higherClassPerfs = recentPerfs.filter(
      (p) => CLASS_RATINGS[p.raceClass] > targetClassRating
    );
    if (higherClassPerfs.length < 2) return classComponent;
    const avgRelPos = higherClassPerfs.reduce(
      (sum, p) => sum + p.finishPosition / Math.max(1, p.fieldSize),
      0
    ) / higherClassPerfs.length;
    if (avgRelPos > 0.6) {
      return classComponent * 0.25;
    }
    return classComponent;
  }
  /**
   * Calculate rating momentum from the handicapper's Rtg.+/- and the horse's
   * position within its class. Returns -1 to 1.
   *
   * Positive Rtg.+/- means the handicapper raised the rating (horse improving).
   * But a large rise also means more weight, so there's a diminishing return.
   * Negative Rtg.+/- means the handicapper dropped the rating (horse declining),
   * but this also gives a weight relief advantage.
   */
  calculateRatingMomentum(horse, race) {
    const change = horse.ratingChange;
    if (change === void 0) return 0;
    if (change > 0) {
      return Math.min(1, change * 0.1 * (1 - change * 5e-3));
    }
    return Math.max(-1, change * 0.1);
  }
  /**
   * Calculate days since last race
   */
  calculateDaysSinceLastRace(horse, raceDate) {
    if (horse.pastPerformances.length === 0) return 365;
    const lastRace = horse.pastPerformances[0];
    return differenceInDays(raceDate, lastRace.date);
  }
  /**
   * Calculate fitness score based on days since last race
   * Optimal: 14-35 days
   */
  calculateFitnessScore(days) {
    if (days >= 14 && days <= 35) return 1;
    if (days >= 7 && days < 14) return 0.85;
    if (days > 35 && days <= 60) return 0.8;
    if (days > 60 && days <= 90) return 0.65;
    if (days > 90 && days <= 180) return 0.5;
    if (days > 180) return 0.35;
    if (days < 7) return 0.7;
    return 0.5;
  }
  /**
   * Calculate draw advantage based on historical bias
   */
  calculateDrawAdvantage(draw, venue, surface, distance) {
    const venueBias = DRAW_BIAS[venue];
    if (!venueBias) return 0;
    const surfaceBias = venueBias[surface];
    if (!surfaceBias) return 0;
    const distances = Object.keys(surfaceBias).map(Number);
    if (distances.length === 0) return 0;
    const closestDistance = distances.reduce(
      (prev, curr) => Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev
    );
    const distanceBias = surfaceBias[closestDistance];
    if (!distanceBias) return 0;
    return distanceBias[draw] ?? 0;
  }
  /**
   * Calculate jockey edge compared to field average
   */
  calculateJockeyEdge(jockey, race) {
    const baseWinRate = 0.08;
    const jockeyWinRate = jockey.seasonStats.winRate;
    let edge = jockeyWinRate - baseWinRate;
    const courseStats = jockey.courseStats.find(
      (cs) => cs.venue === race.venue && (!cs.surface || cs.surface === race.surface) && (!cs.distance || Math.abs(cs.distance - race.distance) <= 200)
    );
    if (courseStats && courseStats.rides >= 10) {
      edge = edge * 0.5 + (courseStats.winRate - baseWinRate) * 0.5;
    }
    if (race.venue === "Happy Valley") {
      const clamped = Math.max(-0.1, Math.min(0.15, edge));
      if (clamped > 0) {
        return Math.sqrt(clamped / 0.15) * 0.1;
      }
      return clamped;
    }
    return Math.max(-0.1, Math.min(0.15, edge));
  }
  /**
   * Calculate trainer recent form
   */
  calculateTrainerForm(trainer) {
    const winRate = trainer.seasonStats.winRate;
    const normalizedForm = Math.min(1, winRate / 0.15);
    const placeRate = trainer.seasonStats.placeRate;
    const normalizedPlace = Math.min(1, placeRate / 0.4);
    return normalizedForm * 0.7 + normalizedPlace * 0.3;
  }
  /**
   * Calculate surface preference (-1 to 1)
   */
  calculateSurfacePreference(horse, targetSurface) {
    const perfs = horse.pastPerformances;
    if (perfs.length < 3) return 0;
    const surfacePerfs = perfs.filter((p) => p.surface === targetSurface);
    const otherPerfs = perfs.filter((p) => p.surface !== targetSurface);
    if (surfacePerfs.length === 0) {
      if (targetSurface === "AWT") return 0;
      return -0.3;
    }
    if (otherPerfs.length === 0) return 0.2;
    const surfaceAvgPos = surfacePerfs.slice(0, 5).reduce((sum, p) => sum + p.finishPosition, 0) / Math.min(5, surfacePerfs.length);
    const otherAvgPos = otherPerfs.slice(0, 5).reduce((sum, p) => sum + p.finishPosition, 0) / Math.min(5, otherPerfs.length);
    const preference = (otherAvgPos - surfaceAvgPos) / 5;
    return Math.max(-1, Math.min(1, preference));
  }
  /**
   * Calculate going preference (-1 to 1).
   *
   * Three tiers reflect meaningfully different racing conditions:
   *   "firm" — Firm, Good to Firm, Good  (fast ground, suits speedier types)
   *   "soft" — Good to Yielding, Yielding, Soft, Heavy  (wet Turf)
   *   "wet"  — Wet Fast, Wet Slow  (AWT-specific; very different from Turf soft)
   *
   * AWT going ("Wet Fast"/"Wet Slow") is zeroed out when the horse has no wet
   * history: almost every horse in an AWT field would return the same -0.2,
   * which provides zero differentiation signal and only adds noise.
   */
  calculateGoingPreference(horse, targetGoing) {
    const perfs = horse.pastPerformances;
    if (perfs.length < 3) return 0;
    const goingTier = (g) => {
      if (["Firm", "Good to Firm", "Good"].includes(g)) return "firm";
      if (["Wet Fast", "Wet Slow"].includes(g)) return "wet";
      return "soft";
    };
    const targetTier = goingTier(targetGoing);
    const matchingPerfs = perfs.filter((p) => goingTier(p.going) === targetTier);
    const otherPerfs = perfs.filter((p) => goingTier(p.going) !== targetTier);
    if (matchingPerfs.length === 0) {
      if (targetTier === "wet") return 0;
      return -0.2;
    }
    if (otherPerfs.length === 0) return 0.1;
    const matchAvgPos = matchingPerfs.slice(0, 5).reduce((sum, p) => sum + p.finishPosition, 0) / Math.min(5, matchingPerfs.length);
    const otherAvgPos = otherPerfs.slice(0, 5).reduce((sum, p) => sum + p.finishPosition, 0) / Math.min(5, otherPerfs.length);
    const preference = (otherAvgPos - matchAvgPos) / 5;
    return Math.max(-1, Math.min(1, preference));
  }
  /**
   * Calculate distance preference (-1 to 1)
   */
  calculateDistancePreference(horse, targetDistance) {
    const perfs = horse.pastPerformances;
    if (perfs.length < 3) return 0;
    const matchingPerfs = perfs.filter(
      (p) => Math.abs(p.distance - targetDistance) <= 200
    );
    const otherPerfs = perfs.filter(
      (p) => Math.abs(p.distance - targetDistance) > 200
    );
    if (matchingPerfs.length === 0) {
      const avgPrevDist = perfs.slice(0, 3).reduce((sum, p) => sum + p.distance, 0) / 3;
      if (targetDistance > avgPrevDist + 300) return -0.2;
      if (targetDistance < avgPrevDist - 300) return -0.1;
      return 0;
    }
    if (otherPerfs.length === 0) return 0.2;
    const matchAvgPos = matchingPerfs.slice(0, 5).reduce((sum, p) => sum + p.finishPosition, 0) / Math.min(5, matchingPerfs.length);
    const otherAvgPos = otherPerfs.slice(0, 5).reduce((sum, p) => sum + p.finishPosition, 0) / Math.min(5, otherPerfs.length);
    const preference = (otherAvgPos - matchAvgPos) / 5;
    return Math.max(-1, Math.min(1, preference));
  }
  /**
   * Analyze all entries for a race
   */
  analyzeRace(race) {
    const analyses = [];
    for (const entry of race.entries) {
      if (entry.isScratched) continue;
      const analysis = this.analyzeHorse(entry.horse, race, entry);
      const overallRating = this.calculateOverallRating(analysis, race.venue, race.surface, race.class);
      analyses.push({
        ...analysis,
        overallRating
      });
    }
    return analyses.sort((a, b) => b.overallRating - a.overallRating);
  }
};
var formAnalyzer = new FormAnalyzer();
function analyzeRace(race) {
  return formAnalyzer.analyzeRace(race);
}
function analyzeHorse(horse, race, entry) {
  return formAnalyzer.analyzeHorse(horse, race, entry);
}

// src/simulation/monteCarlo.ts
var DEFAULT_CONFIG = {
  runs: 1e4,
  performanceStdDev: 8,
  // Rating points
  minProbabilityThreshold: 1e-3
  // 0.1%
};
var MonteCarloSimulator = class _MonteCarloSimulator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.formAnalyzer = new FormAnalyzer();
  }
  /**
   * Simulate a race and return probabilities (runs form analysis internally).
   */
  simulateRace(race) {
    const analyses = this.formAnalyzer.analyzeRace(race);
    return this.simulateRaceWithAnalyses(race, analyses);
  }
  /**
   * Simulate using pre-computed form analyses (e.g. after a separate analyzeRace step).
   */
  simulateRaceWithAnalyses(race, analyses) {
    const horseMap = /* @__PURE__ */ new Map();
    for (const entry of race.entries) {
      if (entry.isScratched) continue;
      const analysis = analyses.find((a) => a.horseCode === entry.horse.code);
      if (analysis) {
        horseMap.set(entry.horseNumber, analysis);
      }
    }
    const winCounts = /* @__PURE__ */ new Map();
    const placeCounts = /* @__PURE__ */ new Map();
    const positionSums = /* @__PURE__ */ new Map();
    const positionSqSums = /* @__PURE__ */ new Map();
    const exactaCounts = /* @__PURE__ */ new Map();
    const quinellaCounts = /* @__PURE__ */ new Map();
    const tierceCounts = /* @__PURE__ */ new Map();
    const trioCounts = /* @__PURE__ */ new Map();
    const horseNumbers = Array.from(horseMap.keys());
    for (const num of horseNumbers) {
      winCounts.set(num, 0);
      placeCounts.set(num, 0);
      positionSums.set(num, 0);
      positionSqSums.set(num, 0);
    }
    for (let run = 0; run < this.config.runs; run++) {
      const finishOrder = this.simulateSingleRace(horseMap);
      for (let pos = 0; pos < finishOrder.length; pos++) {
        const horseNum = finishOrder[pos];
        const position = pos + 1;
        if (position === 1) {
          winCounts.set(horseNum, (winCounts.get(horseNum) ?? 0) + 1);
        }
        if (position <= 3) {
          placeCounts.set(horseNum, (placeCounts.get(horseNum) ?? 0) + 1);
        }
        positionSums.set(
          horseNum,
          (positionSums.get(horseNum) ?? 0) + position
        );
        positionSqSums.set(
          horseNum,
          (positionSqSums.get(horseNum) ?? 0) + position * position
        );
      }
      if (finishOrder.length >= 2) {
        const first = finishOrder[0];
        const second = finishOrder[1];
        const exactaKey = `${first}-${second}`;
        exactaCounts.set(exactaKey, (exactaCounts.get(exactaKey) ?? 0) + 1);
        const quinellaKey = first < second ? `${first}-${second}` : `${second}-${first}`;
        quinellaCounts.set(
          quinellaKey,
          (quinellaCounts.get(quinellaKey) ?? 0) + 1
        );
      }
      if (finishOrder.length >= 3) {
        const first = finishOrder[0];
        const second = finishOrder[1];
        const third = finishOrder[2];
        const tierceKey = `${first}-${second}-${third}`;
        tierceCounts.set(tierceKey, (tierceCounts.get(tierceKey) ?? 0) + 1);
        const trioNums = [first, second, third].sort((a, b) => a - b);
        const trioKey = trioNums.join("-");
        trioCounts.set(trioKey, (trioCounts.get(trioKey) ?? 0) + 1);
      }
    }
    const results = [];
    for (const [horseNum, analysis] of horseMap) {
      const wins = winCounts.get(horseNum) ?? 0;
      const places = placeCounts.get(horseNum) ?? 0;
      const posSum = positionSums.get(horseNum) ?? 0;
      const posSqSum = positionSqSums.get(horseNum) ?? 0;
      const expectedPos = posSum / this.config.runs;
      const variance = posSqSum / this.config.runs - expectedPos * expectedPos;
      const stdDev = Math.sqrt(Math.max(0, variance));
      const entry = race.entries.find((e) => e.horseNumber === horseNum);
      const formRecordCount = entry?.horse.pastPerformances?.length ?? 0;
      results.push({
        horseNumber: horseNum,
        horseCode: analysis.horseCode,
        horseName: analysis.horseName,
        winProbability: wins / this.config.runs,
        placeProbability: places / this.config.runs,
        expectedPosition: expectedPos,
        positionStdDev: stdDev,
        simulationRuns: this.config.runs,
        formRecordCount
      });
    }
    results.sort((a, b) => b.winProbability - a.winProbability);
    const exoticProbabilities = {
      quinella: this.countsToProbs(quinellaCounts),
      quinellaPlace: this.calculateQuinellaPlace(results),
      tierce: this.countsToProbs(tierceCounts),
      trio: this.countsToProbs(trioCounts)
    };
    return { results, exoticProbabilities };
  }
  /**
   * Simulate a single race run
   * Returns array of horse numbers in finish order
   */
  simulateSingleRace(horseMap) {
    const performances = [];
    for (const [horseNum, analysis] of horseMap) {
      const basePerformance = analysis.overallRating;
      const variance = randomNormal(0, this.config.performanceStdDev);
      const formVariance = this.calculateFormVariance(analysis);
      const totalPerformance = basePerformance + variance + formVariance;
      performances.push({
        horseNum,
        performance: totalPerformance
      });
    }
    performances.sort((a, b) => b.performance - a.performance);
    return performances.map((p) => p.horseNum);
  }
  /**
   * Calculate additional variance based on form consistency
   */
  calculateFormVariance(analysis) {
    const formConsistency = analysis.formScore;
    const inconsistencyFactor = 1 - formConsistency;
    const additionalVariance = randomNormal(0, inconsistencyFactor * 5);
    return additionalVariance;
  }
  /**
   * Convert count map to probability map
   */
  countsToProbs(counts) {
    const probs = /* @__PURE__ */ new Map();
    for (const [key, count] of counts) {
      const prob = count / this.config.runs;
      if (prob >= this.config.minProbabilityThreshold) {
        probs.set(key, prob);
      }
    }
    return probs;
  }
  /**
   * Calculate Quinella Place probabilities
   * QP pays if your two horses finish in any two of the top 3 positions
   */
  calculateQuinellaPlace(results) {
    const qpProbs = /* @__PURE__ */ new Map();
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const horse1 = results[i];
        const horse2 = results[j];
        const prob1 = horse1.placeProbability;
        const prob2 = horse2.placeProbability;
        const fieldSize = results.length;
        const conditionalFactor = (fieldSize - 1) / fieldSize;
        const qpProb = prob1 * prob2 * conditionalFactor * 3;
        const clampedProb = Math.min(1, qpProb);
        if (clampedProb >= this.config.minProbabilityThreshold) {
          const key = `${Math.min(horse1.horseNumber, horse2.horseNumber)}-${Math.max(horse1.horseNumber, horse2.horseNumber)}`;
          qpProbs.set(key, clampedProb);
        }
      }
    }
    return qpProbs;
  }
  /**
   * Get top N most likely outcomes for an exotic bet type
   */
  getTopExoticOutcomes(probs, n = 10) {
    const sorted = Array.from(probs.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);
    return sorted.map(([combination, probability]) => ({
      combination,
      probability
    }));
  }
  /**
   * Calculate fair odds from probability
   */
  probabilityToFairOdds(probability) {
    if (probability <= 0) return Infinity;
    if (probability >= 1) return 1;
    return 1 / probability;
  }
  /**
   * Simulate multiple scenarios with different configurations
   */
  runSensitivityAnalysis(race, stdDevRange = [5, 8, 12]) {
    const results = /* @__PURE__ */ new Map();
    for (const stdDev of stdDevRange) {
      const simulator = new _MonteCarloSimulator({
        ...this.config,
        performanceStdDev: stdDev
      });
      const { results: simResults } = simulator.simulateRace(race);
      results.set(stdDev, simResults);
    }
    return results;
  }
};
var defaultSimulator = new MonteCarloSimulator();
function simulateRace(race) {
  return defaultSimulator.simulateRace(race);
}
function createSimulator(config) {
  return new MonteCarloSimulator(config);
}

// src/simulation/config.ts
var MONTE_CARLO_RUNS = 1e4;
var PERFORMANCE_STDEV_BY_VENUE = {
  "Happy Valley": 11,
  "Sha Tin": 8
};
function performanceStdDevForVenue(venue) {
  return PERFORMANCE_STDEV_BY_VENUE[venue] ?? 8;
}
function createSimulatorForRace(race) {
  return new MonteCarloSimulator({
    runs: MONTE_CARLO_RUNS,
    performanceStdDev: performanceStdDevForVenue(race.venue)
  });
}

// src/types.ts
var DEFAULT_BETTING_CONFIG = {
  bankroll: 1e4,
  maxBetPercent: 5,
  maxRacePercent: 10,
  minEdgeThreshold: 5,
  kellyFraction: 0.25,
  preferredBetTypes: ["Place", "Quinella", "Quinella Place"]
};
var DEFAULT_SCRAPER_CONFIG = {
  baseUrl: "https://racing.hkjc.com",
  rateLimit: 20,
  timeout: 3e4,
  retries: 3,
  headless: true
};
export {
  DEFAULT_BETTING_CONFIG,
  DEFAULT_SCRAPER_CONFIG,
  FormAnalyzer,
  MONTE_CARLO_RUNS,
  MonteCarloSimulator,
  SpeedRatingCalculator,
  analyzeHorse,
  analyzeRace,
  calculateEdge,
  calculateFormScore,
  calculateSpeedFigure,
  clamp,
  createSimulator,
  createSimulatorForRace,
  defaultSimulator,
  formAnalyzer,
  formatCurrency,
  formatPercent,
  oddsToProb,
  parseFormString,
  performanceStdDevForVenue,
  probToOdds,
  projectSpeedRating,
  randomNormal,
  simulateRace,
  sleep,
  speedRatingCalculator
};
