import { Button } from "./Button";
import { Actor } from "./Entity";
import { OWScreen } from "./Screen";
import { Sector } from "./Sector";
import { SectorButton, QuantumMoonButton, HourglassTwinsButton, TimberHearthButton, BrittleHollowButton, GiantsDeepButton, DarkBrambleButton, CometButton } from "./SectorButtons";
import { SolarSystem } from "./SolarSystem";
import { Telescope, SignalSource, FrequencyButton } from "./Telescope";
import { Vector2 } from "./Vector2";
import { gameManager, feed, timeLoop } from "./app";

export class SolarSystemScreen extends OWScreen
{
  _player: Actor;
  _ship: Actor;
  _solarSystem: SolarSystem;
    
  _cometButton: SectorButton;
  _hourglassButton_left: SectorButton;
  _hourglassButton_right: SectorButton;
  _timberButton: SectorButton;
  _brittleButton: SectorButton;
  _giantsButton: SectorButton;
  _darkButton: SectorButton;
  _quantumButton: QuantumMoonButton;

  _focusSectorButton: SectorButton;

  _sectorButtons: SectorButton[];
  
  constructor(solarSystem: SolarSystem)
  {
    super();
    
    this._solarSystem = solarSystem;
    this._player = solarSystem.player;
    this._ship = solarSystem.ship;

    this._sectorButtons = new Array<SectorButton>();
    const buttonHeight: number = height / 2;

    this._sectorButtons.push(this._hourglassButton_left = new HourglassTwinsButton(170, buttonHeight, false, this._solarSystem.rockyTwin));
    this._sectorButtons.push(this._hourglassButton_right = new HourglassTwinsButton(170, buttonHeight, true, this._solarSystem.sandyTwin));
    this._sectorButtons.push(this._timberButton = new TimberHearthButton(300, buttonHeight, this._solarSystem.timberHearth));
    this._sectorButtons.push(this._brittleButton = new BrittleHollowButton(420, buttonHeight, this._solarSystem.brittleHollow));
    this._sectorButtons.push(this._giantsButton = new GiantsDeepButton(580, buttonHeight, this._solarSystem.giantsDeep));
    this._sectorButtons.push(this._darkButton = new DarkBrambleButton(810, buttonHeight, this._solarSystem.darkBramble));
    this._sectorButtons.push(this._cometButton = new CometButton(600, buttonHeight + 200, this._solarSystem.comet));

    const targets: SectorButton[] = [this._hourglassButton_right, this._timberButton, this._brittleButton, this._giantsButton];
    this._sectorButtons.push(this._quantumButton = new QuantumMoonButton(targets, this._solarSystem.quantumMoon));

    for (let i: number = 0; i < this._sectorButtons.length; i++)
    {
      this.addButton(this._sectorButtons[i]);
    }
  }

  onEnter(): void
  {
    this._quantumButton.collapse();
  }

  update(): void {}
  
  render(): void
  {
    // draw sun
    stroke(40, 100, 100);
    fill(0, 0, 0);
    //fill(20, 100, 100);
    ellipse(-430, height/2, 1000, 1000);

    if (this._ship.currentSector == null)
    {
      this._ship.render();
    }
    if (this._player.currentSector == null)
    {
      this._player.render();
    }
  }

  onButtonEnterHover(button: Button): void
  {
    if (this._sectorButtons.includes(button as SectorButton))
    {
      this._focusSectorButton = button as SectorButton;
    }
  }

  onButtonExitHover(button: Button): void
  {
    if (button === this._focusSectorButton)
    {
      this._focusSectorButton = null;
    }
  }
  
  onButtonUp(button: Button): void
  { 
    /** SECTOR SELECTION **/
    if (this._sectorButtons.includes(button as SectorButton))
    {
      this.selectSector((button as SectorButton).getSector());
    }
  }
  
  selectSector(selectedSector: Sector): void {}

  getSectorScreenPosition(sector: Sector): Vector2
  {
    for (let i: number = 0; i < this._sectorButtons.length; i++)
    {
      if (this._sectorButtons[i].getSector() == sector)
      {
        return this._sectorButtons[i].screenPosition;
      }
    }

    return null;
  }
}

export class SolarSystemTelescopeScreen extends SolarSystemScreen
{
  _telescope: Telescope;
  _exitButton: Button;
  _nextFrequency: Button;
  _previousFrequency: Button;

  _signalSources: SignalSource[];

  constructor(solarSystem: SolarSystem, telescope: Telescope)
  {
    super(solarSystem);
    
    this.addButton(this._nextFrequency = new FrequencyButton(true));
    this.addButton(this._previousFrequency = new FrequencyButton(false));

    this.addButtonToToolbar(this._exitButton = new Button("退出", 0, 0, 150, 50));

    this._telescope = telescope;
  }

  onEnter(): void
  {
    super.onEnter();
    noCursor();

    // must do this after quantum moon collapses
    this._signalSources = new Array<SignalSource>();
    this._signalSources.push(new SignalSource(this._cometButton.screenPosition, this._cometButton.getSector()));
    this._signalSources.push(new SignalSource(this._hourglassButton_left.screenPosition, this._hourglassButton_left.getSector()));
    this._signalSources.push(new SignalSource(this._timberButton.screenPosition, this._timberButton.getSector()));
    this._signalSources.push(new SignalSource(this._brittleButton.screenPosition, this._brittleButton.getSector()));
    this._signalSources.push(new SignalSource(this._giantsButton.screenPosition, this._giantsButton.getSector()));
    this._signalSources.push(new SignalSource(this._darkButton.screenPosition, this._darkButton.getSector()));
    this._signalSources.push(new SignalSource(this._quantumButton.screenPosition, this._quantumButton.getSector()));
  }

  onExit(): void
  {
    cursor(HAND);
  }

  update(): void
  {
    super.update();
    this._telescope.update(this._signalSources);
  }

  render(): void
  {
    super.render();
    this._telescope.render();

    if (this._focusSectorButton != null)
    {
      this._focusSectorButton.drawName();
    }

    if (this._focusSectorButton != null)
    {
      this._focusSectorButton.drawZoomPrompt();
    }
  }

  selectSector(selectedSector: Sector): void
  {
    gameManager.loadSectorTelescopeView(selectedSector);
  }

  onButtonUp(button: Button): void
  {
    super.onButtonUp(button);

    if (button == this._exitButton)
    {
      gameManager.popScreen();
    }
    else if (button == this._nextFrequency)
    {
      this._telescope.nextFrequency();
    }
    else if (button == this._previousFrequency)
    {
      this._telescope.previousFrequency();
    }
  }
}

export class SolarSystemMapScreen extends SolarSystemScreen
{
  _databaseButton: Button;
  _telescopeButton: Button;

  constructor(solarSystem: SolarSystem)
  {
    super(solarSystem);
    this.addButtonToToolbar(this._databaseButton = new Button("查看数据库", 0, 0, 150, 50));
    this.addButtonToToolbar(this._telescopeButton = new Button("扫描信号", 0, 0, 150, 50));
  }

  render(): void
  {
    super.render();

    if (this._focusSectorButton != null)
    {
      this._focusSectorButton.drawName();
    }

    feed.render();
    timeLoop.renderTimer();
  }

  onEnter(): void
  {
    super.onEnter();
    this.setActorPosition(this._player);
    this.setActorPosition(this._ship);
  }

  setActorPosition(actor: Actor): void
  {
    const idlePos: Vector2 = new Vector2(200, height - 200);

    // set player position
    if (actor.lastSector != null)
    {
      actor.setScreenPosition(this.getSectorScreenPosition(actor.lastSector));
    }
    else
    {
      actor.setScreenPosition(idlePos);
    }

    actor.moveToScreenPosition(idlePos);
    actor.lastSector = null;
  }

  update(): void
  {
    this._player.update();
    this._ship.update();
  }

  onButtonUp(button: Button): void
  {
    /** OPEN DATABASE **/
    if (button == this._databaseButton)
    {
      gameManager.pushScreen(gameManager.databaseScreen);
    }
    else if (button == this._telescopeButton)
    {
      gameManager.loadTelescopeView();
    }

    super.onButtonUp(button);
  }

  selectSector(selectedSector: Sector): void
  {
    const nextSector: Sector = selectedSector;
    
    // check if the player is already in a Sector...if not, fly to that Sector
    if (this._solarSystem.ship.currentSector == null)
    {
      nextSector.addActor(this._solarSystem.ship);
    }
    
    // check if the ship is already in a Sector...if not fly to that Sector
    if (this._solarSystem.player.currentSector == null)
    {
      nextSector.addActor(this._solarSystem.player);
    }

    gameManager.loadSector(nextSector);
    nextSector.onArrival();
  }
}