import { Button } from "./Button";
import { OWScreen } from "./Screen";
import { feed, playerData, gameManager } from "./app";

export class SupernovaScreen extends OWScreen
{
  initTime: number = 0;
  collapseTime: number;
  supernovaTime: number;
  collapsePercent: number = 0;
  supernovaPercent: number = 0;

  static SUN_SIZE: number = 300;
  static COLLAPSE_DURATION: number = 2000;

  static SUPERNOVA_SIZE: number = 2000;
  static SUPERNOVA_DURATION: number = 2000;

  constructor()
  {
    super();
  }
  
  onEnter(): void
  {
    this.initTime = millis();
    this.collapseTime = this.initTime + 1 * 500;
    this.supernovaTime = this.collapseTime + SupernovaScreen.COLLAPSE_DURATION;

    feed.clear();
    feed.publish("太阳正在演化为超新星！", true);
  }
  
  onExit(): void {}
  
  update(): void
  {
    this.collapsePercent = constrain((millis() - this.collapseTime) / SupernovaScreen.COLLAPSE_DURATION, 0, 1);
    this.collapsePercent = this.collapsePercent * this.collapsePercent * this.collapsePercent;

    this.supernovaPercent = constrain((millis() - this.supernovaTime) / SupernovaScreen.SUPERNOVA_DURATION, 0, 1);
    this.supernovaPercent = this.supernovaPercent * this.supernovaPercent;

    if (this.supernovaPercent == 1)
    {
      playerData.killPlayer();
    }
  }
  
  render(): void
  {
    push();
    translate(width/2, height/2);

      // draw supernova
      noStroke();
      fill(300 * this.supernovaPercent, 100, 100);
      ellipse(0, 0, 5 + SupernovaScreen.SUPERNOVA_SIZE * this.supernovaPercent, 5 + SupernovaScreen.SUPERNOVA_SIZE * this.supernovaPercent * (1 - this.supernovaPercent * 0.5));

      // draw sun
      if (this.collapsePercent < 1)
      {
        stroke(40, 100, 100);
        fill(0, 0, 0);
        ellipse(0, 0, SupernovaScreen.SUN_SIZE * (1 - this.collapsePercent), SupernovaScreen.SUN_SIZE * (1 - this.collapsePercent));
      }

    pop();

    feed.render();
  }
  
  onButtonUp(button: Button): void {}
}

export class FlashbackScreen extends OWScreen
{
  initTime: number = 0;
  lastSpawnTime: number = 0;
  flashbackPercent: number = 0;

  _ringSizes: number[];

  static FLASHBACK_DURATION: number = 2200;

  constructor()
  {
    super();

    this._ringSizes = new Array<number>();
  }
  
  onEnter(): void
  {
    this.initTime = millis();

    feed.clear();
    feed.publish("?!gnineppah s'tahW", true);
  }
  
  onExit(): void
  {

  }
  
  update(): void
  {
    if (millis() - this.lastSpawnTime > 50 && random(1) > 0.3)
    {
      this.lastSpawnTime = millis();
      this._ringSizes.push(5.0);
    }

    for (let i: number = 0; i < this._ringSizes.length; i++)
    {
      this._ringSizes[i] = this._ringSizes[i] + this._ringSizes[i] * 0.1 + 0.5;
    }

    if (this.getFlashBackPercent() == 1)
    {
      gameManager.resetTimeLoop();
    }
  }

  getFlashBackPercent(): number
  {
    return constrain((millis() - this.initTime) / FlashbackScreen.FLASHBACK_DURATION, 0, 1);
  }
  
  render(): void
  {
    push();
    translate(width/2, height/2);

      for (let i: number = 0; i < this._ringSizes.length; i++)
      {
        stroke(0, 0, 100);
        noFill();
        ellipse(0, 0, this._ringSizes[i], this._ringSizes[i]);
      }

    pop();

    const fadeAlpha: number = constrain((this.getFlashBackPercent() - 0.9) / 0.1, 0, 1);
    fill(0, 0, 100, fadeAlpha * 100);
    rectMode(CORNER);
    rect(0, 0, width, height);

    feed.render();
  }
  
  onButtonUp(button: Button): void {}
}

export class GameOverScreen extends OWScreen
{
  constructor()
  {
    super();
    this.addButtonToToolbar(new Button("再次尝试"));
  }

  update(): void {}

  render(): void
  {
    fill(0, 90, 90);
    textAlign(CENTER, CENTER);
    textSize(100);
    text("你死了", width/2, height/2);
  }

  onButtonUp(button: Button): void
  {
    gameManager.resetTimeLoop();
  }
}