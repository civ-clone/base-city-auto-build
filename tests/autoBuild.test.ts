import {
  anything,
  autoBuild,
  improvementsOnly,
  kindsOf,
  unitsOnly,
} from '../lib/autoBuild';
import {
  autoBuildAtTurnStart,
  autoBuildOnCancelled,
  autoBuildOnComplete,
  autoBuildRules,
} from '../lib/autoBuildRules';
import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BuildItem from '@civ-clone/core-city-build/BuildItem';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Buildable, { IBuildable } from '@civ-clone/core-city-build/Buildable';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import Unit from '@civ-clone/core-unit/Unit';
import { buildCosts } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';

describe('base-city-auto-build', (): void => {
  class Granary extends CityImprovement {}
  class Temple extends CityImprovement {}
  class Warrior extends Unit {}
  // Neither a unit nor an improvement, like a spaceship part.
  class Part extends Buildable {}

  const asBuildable = (Item: unknown): IBuildable => Item as IBuildable;

  // Ranks Warrior 5, Part 4, Temple 2, Granary 1, as civ1-city's own test of these rules did.
  const setUp = () => {
    const ruleRegistry = new RuleRegistry(),
      player = new Player(ruleRegistry),
      city = {
        player: (): Player => player,
        yields: (): [] => [],
      } as unknown as City,
      availableBuildItemsRegistry = new AvailableCityBuildItemsRegistry(),
      cityBuild = new CityBuild(
        city,
        availableBuildItemsRegistry,
        ruleRegistry
      ),
      unavailable = new Set<IBuildable>(),
      priority = (Item: IBuildable, score: number): BuildPriority =>
        new BuildPriority(
          new Criterion(
            (cityBuild: CityBuild, BuildItem: IBuildable): boolean =>
              BuildItem === Item
          ),
          new Effect((): number => score)
        ),
      cityRegistry = {
        getByPlayer: (of: Player): City[] => (of === player ? [city] : []),
      } as unknown as CityRegistry,
      cityBuildRegistry = {
        getByCity: (of: City): CityBuild | null =>
          of === city ? cityBuild : null,
      } as unknown as CityBuildRegistry;

    availableBuildItemsRegistry.register(
      Granary,
      Part,
      Temple,
      asBuildable(Warrior)
    );

    ruleRegistry.register(
      new Build(
        new Effect(
          (city: City, BuildItem: IBuildable): IBuildCriterion =>
            new Criterion((): boolean => !unavailable.has(BuildItem))
        )
      ),
      ...buildCosts([
        [Granary, 40],
        [Part, 20],
        [Temple, 30],
        [asBuildable(Warrior), 10],
      ]),
      priority(asBuildable(Warrior), 5),
      priority(Part, 4),
      priority(Temple, 2),
      priority(Granary, 1)
    );

    return {
      city,
      cityBuild,
      cityBuildRegistry,
      cityRegistry,
      player,
      ruleRegistry,
      unavailable,
    };
  };

  const item = (Item: IBuildable): BuildItem => new BuildItem(Item);

  describe('what a city on Auto may choose', (): void => {
    it('should allow anything with `anything`', (): void => {
      [Granary, Part, asBuildable(Warrior)].forEach(
        (Item) => expect(anything(item(Item))).true
      );
    });

    it('should allow improvements, and nothing else, with `improvementsOnly`', (): void => {
      expect(improvementsOnly(item(Granary))).true;
      expect(improvementsOnly(item(Part))).false;
      expect(improvementsOnly(item(asBuildable(Warrior)))).false;
      // The base class itself is not a kind of improvement, as before the lift.
      expect(improvementsOnly(item(asBuildable(CityImprovement)))).false;
    });

    it('should allow units, and nothing else, with `unitsOnly`', (): void => {
      expect(unitsOnly(item(asBuildable(Warrior)))).true;
      expect(unitsOnly(item(Granary))).false;
      expect(unitsOnly(item(Part))).false;
    });

    it('should allow any of the kinds given with `kindsOf`', (): void => {
      const include = kindsOf(asBuildable(Unit), Part);

      expect(include(item(asBuildable(Warrior)))).true;
      expect(include(item(Granary))).false;
      expect(kindsOf(Buildable)(item(Part))).true;
      expect(kindsOf()(item(Part))).false;
    });
  });

  describe('autoBuild', (): void => {
    it('should start the highest ranked of what `include` allows', (): void => {
      [
        [anything, asBuildable(Warrior)],
        [improvementsOnly, Temple],
        [unitsOnly, asBuildable(Warrior)],
        [kindsOf(asBuildable(CityImprovement)), Temple],
      ].forEach(([include, Expected]) => {
        const { cityBuild, ruleRegistry } = setUp();

        cityBuild.setAuto(true);

        expect(autoBuild(cityBuild, ruleRegistry, include as never)).true;
        expect(cityBuild.building()!.item()).equal(Expected);
      });
    });

    it('should allow anything by default', (): void => {
      const { cityBuild, ruleRegistry } = setUp();

      cityBuild.setAuto(true);
      autoBuild(cityBuild, ruleRegistry);

      expect(cityBuild.building()!.item()).equal(Warrior);
    });

    it('should leave a city that is not on Auto, or is already building something', (): void => {
      const { cityBuild, ruleRegistry } = setUp();

      expect(autoBuild(cityBuild, ruleRegistry, improvementsOnly)).false;
      expect(cityBuild.building()).null;

      cityBuild.setAuto(true);
      cityBuild.build(Granary);

      expect(autoBuild(cityBuild, ruleRegistry, improvementsOnly)).false;
      expect(cityBuild.building()!.item()).equal(Granary);
    });

    it('should start nothing when nothing `include` allows is ranked', (): void => {
      const { cityBuild, ruleRegistry, unavailable } = setUp();

      unavailable.add(Granary);
      unavailable.add(Temple);
      cityBuild.setAuto(true);

      expect(autoBuild(cityBuild, ruleRegistry, improvementsOnly)).false;
      expect(cityBuild.building()).null;
    });
  });

  describe('the rules', (): void => {
    it("should have the ids `<prefix>:…`, the same as civ1-city's, or none without a prefix", (): void => {
      const options = { prefix: 'civ1-city' };

      expect(autoBuildOnComplete({}, options).id()).equal(
        'civ1-city:city/building-complete/auto'
      );
      expect(autoBuildOnCancelled({}, options).id()).equal(
        'civ1-city:city/building-cancelled/auto'
      );
      expect(autoBuildAtTurnStart({}, options).id()).equal(
        'civ1-city:player/turn-start/auto-build'
      );
      expect(autoBuildOnComplete().id()).null;
    });

    it('should give all three, in order, from `autoBuildRules`', (): void => {
      const [complete, cancelled, turnStart] = autoBuildRules(
        {},
        { prefix: 'p' }
      );

      expect(complete).instanceOf(BuildingComplete);
      expect(cancelled).instanceOf(BuildingCancelled);
      expect(turnStart).instanceOf(TurnStart);
      expect([complete, cancelled, turnStart].map((rule) => rule.id())).eql([
        'p:city/building-complete/auto',
        'p:city/building-cancelled/auto',
        'p:player/turn-start/auto-build',
      ]);
    });

    it('should start what a city on Auto needs most once its build is complete, of what `include` allows', (): void => {
      const { cityBuild, ruleRegistry } = setUp();

      ruleRegistry.register(
        autoBuildOnComplete({ ruleRegistry }, { include: improvementsOnly })
      );

      cityBuild.setAuto(true);
      cityBuild.build(Granary);
      cityBuild.add(cityBuild.cost());
      cityBuild.check();

      expect(cityBuild.building()!.item()).equal(Temple);
    });

    it('should leave a city that is not on Auto for its player to choose', (): void => {
      const { cityBuild, ruleRegistry } = setUp();

      ruleRegistry.register(
        ...autoBuildRules({ ruleRegistry }, { include: improvementsOnly })
      );

      cityBuild.build(Granary);
      cityBuild.add(cityBuild.cost());
      cityBuild.check();

      expect(cityBuild.building()).null;
    });

    it('should choose again when a city on Auto can no longer build what it was building', (): void => {
      const { cityBuild, ruleRegistry, unavailable } = setUp();

      ruleRegistry.register(
        autoBuildOnCancelled({ ruleRegistry }, { include: improvementsOnly })
      );

      cityBuild.setAuto(true);
      cityBuild.build(Temple);
      unavailable.add(Temple);
      cityBuild.revalidate();

      expect(cityBuild.building()!.item()).equal(Granary);
    });

    it('should choose at the start of a turn in a city on Auto that had nothing it would choose', (): void => {
      const {
        cityBuild,
        cityBuildRegistry,
        cityRegistry,
        player,
        ruleRegistry,
        unavailable,
      } = setUp();

      ruleRegistry.register(
        autoBuildAtTurnStart(
          { cityBuildRegistry, cityRegistry, ruleRegistry },
          { include: improvementsOnly }
        )
      );

      unavailable.add(Granary);
      unavailable.add(Temple);
      cityBuild.setAuto(true);

      ruleRegistry.process(TurnStart, player);

      expect(cityBuild.building()).null;

      unavailable.delete(Temple);

      ruleRegistry.process(TurnStart, player);

      expect(cityBuild.building()!.item()).equal(Temple);
    });

    it('should choose a unit for a city on Auto that may build only units', (): void => {
      const { cityBuild, ruleRegistry } = setUp();

      ruleRegistry.register(
        autoBuildOnComplete({ ruleRegistry }, { include: unitsOnly })
      );

      cityBuild.setAuto(true);
      cityBuild.build(Granary);
      cityBuild.add(cityBuild.cost());
      cityBuild.check();

      expect(cityBuild.building()!.item()).equal(Warrior);
    });
  });
});
