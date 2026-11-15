import { AutoBuildInclude } from './autoBuild';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
export interface AutoBuildDependencies {
  cityBuildRegistry?: CityBuildRegistry;
  cityRegistry?: CityRegistry;
  ruleRegistry?: RuleRegistry;
}
export interface AutoBuildOptions {
  /** What a city on Auto may choose (`lib/autoBuild`); anything it can build by default. */
  include?: AutoBuildInclude;
  /** The rules' ids start `<prefix>:`; with none, the rules have no id. */
  prefix?: string;
}
/**
 * A `BuildingComplete` rule (id `<prefix>:city/building-complete/auto`): a city on Auto goes straight on to what it needs
 *  next (civ-clone/web-renderer#194). A ruleset that also announces the completion registers its own rule for that
 *  before this one.
 */
export declare const autoBuildOnComplete: (
  { ruleRegistry }?: AutoBuildDependencies,
  { include, prefix }?: AutoBuildOptions
) => BuildingComplete;
/**
 * A `BuildingCancelled` rule (id `<prefix>:city/building-cancelled/auto`): a city on Auto whose build can no longer be
 *  built chooses again (civ-clone/web-renderer#194).
 */
export declare const autoBuildOnCancelled: (
  { ruleRegistry }?: AutoBuildDependencies,
  { include, prefix }?: AutoBuildOptions
) => BuildingCancelled;
/**
 * A `TurnStart` rule (id `<prefix>:player/turn-start/auto-build`): each of the player's cities on Auto that is building
 *  nothing tries again, such as one that had nothing it would choose because its player knew nothing that unlocks one
 *  (civ-clone/web-renderer#194). It has the default priority, so it runs after a ruleset's `High` rule that processes
 *  the cities' yields, once production has finished what it could.
 */
export declare const autoBuildAtTurnStart: (
  { cityBuildRegistry, cityRegistry, ruleRegistry }?: AutoBuildDependencies,
  { include, prefix }?: AutoBuildOptions
) => TurnStart;
/** All three: `autoBuildOnComplete`, `autoBuildOnCancelled` and `autoBuildAtTurnStart`, in that order. */
export declare const autoBuildRules: (
  dependencies?: AutoBuildDependencies,
  options?: AutoBuildOptions
) => [BuildingComplete, BuildingCancelled, TurnStart];
export default autoBuildRules;
