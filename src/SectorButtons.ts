import { Button } from "./Button";
import { Ship, Player } from "./Entity";
import { OWNode } from "./Node";
import { Sector } from "./Sector";
import { QuantumMoon } from "./SectorLibrary";
import { locator, smallFontData } from "./app";
import { println } from "./compat";

export abstract class SectorButton extends Button
{
  _sector: Sector;
  node: OWNode;

  constructor(id: string, x: number, y: number, w: number, h: number, sector: Sector)
  {
    super(id, x, y, w, h);
    this.node = new OWNode(x, y);
    this._sector = sector;
  }

  getRadius(): number
  {
    return this._bounds.y * 0.5;
  }

  getSector(): Sector
  {
    return this._sector;
  }
  
  render(): void
  {
    this.drawNonHighlighted();

    if (this.hoverState)
    {
      strokeWeight(2);
    }
    
    this.drawPlanet();
    this.drawYouAreHere();
    
    strokeWeight(1);
  }
  
  abstract drawPlanet(): void;

  drawNonHighlighted(): void{}
  
  drawName(name?: string, xPos?: number): void
  {
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(name ?? this.id, xPos ?? this.screenPosition.x, this.screenPosition.y - this.getRadius() - 40);
  }

  drawYouAreHere(): void
  {
    if (locator.ship.currentSector == this._sector)
    {
      (locator.ship as Ship).drawAt(this.screenPosition.x, this.screenPosition.y, 0.5, true);
    }

    if (locator.player.currentSector == this._sector)
    {
      (locator.player as Player).drawAt(this.screenPosition.x, this.screenPosition.y, 0.5);
    }
  }

  drawZoomPrompt(): void
  {
    textSize(14);
    textFont(smallFontData);

    fill(0, 0, 0);
    stroke(0, 0, 100);
    rectMode(CENTER);
    rect(this.screenPosition.x, this.screenPosition.y + this.getRadius() + 40, textWidth("左键放大") + 10, 20);

    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    text("左键放大", this.screenPosition.x, this.screenPosition.y + this.getRadius() + 40);
  }
}

export class CometButton extends SectorButton
{
  constructor(x: number, y: number, sector: Sector)
  {
    super("彗星", x, y, 40, 40, sector);
  }
  
  drawPlanet(): void
  {
    noStroke();
    fill(0, 0, 0);

    push();
      translate(this.screenPosition.x, this.screenPosition.y);
      triangle(0, this.getRadius(), 0, -this.getRadius(), 130, 0);
      stroke(200, 30, 100);
      arc(0, 0, this._bounds.y, this._bounds.y, PI * 0.5, PI * 1.5);
      line(0, this._bounds.y * 0.5, 130, 0);
      line(0, -this._bounds.y * 0.5, 130, 0);
    pop();
  }
}

export class HourglassTwinsButton extends SectorButton
{
  _centerX: number;
  _isRightTwin: boolean = false;
  _twinName: string;

  constructor(centerX: number, y: number, isRightTwin: boolean, sector: Sector)
  {
    super("烬双星", centerX, y, 50, 50, sector);
    this._isRightTwin = isRightTwin;
    this._centerX = centerX;
    
    if (isRightTwin) 
    {
      this._twinName = "灰";
      this.setPosition(centerX + 35, this.position.y);
    }
    else
    {
      this._twinName = "余";
      this.setPosition(centerX - 35, this.position.y);
    }
  }

  drawName(): void
  {
    super.drawName(this._twinName + this.id, this._centerX);
  }

  drawNonHighlighted(): void
  {
    if (!this._isRightTwin)
    {
      stroke(60, 100, 100);
      fill(0, 0, 0);
      rectMode(CENTER);
      rect(this._centerX, this.position.y, this._bounds.y * 1.5, this._bounds.y * 0.2);
    }
  }
  
  drawPlanet(): void
  {
    stroke(60, 100, 100);
    fill(0, 0, 0);    
    ellipse(this.position.x, this.position.y, this._bounds.y, this._bounds.y);
  }
}

export class TimberHearthButton extends SectorButton
{
  constructor(x: number, y: number, sector: Sector)
  {
    super("木灶星", x, y, 80, 80, sector);
  }
  
  drawPlanet(): void
  {
    stroke(200, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

export class BrittleHollowButton extends SectorButton
{
  constructor(x: number, y: number, sector: Sector)
  {
    super("碎空星", x, y, 80, 80, sector);
  }
  
  drawPlanet(): void
  {
    stroke(0, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

export class GiantsDeepButton extends SectorButton
{
  constructor(x: number, y: number, sector: Sector)
  {
    super("深巨星", x, y, 150, 150, sector);
  }
  
  drawPlanet(): void
  {
    stroke(180, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

export class DarkBrambleButton extends SectorButton
{
  constructor(x: number, y: number, sector: Sector)
  {
    super("黑荆星", x, y, 230, 230, sector);
  }
  
  drawPlanet(): void
  {
    stroke(120, 100, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}

export class QuantumMoonButton extends SectorButton
{
  _currentTarget: SectorButton;
  _targets: SectorButton[];

  constructor(targets: SectorButton[], sector: Sector)
  {
    super("量子卫星", 0, 0, 30, 30, sector);
    this._targets = targets;
  }

  collapse(): void
  {
    (this._sector as QuantumMoon).collapse();
    this.updatePosition();
  }

  updatePosition(): void
  {
    const i: number = (this._sector as QuantumMoon).getQuantumLocation();

    println(i);

    if (i == 4)
    {
      this._currentTarget = null;
    }
    else
    {
      this._currentTarget = this._targets[i];
    }

    if (this._currentTarget != null)
    {
      this.setPosition(this._currentTarget.position.x - 25, this._currentTarget.position.y - this._currentTarget.getRadius() - 30);
    }
    else
    {
      this.setPosition(-1000, -1000);
    }
  }
  
  drawPlanet(): void
  {
    stroke(300, 50, 100);
    fill(0, 0, 0);
    ellipse(this.position.x, this.position.y, this._bounds.x, this._bounds.y);
  }
}