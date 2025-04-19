import { OWNode } from "./Node";
import { messenger } from "./app";
import { JSONObject } from "./compat";

export class AnglerfishNode extends OWNode
{
	constructor(nodeName: string, nodeJSONObj: JSONObject)
	{
		super(nodeName, nodeJSONObj);
		this.entryPoint = true;
		this.shipAccess = true;
		this.gravity = false;

		this._visible = true;
	}

	getKnownName(): string
	{
		if (this._visited) return "鮟鱇鱼";
		else return "？？？";
	} 

	getDescription(): string 
	{
		return "一条巨大而饥饿的鮟鱇鱼";
	}

	getProbeDescription(): string 
	{
		return "一束光穿过雾气";
	}

	hasDescription(): boolean {return true;}

	isProbeable(): boolean {return true;}

	isExplorable(): boolean {return true;} // tricks graphics into rendering question mark

	visit(): void
	{
		this._visited = true;
		this.setVisible(true);

		messenger.sendMessage("death by anglerfish");

		if (this._observer != null)
		{
			this._observer.onNodeVisited(this);
		}
	}
}