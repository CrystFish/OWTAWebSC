import { GlobalObserver, Message } from "./GlobalMessenger";
import { SupernovaScreen } from "./SupernovaScreen";
import { feed, messenger, gameManager, playerData } from "./app";

export class TimeLoop implements GlobalObserver
{
	static ACTION_POINTS_PER_LOOP: number = 15;
	_actionPoints: number;

	_isTimeLoopEnabled: boolean;
	_triggerSupernova: boolean;

	init(): void
	{
		this._actionPoints = TimeLoop.ACTION_POINTS_PER_LOOP;
		this._isTimeLoopEnabled = true;
		this._triggerSupernova = false;
		
		feed.publish("你在村庄发射塔下的篝火旁醒来。今天是个大日子！");
		feed.publish("在天上，你注意到一个明亮的物体正从深巨星飞离...", true);

		messenger.addObserver(this);
	}

	onReceiveGlobalMessage(message: Message): void
	{
		if (message.id === "关闭时间循环" && this._isTimeLoopEnabled)
		{
			this._isTimeLoopEnabled = false;
			feed.publish("你关闭了时间循环装置", true);
		}
	}

	lateUpdate(): void
	{
		if (this._triggerSupernova)
		{
			this._triggerSupernova = false;
			gameManager.swapScreen(new SupernovaScreen());
		}
	}

	getEnabled(): boolean
	{
		return this._isTimeLoopEnabled;
	}

	getLoopPercent(): number
	{
		return (TimeLoop.ACTION_POINTS_PER_LOOP - this._actionPoints) / TimeLoop.ACTION_POINTS_PER_LOOP;
	}

	getActionPoints(): number
	{
		return this._actionPoints;
	}

	waitFor(minutes: number): void
	{
		feed.publish("你等待了 1 分钟", true);
		this.spendActionPoints(minutes);
	}

	spendActionPoints(points: number): void
	{
		if (playerData.isPlayerAtEOTU()) {return;}
		
		const lastActionPoints: number = this._actionPoints;

		this._actionPoints = max(0, this._actionPoints - points);
		messenger.sendMessage("action points spent");

		// detect when you have 1/4 your action points remaining
		if (lastActionPoints > TimeLoop.ACTION_POINTS_PER_LOOP * 0.25 && this._actionPoints <= TimeLoop.ACTION_POINTS_PER_LOOP * 0.25)
		{
			feed.publish("你注意到太阳正变得又大又红，十分糟糕", true);
		}

		if (this._actionPoints == 0)
		{
			this._triggerSupernova = true;
		}
	}

	renderTimer(): void
	{
		if (playerData.isPlayerAtEOTU()) {return;}

		const r: number = 50;
		const x: number = 50;
		const y: number = height - 50;

		stroke(0, 0, 100);
		fill(0, 0, 0);
		ellipse(x, y, r, r);
		fill(30, 100, 100);
		arc(x, y, r, r, 0 - PI * 0.5 + TAU * this.getLoopPercent(), 1.5 * PI);
		// fill(0, 0, 100);
		// textSize(20);
		// textAlign(RIGHT, TOP);
		// text("Time Remaining: " + _actionPoints + " min", width - 25, 25);
	}
}