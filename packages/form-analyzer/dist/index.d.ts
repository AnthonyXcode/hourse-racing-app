/**
 * Core TypeScript interfaces for HK Horse Racing AI
 */
type Venue = "Sha Tin" | "Happy Valley";
type TrackSurface = "Turf" | "AWT";
type Going = "Firm" | "Good to Firm" | "Good" | "Good to Yielding" | "Yielding" | "Soft" | "Heavy" | "Wet Fast" | "Wet Slow";
type RaceClass = "Class 1" | "Class 2" | "Class 3" | "Class 4" | "Class 5" | "Griffin" | "Group 1" | "Group 2" | "Group 3" | "4 Year Olds" | "Handicap";
interface SeasonStats {
    readonly wins: number;
    readonly places: number;
    readonly rides: number;
    readonly winRate: number;
    readonly placeRate: number;
    readonly roi: number;
}
interface CourseStats extends SeasonStats {
    readonly venue: Venue;
    readonly surface?: TrackSurface;
    readonly distance?: number;
}
interface Jockey {
    readonly code: string;
    readonly name: string;
    readonly nationality: string;
    readonly weightClaim: number;
    readonly seasonStats: SeasonStats;
    readonly courseStats: readonly CourseStats[];
}
interface Trainer {
    readonly code: string;
    readonly name: string;
    readonly seasonStats: SeasonStats;
    readonly courseStats: readonly CourseStats[];
    readonly specialties: readonly string[];
}
type Gear = "B" | "BO" | "H" | "P" | "TT" | "V" | "VO" | "XB" | "PC" | "SR" | "CP" | "CO" | "CC" | "PS" | "SB" | "E";
interface PastPerformance {
    readonly date: Date;
    readonly venue: Venue;
    readonly raceNumber: number;
    readonly raceClass: RaceClass;
    readonly distance: number;
    readonly surface: TrackSurface;
    readonly going: Going;
    readonly draw: number;
    readonly weight: number;
    readonly jockeyCode: string;
    readonly finishPosition: number;
    readonly fieldSize: number;
    readonly winningMargin: number;
    readonly finishTime: number;
    readonly speedRating?: number;
    readonly odds: number;
    readonly comment?: string;
}
interface Horse {
    readonly code: string;
    readonly name: string;
    readonly nameChinese?: string;
    readonly age: number;
    readonly sex: "G" | "H" | "M" | "R";
    readonly color: string;
    readonly origin: string;
    readonly sire: string;
    readonly dam: string;
    readonly damSire?: string;
    readonly currentRating: number;
    readonly ratingChange?: number;
    readonly seasonStarts: number;
    readonly seasonWins: number;
    readonly seasonPlaces: number;
    readonly careerStarts: number;
    readonly careerWins: number;
    readonly careerPlaces: number;
    readonly totalPrizeMoney: number;
    readonly gear: readonly Gear[];
    readonly pastPerformances: readonly PastPerformance[];
    readonly preferredDistance?: {
        min: number;
        max: number;
    };
    readonly preferredGoing?: readonly Going[];
    readonly preferredSurface?: TrackSurface;
}
interface RaceEntry {
    readonly horse: Horse;
    readonly jockey: Jockey;
    readonly trainer: Trainer;
    readonly horseNumber: number;
    readonly draw: number;
    readonly weight: number;
    readonly gearChanges?: readonly Gear[];
    readonly priority?: number;
    readonly currentOdds?: number;
    readonly morningLineOdds?: number;
    readonly isScratched: boolean;
}
interface Race {
    readonly id: string;
    readonly date: Date;
    readonly venue: Venue;
    readonly raceNumber: number;
    readonly name?: string;
    readonly class: RaceClass;
    readonly distance: number;
    readonly surface: TrackSurface;
    readonly going: Going;
    readonly prizeMoney: number;
    readonly entries: readonly RaceEntry[];
    readonly postTime?: Date;
    readonly raceType?: string;
}
interface RaceResult extends Race {
    readonly finishOrder: readonly {
        readonly horseNumber: number;
        readonly finishPosition: number;
        readonly finishTime?: number;
        readonly margin?: number;
        readonly horseName?: string;
        readonly horseCode?: string;
        readonly jockeyName?: string;
        /** HKJC jockey profile id, e.g. from jockeyprofile?jockeyid=PZ */
        readonly jockeyId?: string;
        readonly trainerName?: string;
        /** HKJC trainer profile id, e.g. from trainerprofile?trainerid=SJJ */
        readonly trainerId?: string;
        /** Barrier / draw — HKJC "Dr." */
        readonly draw?: number;
        /** Weight carried (lb) from results — HKJC "Act. Wt." */
        readonly actualWeight?: number;
        /** Declared horse body weight on raceday — HKJC "Declar. Horse Wt." (club scale units) */
        readonly horseWeight?: number;
        readonly winOdds?: number;
    }[];
    readonly winDividend?: number;
    readonly placeDividends?: readonly number[];
    readonly quinellaDividend?: number;
    readonly quinellaPlaceDividends?: readonly number[];
    readonly tierceDividend?: number;
    readonly trioDividend?: number;
    /** First 4 (any order) merged pool — dividend per $10 as shown on HKJC results (FIRST 4 row). */
    readonly first4Dividend?: number;
}
interface SpeedFigure {
    readonly horseCode: string;
    readonly raceId: string;
    readonly rawTime: number;
    readonly adjustedTime: number;
    readonly speedRating: number;
    readonly classAdjustment: number;
    readonly goingAdjustment: number;
    readonly weightAdjustment: number;
}
interface HorseAnalysis {
    readonly horseCode: string;
    readonly horseName: string;
    readonly averageSpeedRating: number;
    readonly bestSpeedRating: number;
    readonly lastSpeedRating: number;
    readonly formScore: number;
    readonly classIndicator: number;
    readonly daysSinceLastRace: number;
    readonly drawAdvantage: number;
    readonly jockeyEdge: number;
    readonly trainerForm: number;
    readonly surfacePreference: number;
    readonly goingPreference: number;
    readonly distancePreference: number;
    readonly ratingMomentum: number;
    readonly formRecordCount: number;
    readonly overallRating: number;
}
interface SimulationResult {
    readonly horseNumber: number;
    readonly horseCode: string;
    readonly horseName: string;
    readonly winProbability: number;
    readonly placeProbability: number;
    readonly expectedPosition: number;
    readonly positionStdDev: number;
    readonly simulationRuns: number;
    /** Number of past performances (form records) used for this horse's analysis */
    readonly formRecordCount: number;
}
interface ExoticProbabilities {
    readonly quinella: Map<string, number>;
    readonly quinellaPlace: Map<string, number>;
    readonly tierce: Map<string, number>;
    readonly trio: Map<string, number>;
}
type BetType = "Win" | "Place" | "Quinella" | "Quinella Place" | "Forecast" | "Tierce" | "Trio" | "First 4" | "Quartet";
interface BetRecommendation {
    readonly betType: BetType;
    readonly selection: string;
    readonly modelProbability: number;
    readonly marketProbability: number;
    readonly edge: number;
    readonly expectedOdds: number;
    readonly currentOdds?: number;
    readonly recommendedStake: number;
    readonly maxStake: number;
    readonly expectedValue: number;
    readonly confidence: "Low" | "Medium" | "High";
    readonly reasoning: string;
}
interface RaceRecommendation {
    readonly raceId: string;
    readonly race: Race;
    readonly analysis: readonly HorseAnalysis[];
    readonly simulations: readonly SimulationResult[];
    readonly exoticProbabilities: ExoticProbabilities;
    readonly recommendations: readonly BetRecommendation[];
    readonly totalRecommendedStake: number;
    readonly topPicks: readonly {
        readonly rank: number;
        readonly horseNumber: number;
        readonly horseName: string;
        readonly winProb: number;
        readonly value: number;
    }[];
}
interface BettingConfig {
    readonly bankroll: number;
    readonly maxBetPercent: number;
    readonly maxRacePercent: number;
    readonly minEdgeThreshold: number;
    readonly kellyFraction: number;
    readonly preferredBetTypes: readonly BetType[];
}
interface ScraperConfig {
    readonly baseUrl: string;
    readonly rateLimit: number;
    readonly timeout: number;
    readonly retries: number;
    readonly headless: boolean;
}
declare const DEFAULT_BETTING_CONFIG: BettingConfig;
declare const DEFAULT_SCRAPER_CONFIG: ScraperConfig;

/**
 * Form Analysis Module
 *
 * Analyzes horse form factors including:
 * - Recent form (position patterns)
 * - Class indicators (rising/dropping)
 * - Jockey/trainer performance
 * - Draw bias
 * - Surface/going preference
 * - Distance preference
 * - Fitness/freshness
 */

declare class FormAnalyzer {
    private speedCalculator;
    constructor();
    /**
     * Analyze a horse's form for an upcoming race
     */
    analyzeHorse(horse: Horse, race: Race, entry: RaceEntry): HorseAnalysis;
    /**
     * Calculate composite overall rating.
     * Uses venue/surface/class-specific weights:
     * - HV: tight tactical track — jockey skill, form momentum, class matter more than raw speed
     * - AWT: par times less calibrated, going preference useless (all "wet"), surface specialist matters
     * - ST Turf C3: transition class — raw speed less predictive (mixed C2/C4 context), class
     *   movement direction and rating trajectory are the key differentiators
     * - ST Turf default: speed rating is the dominant predictor
     */
    calculateOverallRating(analysis: HorseAnalysis, venue?: Venue, surface?: TrackSurface, raceClass?: RaceClass): number;
    /**
     * Calculate form score from recent finishes
     */
    private calculateFormScore;
    /**
     * Returns true for Group 1/2/3 races.
     * Group races use weight-for-age / penalty systems, not the Class 1-5 rating bands.
     */
    private isGroupClass;
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
    private calculateClassIndicator;
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
    private adjustForDistressedDropper;
    /**
     * Calculate rating momentum from the handicapper's Rtg.+/- and the horse's
     * position within its class. Returns -1 to 1.
     *
     * Positive Rtg.+/- means the handicapper raised the rating (horse improving).
     * But a large rise also means more weight, so there's a diminishing return.
     * Negative Rtg.+/- means the handicapper dropped the rating (horse declining),
     * but this also gives a weight relief advantage.
     */
    private calculateRatingMomentum;
    /**
     * Calculate days since last race
     */
    private calculateDaysSinceLastRace;
    /**
     * Calculate fitness score based on days since last race
     * Optimal: 14-35 days
     */
    private calculateFitnessScore;
    /**
     * Calculate draw advantage based on historical bias
     */
    private calculateDrawAdvantage;
    /**
     * Calculate jockey edge compared to field average
     */
    private calculateJockeyEdge;
    /**
     * Calculate trainer recent form
     */
    private calculateTrainerForm;
    /**
     * Calculate surface preference (-1 to 1)
     */
    private calculateSurfacePreference;
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
    private calculateGoingPreference;
    /**
     * Calculate distance preference (-1 to 1)
     */
    private calculateDistancePreference;
    /**
     * Analyze all entries for a race
     */
    analyzeRace(race: Race): HorseAnalysis[];
}
declare const formAnalyzer: FormAnalyzer;
/**
 * Convenience function to analyze a race
 */
declare function analyzeRace(race: Race): HorseAnalysis[];
/**
 * Convenience function to analyze a single horse
 */
declare function analyzeHorse(horse: Horse, race: Race, entry: RaceEntry): HorseAnalysis;

/**
 * Speed Rating Calculator
 *
 * Calculates speed figures for horses based on:
 * - Raw finish times
 * - Class adjustments (higher class = faster times)
 * - Going adjustments (soft ground = slower times)
 * - Weight adjustments
 * - Track/distance par times
 */

declare class SpeedRatingCalculator {
    private readonly baseRating;
    private readonly secondsPerRatingPoint;
    /**
     * Get par time for a race configuration
     */
    getParTime(venue: Venue, surface: TrackSurface, distance: number, raceClass: RaceClass): number | null;
    /**
     * Calculate going adjustment for a race
     */
    calculateGoingAdjustment(going: Going, distance: number): number;
    /**
     * Calculate weight adjustment
     */
    calculateWeightAdjustment(weight: number, distance: number): number;
    /**
     * Calculate speed figure for a single performance
     */
    calculateSpeedFigure(performance: PastPerformance, raceId?: string): SpeedFigure | null;
    /**
     * Calculate speed figures for all of a horse's past performances
     */
    calculateHorseSpeedFigures(horse: Horse, maxRaces?: number): SpeedFigure[];
    /**
     * Get average speed rating for last N races
     */
    getAverageSpeedRating(figures: SpeedFigure[], lastN?: number): number;
    /**
     * Get best speed rating from last N races
     */
    getBestSpeedRating(figures: SpeedFigure[], lastN?: number): number;
    /**
     * Get last speed rating
     */
    getLastSpeedRating(figures: SpeedFigure[]): number;
    /**
     * Calculate projected speed rating for upcoming race
     * Adjusts based on class change, surface change, distance change
     */
    projectSpeedRating(horse: Horse, targetVenue: Venue, targetSurface: TrackSurface, targetDistance: number, targetClass: RaceClass): number;
    /**
     * Analyze speed rating trend
     * Returns positive for improving, negative for declining
     */
    calculateTrend(figures: SpeedFigure[], lastN?: number): number;
}
declare const speedRatingCalculator: SpeedRatingCalculator;
/**
 * Convenience function to calculate speed figure for a performance
 */
declare function calculateSpeedFigure(performance: PastPerformance): SpeedFigure | null;
/**
 * Convenience function to project speed rating
 */
declare function projectSpeedRating(horse: Horse, venue: Venue, surface: TrackSurface, distance: number, raceClass: RaceClass): number;

/**
 * Monte Carlo Race Simulator
 *
 * Simulates horse races thousands of times to generate:
 * - Win probabilities
 * - Place probabilities (Top 3)
 * - Exacta/Quinella probability matrices
 * - Expected finishing positions
 */

interface SimulationConfig {
    /** Number of simulation runs */
    runs: number;
    /** Standard deviation for performance variance */
    performanceStdDev: number;
    /** Minimum probability threshold to report */
    minProbabilityThreshold: number;
}
declare class MonteCarloSimulator {
    private config;
    private formAnalyzer;
    constructor(config?: Partial<SimulationConfig>);
    /**
     * Simulate a race and return probabilities (runs form analysis internally).
     */
    simulateRace(race: Race): {
        results: SimulationResult[];
        exoticProbabilities: ExoticProbabilities;
    };
    /**
     * Simulate using pre-computed form analyses (e.g. after a separate analyzeRace step).
     */
    simulateRaceWithAnalyses(race: Race, analyses: HorseAnalysis[]): {
        results: SimulationResult[];
        exoticProbabilities: ExoticProbabilities;
    };
    /**
     * Simulate a single race run
     * Returns array of horse numbers in finish order
     */
    private simulateSingleRace;
    /**
     * Calculate additional variance based on form consistency
     */
    private calculateFormVariance;
    /**
     * Convert count map to probability map
     */
    private countsToProbs;
    /**
     * Calculate Quinella Place probabilities
     * QP pays if your two horses finish in any two of the top 3 positions
     */
    private calculateQuinellaPlace;
    /**
     * Get top N most likely outcomes for an exotic bet type
     */
    getTopExoticOutcomes(probs: Map<string, number>, n?: number): {
        combination: string;
        probability: number;
    }[];
    /**
     * Calculate fair odds from probability
     */
    probabilityToFairOdds(probability: number): number;
    /**
     * Simulate multiple scenarios with different configurations
     */
    runSensitivityAnalysis(race: Race, stdDevRange?: number[]): Map<number, SimulationResult[]>;
}
declare const defaultSimulator: MonteCarloSimulator;
/**
 * Convenience function to simulate a race
 */
declare function simulateRace(race: Race): {
    results: SimulationResult[];
    exoticProbabilities: ExoticProbabilities;
};
/**
 * Create a custom simulator with specific configuration
 */
declare function createSimulator(config: Partial<SimulationConfig>): MonteCarloSimulator;

declare const MONTE_CARLO_RUNS = 10000;
/** Venue-specific performance variance (matches Strapi / reference CLI tools). */
declare function performanceStdDevForVenue(venue: Venue): number;
declare function createSimulatorForRace(race: Race): MonteCarloSimulator;

/**
 * Utility functions for the horse racing analysis system
 */
/**
 * Convert decimal odds to implied probability
 * @param odds - Decimal odds (e.g., 3.5 means 3.5:1)
 * @returns Implied probability as a decimal (0-1)
 */
declare function oddsToProb(odds: number): number;
/**
 * Convert probability to decimal odds
 * @param prob - Probability as a decimal (0-1)
 * @returns Decimal odds
 */
declare function probToOdds(prob: number): number;
/**
 * Calculate edge percentage
 * @param modelProb - Your estimated probability
 * @param marketProb - Market implied probability
 * @returns Edge as percentage
 */
declare function calculateEdge(modelProb: number, marketProb: number): number;
/**
 * Parse HKJC form string into array of positions
 * @param form - Form string like "1-2-4-3-1-2"
 * @returns Array of finish positions (most recent first)
 */
declare function parseFormString(form: string): number[];
/**
 * Calculate weighted recent form score
 * @param positions - Array of recent finish positions
 * @param fieldSizes - Array of field sizes for each race
 * @returns Weighted form score (higher is better)
 */
declare function calculateFormScore(positions: number[], fieldSizes?: number[]): number;
/**
 * Format currency for display
 */
declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Format percentage for display
 */
declare function formatPercent(value: number, decimals?: number): string;
/**
 * Sleep utility for rate limiting
 */
declare function sleep(ms: number): Promise<void>;
/**
 * Generate a random number with normal distribution
 * Using Box-Muller transform
 */
declare function randomNormal(mean?: number, stdDev?: number): number;
/**
 * Clamp a value between min and max
 */
declare function clamp(value: number, min: number, max: number): number;

export { type BetRecommendation, type BetType, type BettingConfig, type CourseStats, DEFAULT_BETTING_CONFIG, DEFAULT_SCRAPER_CONFIG, type ExoticProbabilities, FormAnalyzer, type Gear, type Going, type Horse, type HorseAnalysis, type Jockey, MONTE_CARLO_RUNS, MonteCarloSimulator, type PastPerformance, type Race, type RaceClass, type RaceEntry, type RaceRecommendation, type RaceResult, type ScraperConfig, type SeasonStats, type SimulationResult, type SpeedFigure, SpeedRatingCalculator, type TrackSurface, type Trainer, type Venue, analyzeHorse, analyzeRace, calculateEdge, calculateFormScore, calculateSpeedFigure, clamp, createSimulator, createSimulatorForRace, defaultSimulator, formAnalyzer, formatCurrency, formatPercent, oddsToProb, parseFormString, performanceStdDevForVenue, probToOdds, projectSpeedRating, randomNormal, simulateRace, sleep, speedRatingCalculator };
