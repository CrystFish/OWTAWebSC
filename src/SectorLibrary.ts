import { AnglerfishNode } from "./AnglerfishNode";
import { Actor } from "./Entity";
import { QuantumArrivalScreen } from "./EventScreen";
import { Message } from "./GlobalMessenger";
import { OWNode } from "./Node";
import { QuantumNode } from "./QuantumNode";
import { Sector } from "./Sector";
import { Vector2 } from "./Vector2";
import { locator, gameManager } from "./app";
import { JSONObject } from "./compat";

export class Comet extends Sector
{  
  load(): void
  {
    this._name = "彗星";
    this.loadFromJSON("data/sectors/comet.json");
    //setAnchorOffset(100, 30);
  }
  
  drawSectorBackdrop(): void
  {
    stroke(200, 30, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 300, 300);
  }
}

export class RockyTwin extends Sector
{  
  load(): void
  {
    this._name = "余烬双星";
    this.loadFromJSON("data/sectors/rocky_twin.json");
    //setAnchorOffset(100, 30);
  }
  
  drawSectorBackdrop(): void
  {
    stroke(60, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
  }
}

export class SandyTwin extends Sector
{  
  load(): void
  {
    this._name = "灰烬双星";
    this.loadFromJSON("data/sectors/sandy_twin.json");
    //setAnchorOffset(100, 30);
  }
  
  drawSectorBackdrop(): void
  {
    stroke(60, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
  }
}

export class TimberHearth extends Sector
{  
  load(): void
  {
    this._name = "木灶星";
    this.loadFromJSON("data/sectors/timber_hearth.json");
    //setAnchorOffset(100, 30);
  }
  
  drawSectorBackdrop(): void
  {
    stroke(200, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
  }
}

export class BrittleHollow extends Sector
{  
  load(): void
  { 
    this._name = "碎空星";
    this.loadFromJSON("data/sectors/brittle_hollow.json");
  }
  
  drawSectorBackdrop(): void
  {
    stroke(0, 100, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 500, 500);
    this.drawBlackHole(35);
  }

  drawBlackHole(radius: number): void 
  {
    // black hole
    noStroke();
    fill(0,100,0);
    ellipse(0, 0, radius * 0.5, radius * 0.5);
    
    // spiral
    noFill();
    strokeWeight(1);
    stroke(260, 80, 70);

    const start: number = radius * 0.125;
    const end: number = radius;
    const spirals: number = 3;
    const step: number = 0.1 * PI;

    let x0: number = start;
    let y0: number = 0;

    for (let t: number = step; t < spirals * TWO_PI; t += step) 
    {
      let theta: number = t;

      let r: number = (theta / (spirals * TWO_PI)) * (end - start) + start;
      const x3: number = r * cos(theta);
      const y3: number = r * sin(theta);

      theta -= step / 3;
      r = (theta / (spirals * TWO_PI)) * (end - start) + start;
      const x2: number = r * cos(theta);
      const y2: number = r * sin(theta);

      theta -= step / 3;
      r = (theta / (spirals * TWO_PI)) * (end - start) + start;
      const x1: number = r * cos(theta);
      const y1: number = r * sin(theta);

      bezier(x0, y0, x1, y1, x2, y2, x3, y3);
      x0 = x3;
      y0 = y3;
    }
  }
}

export class GiantsDeep extends Sector
{  
  load(): void
  { 
    this._name = "深巨星";
    this.loadFromJSON("data/sectors/giants_deep.json");
    this.setAnchorOffset(0, 60);
  }
  
  drawSectorBackdrop(): void
  {
    fill(0, 0, 0);

    stroke(180, 100, 100);
    ellipse(0, 0, 600, 600);

    stroke(200, 100, 60);
    ellipse(0, 0, 400, 400);

    // stroke(220, 100, 50);
    // ellipse(0, 0, 100, 100);
  }
}

export class DarkBramble extends Sector
{
  _fogLightNodes: OWNode[];
  _fogLightPositions: Vector2[];

  constructor()
  {
    super();
    this._fogLightNodes = new Array<OWNode>();
    this._fogLightPositions = new Array<Vector2>();
  }

  load(): void
  {
    this._name = "黑荆星";
    this.loadFromJSON("data/sectors/dark_bramble.json");

    for (let i: number = 0; i < this._fogLightNodes.length; i++)
    {
      const index: number = int(random(0, this._fogLightPositions.length));
      //println("pos:", this._fogLightPositions[index]);
      this._fogLightNodes[i].setPosition(this._fogLightPositions[index]);
      this._fogLightPositions.splice(index, 1);
    }
  }

  createNode(name: string, nodeObj: JSONObject): OWNode
  {
    let newNode: OWNode;

    if (nodeObj.hasKey("anglerfish"))
    {
      newNode = new AnglerfishNode(name, nodeObj);
      this._fogLightNodes.push(newNode);
      this._fogLightPositions.push(new Vector2(newNode.position));
    }
    else
    {
      newNode = new OWNode(name, nodeObj);
    }

    if (nodeObj.getBoolean("fog light", false))
    {
      this._fogLightNodes.push(newNode);
      this._fogLightPositions.push(new Vector2(newNode.position));
    }

    return newNode;
  }
  
  drawSectorBackdrop(): void
  {
    stroke(120, 100, 100);
    fill(0, 0, 0);
    ellipse(100, 0, 700, 500);
  }
}

export class QuantumMoon extends Sector
{
  _quantumLocation: number = 0;
  _turnsSinceEOTU: number = 0;

  load(): void
  {
    this._name = "量子卫星";
    this.loadFromJSON("data/sectors/quantum_moon.json");
    //setAnchorOffset(100, 30);
  }

  onReceiveGlobalMessage(message: Message): void
  {
    if (message.id === "quantum entanglement")
    {
      if (locator.player.currentSector == this)
      {
        this.collapse();
        this.onQuantumEntanglement();
      }
    }
  }

  onArrival(): void
  {
    // overrides normal arrival screen
    gameManager.pushScreen(new QuantumArrivalScreen());
  }

  createNode(name: string, nodeObj: JSONObject): OWNode
  {
    return new QuantumNode(name, nodeObj);
  }

  collapse(): void
  {
    // move to random location
    let tLocation: number = this._quantumLocation;
    while (tLocation == this._quantumLocation)
    {
      tLocation = int(random(5));
    }
    this._quantumLocation = tLocation;

    // limit how many turns can pass without going to the EOTU
    if (this._quantumLocation != 4)
    {
      this._turnsSinceEOTU++;

      if (this._turnsSinceEOTU > 4)
      {
        this._quantumLocation = 4;
        this._turnsSinceEOTU = 0;
      }
    }
    
    // update node visibility
    for (let i: number = 0; i < this._nodes.length; i++)
    {
      (this._nodes[i] as QuantumNode).updateQuantumStatus(this._quantumLocation);
    }
  }

  onQuantumEntanglement(): void
  {
    super.onQuantumEntanglement();
      
    // remove ship
    if (locator.ship.currentSector == this)
    {
      locator.ship.currentSector.removeActor(locator.ship);
    }
  }

  getQuantumLocation(): number {return this._quantumLocation;}

  allowTelescope(): boolean {return false;}
  
  drawSectorBackdrop(): void
  {
    stroke(300, 50, 100);
    fill(0, 0, 0);
    ellipse(0, 0, 300, 300);
  }

  removeActor(actor: Actor): void
  {
    super.removeActor(actor);
    actor.lastSector = null; // prevents animation of leaving Sector
  }
}

export class EyeOfTheUniverse extends Sector
{  
  load(): void
  {
    this._name = "比宇宙更为古老的事物";
    this.loadFromJSON("data/sectors/eye_of_the_universe.json");
  }

  allowTelescope(): boolean {return false;}
  
  drawSectorBackdrop(): void
  {
  }
}