import { Color } from "p5";
import { Button } from "./Button";
import { Entity } from "./Entity";
import { Curiosity } from "./Enums";
import { Clue } from "./PlayerData";
import { OWScreen } from "./Screen";
import { playerData, feed, gameManager, mediumFontData } from "./app";

export interface DatabaseObserver
{
  onInvokeClue(clue: Clue): void;
}

export class DatabaseScreen extends OWScreen implements ClueButtonObserver
{
  _clueRoot: Entity;
  _activeClue: Clue;
  _observer: DatabaseObserver;

  constructor()
  {
    super();
    this.addButtonToToolbar(new Button("关闭数据库",  0, 0, 150, 50));
    this._clueRoot = new Entity(100, 140);

    // create clue buttons using PlayerData's list of clues
    for (let i: number = 0; i < playerData.getClueCount(); i++)
    {
      const clueButton: ClueButton = new ClueButton(playerData.getClueAt(i), i * 40, this);
      this.addButton(clueButton);
      this._clueRoot.addChild(clueButton);
    }
  }

  setObserver(observer: DatabaseObserver): void
  {
    this._observer = observer;
  }

  onEnter(): void
  {
  }

  onExit(): void
  {
    this._observer = null;
  }

  onClueMouseOver(clue: Clue): void
  {
    this._activeClue = clue;
  }

  onClueSelected(clue: Clue): void
  {
    if (this._observer != null)
    {
      this._observer.onInvokeClue(clue);
    }
    else
    {
      feed.publish("那个现在还不能帮助到你", true);
    }
  }

  onButtonUp(button: Button): void
  {
    if (button.id == "关闭数据库")
    {
      gameManager.popScreen();
    }
  }

  update(): void {}

  render(): void
  {
    fill(0, 0, 0);
    stroke(0, 0, 100);

    rectMode(CORNER);

    const x: number = width/2 - 100;
    const y: number = 200;
    const w: number = 500;
    const h: number = 300;

    rect(x, y, w, h);

    let _displayText: string = "选择一项条目";

    if (this._activeClue != null)
    {
      _displayText = this._activeClue.description;
    }
    else if (playerData.getKnownClueCount() == 0)
    {
      _displayText = "暂无条目";
    }

    textFont(mediumFontData);
    textSize(18);
    textAlign(LEFT, TOP);
    fill(0, 0, 100);
    text(_displayText, x + 10, y + 10, w - 20, h - 20);

    feed.render();
  }
}

export interface ClueButtonObserver
{
  onClueSelected(clue: Clue): void;
  onClueMouseOver(clue: Clue): void;
}

export class ClueButton extends Button
{
  _clue: Clue;
  _clueObserver: ClueButtonObserver;

  constructor(clue: Clue, y: number, observer: ClueButtonObserver)
  {
    super(clue.name, (textWidth(clue.name) + 10) * 0.5, y, textWidth(clue.name) + 10, 20);
    this._clue = clue;
    this._clueObserver = observer;
  }

  getClue(): Clue
  {
    return this._clue;
  }

  update(): void
  {
    this.enabled = this._clue.discovered;
    this.visible = this._clue.discovered;
    super.update();
  }

  draw(): void
  {
    if (!this.visible) {return;}
    
    super.draw();

    let symbolColor: Color;

    if (this._clue.curiosity == Curiosity.VESSEL)
    {
        symbolColor = color(100, 100, 100);
    }
    else if (this._clue.curiosity == Curiosity.ANCIENT_PROBE_LAUNCHER)
    {
      symbolColor = color(200, 100, 100);
    }
    else if (this._clue.curiosity == Curiosity.TIME_LOOP_DEVICE)
    {
      symbolColor = color(20, 100, 100);
    }
    else
    {
      symbolColor = color(300, 100, 100);
    }

    fill(symbolColor);
    noStroke();
    ellipse(this.screenPosition.x - this._bounds.x * 0.5 - 20, this.screenPosition.y, 10, 10);

    noFill();
    stroke(symbolColor);
    ellipse(this.screenPosition.x - this._bounds.x * 0.5 - 20, this.screenPosition.y, 15, 15);
  }

  onButtonEnterHover(): void
  {
    this._clueObserver.onClueMouseOver(this._clue);
  }

  onButtonUp(): void
  {
    this._clueObserver.onClueSelected(this._clue);
  }
}