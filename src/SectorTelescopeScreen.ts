import { Button } from "./Button";
import { OWScreen } from "./Screen";
import { Sector } from "./Sector";
import { Telescope, SignalSource, FrequencyButton } from "./Telescope";
import { gameManager } from "./app";

export class SectorTelescopeScreen extends OWScreen
{
	_sector: Sector;
	_telescope: Telescope;
	_exitButton: Button;
	_zoomOutButton: Button;
	_nextFrequency: Button;
	_previousFrequency: Button;

	_signalSources: SignalSource[];

	constructor(sector: Sector, telescope: Telescope)
	{
		super();
		this._sector = sector;
		this._telescope = telescope;
		this._signalSources = sector.getSectorSignalSources();
		
		this.addButton(this._nextFrequency = new FrequencyButton(true));
		this.addButton(this._previousFrequency = new FrequencyButton(false));

		this.addButtonToToolbar(this._zoomOutButton = new Button("缩小", 0, 0, 150, 50));
		this.addButtonToToolbar(this._exitButton = new Button("退出", 0, 0, 150, 50));
	}

	onEnter(): void
	{
		noCursor();
	}

	onExit(): void
	{
		cursor(HAND);
	}

	update(): void
	{
		// don't want to update node buttons
		//_sector.update();
		this._telescope.update(this._signalSources);
	}

	renderBackground(): void
	{
		super.renderBackground();
		this._sector.renderBackground();
	}

	render(): void
	{
		this._sector.render();
		this._telescope.render();
	}

	onButtonUp(button: Button): void
	{
		if (button == this._exitButton)
		{
			gameManager.popScreen();
			gameManager.popScreen();
		}
		else if (button == this._zoomOutButton)
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