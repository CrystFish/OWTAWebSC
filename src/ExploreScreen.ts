import { Button } from "./Button";
import { DatabaseObserver } from "./DatabaseScreen";
import { ExploreData } from "./ExploreData";
import { OWNode } from "./Node";
import { Clue } from "./PlayerData";
import { OWScreen } from "./Screen";
import { feed, timeLoop, gameManager, locator, mediumFontData } from "./app";

export class ExploreScreen extends OWScreen implements DatabaseObserver
{
	static BOX_WIDTH: number = 700;
	static BOX_HEIGHT: number = 400;
	_exploreData: ExploreData;

	_databaseButton: Button;
	_backButton: Button;
	_waitButton: Button;

	constructor(location: OWNode)
	{
		super();
		this._exploreData = location.getExploreData();
		this.overlay = true; // continue to render BG

		this.addButtonToToolbar(this._databaseButton = new Button("查看数据库", 0, 0, 150, 50));
		this.addButtonToToolbar(this._waitButton  = new Button("等待 [ 1分钟 ]", 0, 0, 150, 50));
		this.addButtonToToolbar(this._backButton = new Button("继续", 0, 0, 150, 50));

		this._exploreData.parseJSON();
	}

	update(): void{}

	renderBackground(): void {}

	render(): void
	{
		push();
		translate(width/2 - ExploreScreen.BOX_WIDTH/2, height/2 - ExploreScreen.BOX_HEIGHT/2);

			stroke(0, 0, 100);
			fill(0, 0, 0);
			rectMode(CORNER);
			rect(0, 0, ExploreScreen.BOX_WIDTH, ExploreScreen.BOX_HEIGHT);

			fill(0, 0, 100);

		    textFont(mediumFontData);
		    textSize(18);
			textAlign(LEFT, TOP);
			text(this._exploreData.getExploreText(), 10, 10, ExploreScreen.BOX_WIDTH - 20, ExploreScreen.BOX_HEIGHT - 10);

		pop();

		feed.render();
		timeLoop.renderTimer();
	}

	onEnter(): void {}

	onExit(): void {}

	onInvokeClue(clue: Clue): void
	{
		// try to invoke it on the node first
		if (this._exploreData.canClueBeInvoked(clue.id))
		{
			// force-quit the database screen
			gameManager.popScreen();
			this._exploreData.invokeClue(clue.id);
			this._exploreData.explore();
		}
		// next try the whole sector
		else if (locator.player.currentSector != null && locator.player.currentSector.canClueBeInvoked(clue))
		{
			gameManager.popScreen();
			locator.player.currentSector.invokeClue(clue);
		}
		else
		{
			feed.publish("那个现在还不能帮助到你", true);
		}
	}

	onButtonUp(button: Button): void
	{
		if (button == this._databaseButton)
	    {
	      gameManager.pushScreen(gameManager.databaseScreen);
	      gameManager.databaseScreen.setObserver(this);
	    }
	    else if (button == this._backButton)
	    {
	    	gameManager.popScreen();
	    }
	    else if (button == this._waitButton)
	    {
	    	timeLoop.waitFor(1);
	    	this._exploreData.explore();
	    }
	}

	onButtonEnterHover(button: Button): void{}
	onButtonExitHover(button: Button): void{}
}