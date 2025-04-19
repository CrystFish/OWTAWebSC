import { Actor, Probe } from "./Entity";
import { ExploreScreen } from "./ExploreScreen";
import { OWNode } from "./Node";
import { NodeConnection } from "./NodeConnection";
import { feed, timeLoop, gameManager, messenger } from "./app";

export interface NodeActionObserver
{
	onExploreNode(node: OWNode): void;
	onProbeNode(node: OWNode): void;
	onTravelAttempt(succeeded: boolean, node: OWNode, connection: NodeConnection): void;
}

export abstract class NodeAction
{
	_prompt: string = "";
	_mouseButton: string = LEFT;
	_observer: NodeActionObserver;

	setObserver(observer: NodeActionObserver): void
	{
		this._observer = observer;
	}

	getMouseButton(): string
	{
		return this._mouseButton;
	}

	setMouseButton(button: string): void
	{
		this._mouseButton = button;
	}

	abstract execute(): void;
	
	getCost(): number
	{
		return 0;
	}

	getPrompt(): string
	{
		return this._prompt;
	}

	setPrompt(description: string): void
	{
		if (this._mouseButton == LEFT)
		{
			this._prompt += "左键 - " + description;
		}
		else
		{
			this._prompt += "右键 - " + description;
		}

		this._prompt += " [ " + this.getCost() + " 分钟 ]";
	}
}

export class ProbeAction extends NodeAction
{
	_player: Actor;
	_location: OWNode;

	constructor(button: string, player: Actor, location: OWNode, observer: NodeActionObserver)
	{
		super();
		this._player = player;
		this._location = location;
		this.setMouseButton(button);
		this.setObserver(observer);
		this.setPrompt("发射侦察兵");
	}

	execute(): void
	{
		feed.publish("你看见了" + this._location.getProbeDescription());

		const probe: Actor = new Probe();
		this._player.currentSector.addActor(probe);
		probe.setScreenPosition(this._player.screenPosition);
		probe.moveToNode(this._location);

		this._observer.onProbeNode(this._location);
	}
}

export class ExploreAction extends NodeAction
{
	_location: OWNode;

	constructor(button: string, location: OWNode, observer: NodeActionObserver)
	{
		super();
		this._location = location;
		this.setMouseButton(button);
		this.setObserver(observer);
		this.setPrompt("探索");
	}

	getCost(): number
	{
		return 1;
	}

	execute(): void
	{
		timeLoop.spendActionPoints(this.getCost());

		// prevent the action from happening if the sun's going to explode
		if (timeLoop.getActionPoints() == 0) 
		{
			return;
		}

		feed.clear();
		feed.publish("你探索了" + this._location.getActualName());
		
		this._observer.onExploreNode(this._location);
		gameManager.pushScreen(new ExploreScreen(this._location));
		this._location.explore();
	}
}

export class TravelAction extends NodeAction
{
	_player: Actor;
	_ship: Actor;
	_destination: OWNode;

	constructor(button: string, player: Actor, ship: Actor | null, destination: OWNode, observer: NodeActionObserver)
	{
		super();
		this._ship = ship;
		this._player = player;
		this._destination = destination;
		this.setMouseButton(button);
		this.setObserver(observer);
		this.setPrompt();
	}

	setPrompt(prompt?: string): void
	{
		if (prompt !== undefined) return super.setPrompt(prompt);
		if (this._ship != null)
		{
			if (this._ship.currentNode == null && this._destination.gravity)
			{
				this.setPrompt("降落到此处");
				return;
			}
			this.setPrompt("飞到此处");
		}
		else if (this._destination.gravity)
		{
			this.setPrompt("移动到此处");
		}
		else
		{
			this.setPrompt("飞到此处");
		}
	}

	getCost(): number
	{
		return 1;
	}

	execute(): void
	{
		feed.clear();

		if (this._player.currentNode != null)
		{
			const connection: NodeConnection = this._destination.getConnection(this._player.currentNode);

			if (connection != null)
			{	
				if (!connection.traversibleFrom(this._player.currentNode))
				{
					connection.fireFailEvent();
					feed.publish(connection.getWrongWayText(), true);
					return;
				}

				connection.fireTraverseEvent();
				connection.traverse();

				if (connection.hasDescription())
				{
					feed.publish("你穿过了" + connection.getDescription());
				}
			}
		}

		// publish feed first in case we want to override it (e.g. death-by-anglerfish scenario)
		if (this._destination.hasDescription())
		{
			feed.publish("你已抵达" + this._destination.getDescription());
		}

		if (this._ship != null)
		{
			this._ship.moveToNode(this._destination);
		}
		
		messenger.sendMessage("reset reachability");
		this._player.moveToNode(this._destination);
		this._observer.onTravelAttempt(true, this._destination, this._destination.getConnection(this._player.currentNode));
		timeLoop.spendActionPoints(this.getCost());
	}
}