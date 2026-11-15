"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoBuildRules = exports.autoBuildAtTurnStart = exports.autoBuildOnCancelled = exports.autoBuildOnComplete = void 0;
const autoBuild_1 = require("./autoBuild");
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const BulidingCancelled_1 = require("@civ-clone/core-city-build/Rules/BulidingCancelled");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const withId = (prefix, path) => prefix === undefined ? [] : [`${prefix}:${path}`];
/**
 * A `BuildingComplete` rule (id `<prefix>:city/building-complete/auto`): a city on Auto goes straight on to what it needs
 *  next (civ-clone/web-renderer#194). A ruleset that also announces the completion registers its own rule for that
 *  before this one.
 */
const autoBuildOnComplete = ({ ruleRegistry = RuleRegistry_1.instance } = {}, { include = autoBuild_1.anything, prefix } = {}) => new BulidingComplete_1.default(...withId(prefix, 'city/building-complete/auto'), new Effect_1.default((cityBuild) => {
    (0, autoBuild_1.autoBuild)(cityBuild, ruleRegistry, include);
}));
exports.autoBuildOnComplete = autoBuildOnComplete;
/**
 * A `BuildingCancelled` rule (id `<prefix>:city/building-cancelled/auto`): a city on Auto whose build can no longer be
 *  built chooses again (civ-clone/web-renderer#194).
 */
const autoBuildOnCancelled = ({ ruleRegistry = RuleRegistry_1.instance } = {}, { include = autoBuild_1.anything, prefix } = {}) => new BulidingCancelled_1.default(...withId(prefix, 'city/building-cancelled/auto'), new Effect_1.default((cityBuild) => {
    (0, autoBuild_1.autoBuild)(cityBuild, ruleRegistry, include);
}));
exports.autoBuildOnCancelled = autoBuildOnCancelled;
/**
 * A `TurnStart` rule (id `<prefix>:player/turn-start/auto-build`): each of the player's cities on Auto that is building
 *  nothing tries again, such as one that had nothing it would choose because its player knew nothing that unlocks one
 *  (civ-clone/web-renderer#194). It has the default priority, so it runs after a ruleset's `High` rule that processes
 *  the cities' yields, once production has finished what it could.
 */
const autoBuildAtTurnStart = ({ cityBuildRegistry = CityBuildRegistry_1.instance, cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, } = {}, { include = autoBuild_1.anything, prefix } = {}) => new TurnStart_1.default(...withId(prefix, 'player/turn-start/auto-build'), new Effect_1.default((player) => cityRegistry.getByPlayer(player).forEach((city) => {
    (0, autoBuild_1.autoBuild)(cityBuildRegistry.getByCity(city), ruleRegistry, include);
})));
exports.autoBuildAtTurnStart = autoBuildAtTurnStart;
/** All three: `autoBuildOnComplete`, `autoBuildOnCancelled` and `autoBuildAtTurnStart`, in that order. */
const autoBuildRules = (dependencies = {}, options = {}) => [
    (0, exports.autoBuildOnComplete)(dependencies, options),
    (0, exports.autoBuildOnCancelled)(dependencies, options),
    (0, exports.autoBuildAtTurnStart)(dependencies, options),
];
exports.autoBuildRules = autoBuildRules;
exports.default = exports.autoBuildRules;
//# sourceMappingURL=autoBuildRules.js.map