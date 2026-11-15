"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoBuild = exports.unitsOnly = exports.improvementsOnly = exports.kindsOf = exports.anything = void 0;
const CityImprovement_1 = require("@civ-clone/core-city-improvement/CityImprovement");
const Unit_1 = require("@civ-clone/core-unit/Unit");
const autoBuild_1 = require("@civ-clone/core-city-build/lib/autoBuild");
/** Anything the city can build. */
const anything = () => true;
exports.anything = anything;
/** Only items that are a kind of one of `Types` (a subclass, not the class itself). */
const kindsOf = (...Types) => (buildItem) => Types.some((Type) => Object.prototype.isPrototypeOf.call(Type, buildItem.item()));
exports.kindsOf = kindsOf;
/**
 * City improvements only, Wonders included (they are improvements too): never units, or anything else a city can build,
 *  such as spaceship parts (civ-clone/web-renderer#194).
 */
const improvementsOnly = (buildItem) => Object.prototype.isPrototypeOf.call(CityImprovement_1.default, buildItem.item());
exports.improvementsOnly = improvementsOnly;
/** Units only. */
exports.unitsOnly = (0, exports.kindsOf)(Unit_1.default);
/**
 * Starts what a city on Auto that is building nothing needs most (core-city-build's `rankBuildItems`, from the ruleset's
 *  `BuildPriority` rules), of what `include` allows. Returns whether it started anything: with nothing ranked, the city
 *  is left for its player to choose.
 */
const autoBuild = (cityBuild, ruleRegistry, include = exports.anything) => (0, autoBuild_1.autoBuild)(cityBuild, ruleRegistry, include);
exports.autoBuild = autoBuild;
exports.default = exports.autoBuild;
//# sourceMappingURL=autoBuild.js.map