import { MoveToScreen, TeleportScreen } from "./EventScreen";
import { OWNode } from "./Node";
import { timeLoop, gameManager, messenger, playerData, feed } from "./app";
import { JSONArray, JSONObject } from "./compat";

export class ExploreData
{
	_node: OWNode;
	_exploreString: string;
	_exploreArray: JSONArray;

	_nodeObj: JSONObject;
	_activeExploreObj: JSONObject;

	_dirty: boolean;

	constructor(node: OWNode, nodeObj: JSONObject)
	{
		this._node = node;
		this._nodeObj = nodeObj;
	}

	parseJSON(): void
	{
	    // parse as string
	    this._exploreString = this._nodeObj.getString("explore", "Nothing to see here!");
	    this._exploreArray = new JSONArray();

	    // parse as explore object
	    if (this._exploreString.charAt(0) == '{')
	    {
	    	this._activeExploreObj = this._nodeObj.getJSONObject("explore");
	    }
	    // parse as array of explore objects
	    else if (this._exploreString.charAt(0) == '[')
	    {
	    	this._exploreArray = this._nodeObj.getJSONArray("explore");
	    	this._activeExploreObj = this._exploreArray.getJSONObject(0);
	    }

	    this._dirty = true;
	}

	updateActiveExploreData(): void
	{
		// check wait times
		for (let i: number = 0; i < this._exploreArray.size(); i++)
	    {
	    	const exploreObj: JSONObject = this._exploreArray.getJSONObject(i);

	    	const turnCycle: number = exploreObj.getInt("turn cycle", 1);
			const turn: number = timeLoop.getActionPoints() % turnCycle;

			if (exploreObj.getInt("on turn", -1) == turn && exploreObj != this._activeExploreObj)
			{
				this._activeExploreObj = exploreObj;
				this._dirty = true;
			}
	    }
	}

	canClueBeInvoked(clueID: string): boolean
	{
		if (clueID === "QM_2" && this._node.allowQuantumEntanglement())
		{
			return true;
		}

		for (let i: number = 0; i < this._exploreArray.size(); i++)
	    {
	    	const exploreObj: JSONObject = this._exploreArray.getJSONObject(i);

	    	if (exploreObj.getString("require clue", "") === clueID && exploreObj != this._activeExploreObj)
	    	{
	    		return true;
	    	}

	    	// NO LONGER IN USE
	    	if (exploreObj.hasKey("clue event") && exploreObj.getJSONObject("clue event").getString("clue id") === clueID)
	    	{
	    		return true;
	    	}
	    }
	    return false;
	}

	invokeClue(clueID: string): void
	{
		if (clueID === "QM_2" && this._node.allowQuantumEntanglement())
		{
			gameManager.popScreen();
			messenger.sendMessage("quantum entanglement");
		}

		for (let i: number = 0; i < this._exploreArray.size(); i++)
	    {
	    	const exploreObj: JSONObject = this._exploreArray.getJSONObject(i);

	    	// unlock explore screens
	    	if (exploreObj.getString("require clue", "") === clueID && exploreObj != this._activeExploreObj)
	    	{
	    		this._activeExploreObj = exploreObj;
	    		this._dirty = true;
	    	}

	    	// NO LONGER IN USE
	    	// fire clue events
	    	if (exploreObj.hasKey("clue event"))
	    	{
	    		const eventClueID: string = exploreObj.getJSONObject("clue event").getString("clue id");

	    		if (eventClueID === clueID)
	    		{
	    			const eventID: string = exploreObj.getJSONObject("clue event").getString("event id");
		    		messenger.sendMessage(eventID);
	    		}
	    	}
	    }
	}

	explore(): void
	{
		this.updateActiveExploreData(); // sets dirty flag if explore data has changed

		if (this._dirty && this._activeExploreObj != null)
		{
		    this.fireEvents(this._activeExploreObj);
		    this.discoverClues(this._activeExploreObj);
		    this.revealHiddenPaths(this._activeExploreObj);
		    this._dirty = false;
		}
	}

	fireEvents(exploreObj: JSONObject): void
	{
		if (exploreObj.hasKey("fire event"))
		{
			messenger.sendMessage(exploreObj.getString("fire event"));
		}
		if (exploreObj.hasKey("move to"))
		{
			gameManager.swapScreen(new MoveToScreen(exploreObj.getString("text"), exploreObj.getString("move to")));
		}
		if (exploreObj.hasKey("teleport to"))
		{
			gameManager.swapScreen(new TeleportScreen(exploreObj.getString("text"), exploreObj.getString("teleport to")));
		}
	}

	discoverClues(exploreObj: JSONObject): void
	{
		if (exploreObj.hasKey("discover clue"))
		{
			playerData.discoverClue(exploreObj.getString("discover clue"));
		}
	}

	revealHiddenPaths(exploreObj: JSONObject): void
	{
		// reveal hidden paths
	    if (exploreObj.hasKey("reveal paths"))
	    {
	    	const pathArray: JSONArray = exploreObj.getJSONArray("reveal paths");

	    	for (let i: number = 0; i < pathArray.size(); i++)
	    	{
	    		this._node.getConnection(pathArray.getString(i)).revealHidden();
	    	}

	    	feed.publish("你发现了一条隐藏通道！", true);
	    }
	}

	getExploreText(): string
	{
		if (this._activeExploreObj != null)
		{
			return this._activeExploreObj.getString("text", "no explore text");
		}

		return this._exploreString;
	}
}