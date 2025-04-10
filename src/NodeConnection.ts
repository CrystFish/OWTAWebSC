import { OWNode } from "./Node";
import { Vector2 } from "./Vector2";
import { EDIT_MODE, messenger } from "./app";
import { JSONObject } from "./compat";

export class NodeConnection
{
  node1: OWNode;
  node2: OWNode;

  _description: string;
  _hasDescription: boolean = false;

  _adjacentToPlayer: boolean = false;
  
  _traversed: boolean = false;
  _visible: boolean = false;
  _gated: boolean = false;
  _oneWay: boolean = false;

  _hidden: boolean = false;

  _connectionObj: JSONObject;
  
  constructor(n1: OWNode, n2: OWNode, connectionObj: JSONObject)
  {
    this.node1 = n1;
    this.node2 = n2;

    this._connectionObj = connectionObj;
    
    this.node1.addConnection(this);
    this.node2.addConnection(this);

    this._oneWay = connectionObj.getBoolean("one-way", this._oneWay);
    this._hidden = connectionObj.getBoolean("hidden", this._hidden);
    this._gated = connectionObj.getBoolean("gated", this._gated);

    if (EDIT_MODE) 
    {
      this._visible = true;
    }

    if (connectionObj.hasKey("description"))
    {
      this._hasDescription = true;
      this._description = connectionObj.getString("description");
    }
  }

  updateAdjacentToPlayer(playerNode: OWNode): void
  {
    this._adjacentToPlayer = false;

    if (this.node1 == playerNode || this.node2 == playerNode)
    {
      this._adjacentToPlayer = true;
    }
  }

  hasDescription(): boolean
  {
    return this._hasDescription;
  }

  getDescription(): string
  {
    return this._description;
  }

  getWrongWayText(): string
  {
    return "看起来这条路只能从另一侧才能通行";
  }

  getOtherNode(node: OWNode): OWNode
  {
    if (node == this.node1)
    {
      return this.node2;
    }

    return this.node1;
  }
  
  traversibleFrom(startingNode: OWNode): boolean
  {
    return (!this._gated && (!this._oneWay || startingNode == this.node1));
  }

  fireTraverseEvent(): void
  {
    if (this._connectionObj.hasKey("traverse event"))
    {
      messenger.sendMessage(this._connectionObj.getString("traverse event"));
    }
  }

  fireFailEvent(): void
  {
    if (this._connectionObj.hasKey("fail event"))
    {
      messenger.sendMessage(this._connectionObj.getString("fail event"));
    }
  }

  traverse(): void
  {
    //_oneWay = false;
    this._traversed = true;
  }

  revealHidden(): void
  {
    this._hidden = false;
    this.reveal();
  }

  setVisible(visible: boolean): void {this._visible = visible;}
  
  reveal(): void
  {
    if (this._hidden)
    {
      return;
    }

    this.node1.setVisible(true);
    this.node2.setVisible(true);
    this._visible = true;
  }

  getAlpha(): number
  {
    if (!this._adjacentToPlayer)
    {
      return 35;
    }
    return 100;
  }
  
  render(): void
  {
      if (!this._visible) {return;}

      const dir: Vector2 = (this.node2.screenPosition.sub(this.node1.screenPosition));
      const dist: number = dir.magnitude();
      dir.normalize();

      // draw segmented line
      if (!this._traversed)
      {
        stroke(0, 0, 100, this.getAlpha());
        //stroke(200, 100, 100);

        let l: number = 0;
        const segmentLength: number = 5;

        while(l < dist)
        {
          const startPos: Vector2 = this.node1.screenPosition.add(dir.mult(l));
          const endPos: Vector2 = this.node1.screenPosition.add(dir.mult(l+segmentLength));
          line(startPos.x, startPos.y, endPos.x, endPos.y);
          l += segmentLength * 3;
        }
      }
      // draw solid line
      else
      {
        stroke(0, 0, 100, this.getAlpha());
        line(this.node1.screenPosition.x, this.node1.screenPosition.y, this.node2.screenPosition.x, this.node2.screenPosition.y);
      }
      
      if (!this._oneWay) {return;}
      
      // draw arrow
      const tip: Vector2 = this.node1.screenPosition.add(dir.mult(dist * 0.6));
      const base: Vector2 = tip.sub(dir.mult(14));
      
      const right: Vector2 = base.add(dir.rightNormal().scale(7));
      const left: Vector2 = base.add(dir.leftNormal().scale(7));
      
      fill(0, 0, 0);
      triangle(right.x, right.y, left.x, left.y, tip.x, tip.y);
  }
}