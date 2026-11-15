import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import { autoBuild as autoBuildCity } from '@civ-clone/core-city-build/lib/autoBuild';

/** Which of the items a city can build a city on Auto may choose by itself. */
export type AutoBuildInclude = (buildItem: BuildItem) => boolean;

/** Anything the city can build. */
export const anything: AutoBuildInclude = (): boolean => true;

/** Only items that are a kind of one of `Types` (a subclass, not the class itself). */
export const kindsOf =
  (...Types: Buildable[]): AutoBuildInclude =>
  (buildItem: BuildItem): boolean =>
    Types.some((Type: Buildable): boolean =>
      Object.prototype.isPrototypeOf.call(Type, buildItem.item())
    );

/**
 * City improvements only, Wonders included (they are improvements too): never units, or anything else a city can build,
 *  such as spaceship parts (civ-clone/web-renderer#194).
 */
export const improvementsOnly: AutoBuildInclude = (
  buildItem: BuildItem
): boolean =>
  Object.prototype.isPrototypeOf.call(CityImprovement, buildItem.item());

/** Units only. */
export const unitsOnly: AutoBuildInclude = kindsOf(
  Unit as unknown as Buildable
);

/**
 * Starts what a city on Auto that is building nothing needs most (core-city-build's `rankBuildItems`, from the ruleset's
 *  `BuildPriority` rules), of what `include` allows. Returns whether it started anything: with nothing ranked, the city
 *  is left for its player to choose.
 */
export const autoBuild = (
  cityBuild: CityBuild,
  ruleRegistry: RuleRegistry,
  include: AutoBuildInclude = anything
): boolean => autoBuildCity(cityBuild, ruleRegistry, include);

export default autoBuild;
