export {
  FormAnalyzer,
  formAnalyzer,
  analyzeRace,
  analyzeHorse,
} from "./analysis/formAnalysis";

export {
  SpeedRatingCalculator,
  speedRatingCalculator,
  calculateSpeedFigure,
  projectSpeedRating,
} from "./analysis/speedRating";

export {
  MonteCarloSimulator,
  defaultSimulator,
  simulateRace,
  createSimulator,
} from "./simulation/monteCarlo";

export {
  MONTE_CARLO_RUNS,
  performanceStdDevForVenue,
  createSimulatorForRace,
} from "./simulation/config";

export type {
  Venue,
  TrackSurface,
  Going,
  RaceClass,
  Gear,
  SeasonStats,
  CourseStats,
  Jockey,
  Trainer,
  PastPerformance,
  Horse,
  RaceEntry,
  Race,
  RaceResult,
  SpeedFigure,
  HorseAnalysis,
  SimulationResult,
  ExoticProbabilities,
  BetType,
  BetRecommendation,
  RaceRecommendation,
  BettingConfig,
  ScraperConfig,
} from "./types";

export { DEFAULT_BETTING_CONFIG, DEFAULT_SCRAPER_CONFIG } from "./types";

export {
  oddsToProb,
  probToOdds,
  calculateEdge,
  parseFormString,
  calculateFormScore,
  randomNormal,
  clamp,
  formatCurrency,
  formatPercent,
  sleep,
} from "./utils";
