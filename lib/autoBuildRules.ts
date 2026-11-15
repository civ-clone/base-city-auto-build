import { AutoBuildInclude, anything, autoBuild } from './autoBuild';
import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
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

const withId = (prefix: string | undefined, path: string): string[] =>
  prefix === undefined ? [] : [`${prefix}:${path}`];

/**
 * A `BuildingComplete` rule (id `<prefix>:city/building-complete/auto`): a city on Auto goes straight on to what it needs
 *  next (civ-clone/web-renderer#194). A ruleset that also announces the completion registers its own rule for that
 *  before this one.
 */
export const autoBuildOnComplete = (
  { ruleRegistry = ruleRegistryInstance }: AutoBuildDependencies = {},
  { include = anything, prefix }: AutoBuildOptions = {}
): BuildingComplete =>
  new BuildingComplete(
    ...withId(prefix, 'city/building-complete/auto'),
    new Effect((cityBuild: CityBuild): void => {
      autoBuild(cityBuild, ruleRegistry, include);
    })
  );

/**
 * A `BuildingCancelled` rule (id `<prefix>:city/building-cancelled/auto`): a city on Auto whose build can no longer be
 *  built chooses again (civ-clone/web-renderer#194).
 */
export const autoBuildOnCancelled = (
  { ruleRegistry = ruleRegistryInstance }: AutoBuildDependencies = {},
  { include = anything, prefix }: AutoBuildOptions = {}
): BuildingCancelled =>
  new BuildingCancelled(
    ...withId(prefix, 'city/building-cancelled/auto'),
    new Effect((cityBuild: CityBuild): void => {
      autoBuild(cityBuild, ruleRegistry, include);
    })
  );

/**
 * A `TurnStart` rule (id `<prefix>:player/turn-start/auto-build`): each of the player's cities on Auto that is building
 *  nothing tries again, such as one that had nothing it would choose because its player knew nothing that unlocks one
 *  (civ-clone/web-renderer#194). It has the default priority, so it runs after a ruleset's `High` rule that processes
 *  the cities' yields, once production has finished what it could.
 */
export const autoBuildAtTurnStart = (
  {
    cityBuildRegistry = cityBuildRegistryInstance,
    cityRegistry = cityRegistryInstance,
    ruleRegistry = ruleRegistryInstance,
  }: AutoBuildDependencies = {},
  { include = anything, prefix }: AutoBuildOptions = {}
): TurnStart =>
  new TurnStart(
    ...withId(prefix, 'player/turn-start/auto-build'),
    new Effect((player: Player): void =>
      cityRegistry.getByPlayer(player).forEach((city: City): void => {
        autoBuild(cityBuildRegistry.getByCity(city), ruleRegistry, include);
      })
    )
  );

/** All three: `autoBuildOnComplete`, `autoBuildOnCancelled` and `autoBuildAtTurnStart`, in that order. */
export const autoBuildRules = (
  dependencies: AutoBuildDependencies = {},
  options: AutoBuildOptions = {}
): [BuildingComplete, BuildingCancelled, TurnStart] => [
  autoBuildOnComplete(dependencies, options),
  autoBuildOnCancelled(dependencies, options),
  autoBuildAtTurnStart(dependencies, options),
];

export default autoBuildRules;
