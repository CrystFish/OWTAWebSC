import { DatabaseScreen } from "./DatabaseScreen";
import { SectorName } from "./Enums";
import { DeathByAnglerfishScreen, DiveAttemptScreen, FollowTheVineScreen, AncientVesselScreen, TimeLoopCentralScreen, EyeOfTheUniverseScreen, BrambleOutskirtsScreen } from "./EventScreen";
import { GlobalObserver, Message } from "./GlobalMessenger";
import { Locator } from "./Locator";
import { ScreenManager } from "./ScreenManager";
import { Sector } from "./Sector";
import { SectorScreen } from "./SectorScreen";
import { SectorTelescopeScreen } from "./SectorTelescopeScreen";
import { SolarSystem } from "./SolarSystem";
import { SolarSystemMapScreen, SolarSystemTelescopeScreen } from "./SolarSystemScreen";
import { FlashbackScreen, GameOverScreen } from "./SupernovaScreen";
import { Telescope } from "./Telescope";
import { TitleScreen } from "./TitleScreen";
import { messenger, feed, timeLoop, playerData, locator, resetLocator } from "./app";

export class GameManager extends ScreenManager implements GlobalObserver
{
  // game screens
  titleScreen: TitleScreen;
  databaseScreen: DatabaseScreen;
  solarSystemMapScreen: SolarSystemMapScreen;
  
  // game objects
  _solarSystem: SolarSystem;
  _telescope: Telescope;

  _flashbackTriggered: boolean = false;
  
  newGame(): void
  {
    this.setupSolarSystem();

    this.titleScreen = new TitleScreen();
    this.databaseScreen = new DatabaseScreen();
    
    this.pushScreen(this.titleScreen);
  }

  resetTimeLoop(): void
  {
    this._flashbackTriggered = false;
    this._screenStack.length = 0;
    this.setupSolarSystem();
    this.loadSector(SectorName.TIMBER_HEARTH);
  }

  setupSolarSystem(): void
  {
    messenger.removeAllObservers();
    messenger.addObserver(this);

    feed.init();
    timeLoop.init();
    playerData.init();

    this._telescope = new Telescope();

    this._solarSystem = new SolarSystem();
    this._solarSystem.timberHearth.addActor(this._solarSystem.player, "村庄");

    this.solarSystemMapScreen = new SolarSystemMapScreen(this._solarSystem);

    if (playerData.knowsLaunchCodes())
    {
      messenger.sendMessage("spawn ship");
    }

    resetLocator();
  }

  // runs after everything else updates
  lateUpdate(): void
  {
    // check if the sun explodes (this check has to be last to override all other screens)
    timeLoop.lateUpdate();

    // check if the player died
    if (playerData.isPlayerDead() && !this._flashbackTriggered)
    {
      this._flashbackTriggered = true;

      if (timeLoop.getEnabled())
      {
        this.swapScreen(new FlashbackScreen());
      }
      else
      {
        this.swapScreen(new GameOverScreen());
      }
    }
  }

  onReceiveGlobalMessage(message: Message): void
  {
    // TRIGGERED FROM SECTORSCREEN (NOT EXPLORE SCREEN)
    if (message.id === "death by anglerfish")
    {
      this.pushScreen(new DeathByAnglerfishScreen());
    }
    else if (message.id === "dive attempt")
    {
      this.pushScreen(new DiveAttemptScreen());
    }
    // TRIGGERED FROM EVENT SCREEN
    else if (message.id === "follow the vine")
    {
      this.swapScreen(new FollowTheVineScreen());
    }
    // TRIGGERED FROM EXPLORE DATA
    else if (message.id === "explore ancient vessel")
    {
      this.swapScreen(new AncientVesselScreen());
    }
    else if (message.id === "time loop central")
    {
      this.swapScreen(new TimeLoopCentralScreen());
    }
    else if (message.id === "older than the universe")
    {
      this.swapScreen(new EyeOfTheUniverseScreen());
    }
    else if (message.id === "explore bramble outskirts")
    {
      this.swapScreen(new BrambleOutskirtsScreen());
    }
  }

  loadTelescopeView(): void
  {
    this.pushScreen(new SolarSystemTelescopeScreen(this._solarSystem, this._telescope));

    // if (_solarSystem.player.currentSector != null)
    // {
    //   loadSectorTelescopeView(_solarSystem.player.currentSector);
    // }
  }

  loadSectorTelescopeView(sector: Sector): void
  {
    this.pushScreen(new SectorTelescopeScreen(sector, this._telescope));
  }
  
  loadSolarSystemMap(): void
  {
    this.swapScreen(this.solarSystemMapScreen);
  }
  
  loadSector(sectorName: SectorName): void
  loadSector(sector: Sector): void
  loadSector(sectorOrName: Sector | SectorName): void
  {
    const sector = sectorOrName instanceof Sector ? sectorOrName : this._solarSystem.getSectorByName(sectorOrName)
    this.swapScreen(new SectorScreen(sector, this._solarSystem.player, this._solarSystem.ship));
  }
}