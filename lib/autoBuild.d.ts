import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
/** Which of the items a city can build a city on Auto may choose by itself. */
export type AutoBuildInclude = (buildItem: BuildItem) => boolean;
/** Anything the city can build. */
export declare const anything: AutoBuildInclude;
/** Only items that are a kind of one of `Types` (a subclass, not the class itself). */
export declare const kindsOf: (...Types: Buildable[]) => AutoBuildInclude;
/**
 * City improvements only, Wonders included (they are improvements too): never units, or anything else a city can build,
 *  such as spaceship parts (civ-clone/web-renderer#194).
 */
export declare const improvementsOnly: AutoBuildInclude;
/** Units only. */
export declare const unitsOnly: AutoBuildInclude;
/**
 * Starts what a city on Auto that is building nothing needs most (core-city-build's `rankBuildItems`, from the ruleset's
 *  `BuildPriority` rules), of what `include` allows. Returns whether it started anything: with nothing ranked, the city
 *  is left for its player to choose.
 */
export declare const autoBuild: (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry,
  include?: AutoBuildInclude
) => boolean;
export default autoBuild;
