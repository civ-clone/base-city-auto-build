# base-city-auto-build

A city on Auto choosing its own next build: what it may choose, and the rules that make it choose when its build is
finished, when its build can no longer be built, and at the start of each turn while it has nothing to build. A
library: nothing registers on import, and a game that registers none of it has no Auto.

What a city needs most is not decided here. core-city-build's `lib/rankBuildItems` ranks the items the city can build
by the ruleset's `BuildPriority` rules (the same ones a computer player can use), so a ruleset's priorities are its
`BuildPriority` rules, for example from base-city-improvement-rules' `buildPriorityRules` table and base-wonder's
`buildPriority`. This package only says when a city on Auto chooses, and from what.

## API

Deep-import the modules; there is no index.

- `lib/autoBuild`:
  - `autoBuild(cityBuild, ruleRegistry, include = anything)`: if the city is on Auto (`CityBuild#auto()`) and building
    nothing, starts the highest ranked item `include` allows. Returns whether it started anything; with nothing ranked,
    the city is left for its player to choose. It wraps core-city-build's `lib/autoBuild`.
  - `AutoBuildInclude`, `(buildItem) => boolean`, and the ones provided:
    - `anything`;
    - `improvementsOnly`: city improvements, Wonders included, never units or anything else such as spaceship parts
      (what civ1-city uses);
    - `unitsOnly`;
    - `kindsOf(...Types)`: a kind (a subclass) of any of `Types`.

    A ruleset whose players can set a city to Auto for units only, or improvements only, keeps that per city and
    passes an `include` that reads it.
- `lib/autoBuildRules`, each taking `({ cityBuildRegistry?, cityRegistry?, ruleRegistry? }, { include?, prefix? })`,
  with the game's registries by default and `include` `anything` by default:
  - `autoBuildOnComplete`: a `BuildingComplete` rule, id `<prefix>:city/building-complete/auto`. A ruleset that also
    announces the completion registers its own rule for that before this one.
  - `autoBuildOnCancelled`: a `BuildingCancelled` rule, id `<prefix>:city/building-cancelled/auto`, for a build that
    can no longer be built.
  - `autoBuildAtTurnStart`: a `TurnStart` rule, id `<prefix>:player/turn-start/auto-build`, at the default priority:
    each of the player's cities on Auto that is building nothing tries again, such as one that had nothing it would
    choose.
  - `autoBuildRules`: all three, in that order.

  Without a `prefix` the rules have no id.

## Example

```ts
import autoBuildRules from '@civ-clone/base-city-auto-build/lib/autoBuildRules';
import { improvementsOnly } from '@civ-clone/base-city-auto-build/lib/autoBuild';

game.rules.register(
  ...autoBuildRules(
    {
      cityBuildRegistry: game.cityBuilds,
      cityRegistry: game.cities,
      ruleRegistry: game.rules,
    },
    { include: improvementsOnly, prefix: 'my-ruleset' }
  )
);
```
