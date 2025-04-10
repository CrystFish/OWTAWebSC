import { Button } from "./Button";
import { DatabaseObserver } from "./DatabaseScreen";
import { Message } from "./GlobalMessenger";
import { Clue } from "./PlayerData";
import { OWScreen } from "./Screen";
import { EndScreen } from "./TitleScreen";
import { feed, timeLoop, gameManager, playerData, messenger, locator, mediumFontData } from "./app";

export abstract class EventScreen extends OWScreen implements DatabaseObserver
{
	static BOX_WIDTH: number = 700;
	static BOX_HEIGHT: number = 400;

	_nextButton: Button;
	_databaseButton: Button;

	constructor()
	{
		super()
		this.overlay = true; // continue to render BG
		this.initButtons();
	}

	initButtons(): void
	{
		this.addButtonToToolbar(this._nextButton = new Button("继续", 0, 0, 150, 50));
	}

	addDatabaseButton(): void
	{
		this.addButtonToToolbar(this._databaseButton = new Button("查看数据库", 0, 0, 150, 50));
	}

	addContinueButton(): void
	{
		this.addButtonToToolbar(this._nextButton = new Button("继续", 0, 0, 150, 50));
	}

	update(): void{}

	renderBackground(): void {}

	render(): void {
		push();
		translate(width / 2 - EventScreen.BOX_WIDTH / 2, height / 2 - EventScreen.BOX_HEIGHT / 2);

		stroke(0, 0, 100);
		fill(0, 0, 0);
		rectMode(CORNER);
		rect(0, 0, EventScreen.BOX_WIDTH, EventScreen.BOX_HEIGHT);

		fill(0, 0, 100);

		textFont(mediumFontData);
		textSize(18);
		textAlign(LEFT, TOP);

		// 获取需要显示的文本
		const displayText = this.getDisplayText();
		const wrappedLines = this.wrapText(displayText, EventScreen.BOX_WIDTH - 20); // 自动换行处理

		let y = 10; // 初始 y 坐标
		const lineHeight = 24; // 固定行高，确保行间距足够

		for (const line of wrappedLines) {
			if (line === "") {
				// 如果是空行，直接增加 y 坐标，保留空行
				y += lineHeight;
			} else {
				text(line, 10, y); // 绘制每一行文本
				y += lineHeight; // 增加 y 坐标，确保下一行不会重叠
			}
		}

		pop();

		feed.render();
		timeLoop.renderTimer();
	}

	/**
	 * 自动换行函数：根据最大宽度将文本分割成多行，并保留空行
	 * @param text 原始文本
	 * @param maxWidth 最大宽度
	 * @returns 分割后的多行文本数组
	 */
	wrapText(text: string, maxWidth: number): string[] {
		const lines: string[] = [];
		const paragraphs = text.split('\n'); // 按换行符分割段落

		for (const paragraph of paragraphs) {
			if (paragraph.trim() === "") {
				// 如果段落是空的，保留空行
				lines.push("");
				continue;
			}

			let currentLine = "";

			for (const char of paragraph) {
				const testLine = currentLine + char;
				if (textWidth(testLine) > maxWidth) {
					lines.push(currentLine); // 当前行已满，保存
					currentLine = char; // 开始新的一行
				} else {
					currentLine = testLine; // 继续添加字符
				}
			}

			if (currentLine) {
				lines.push(currentLine); // 保存最后一行
			}
		}

		return lines;
	}

	onButtonUp(button: Button): void
	{
	    if (button == this._nextButton)
	    {
	    	this.onContinue();
	    }
	    else if (button == this._databaseButton)
	    {
			gameManager.pushScreen(gameManager.databaseScreen);
			gameManager.databaseScreen.setObserver(this);
	    }
	}

	onInvokeClue(clue: Clue): void {}

	abstract getDisplayText(): string;

	abstract onContinue(): void;

	onEnter(): void{}

	onExit(): void{}
}

export class DeathByAnglerfishScreen extends EventScreen
{
	onEnter(): void
	{
		feed.clear();
		feed.publish("你被鮟鱇鱼吃掉了", true);
	}

	getDisplayText(): string
	{
		return "你在飞向闪耀的光芒时，突然意识到这实际上是巨型鮟鱇鱼的诱饵！\n\n你试图扭头就跑，但为时已晚 —— 鮟鱇鱼一口就把你吞没了\n\n世界变得一片漆黑...";
	}
	onContinue(): void
	{
		playerData.killPlayer();
	}
}

export class DiveAttemptScreen extends EventScreen
{
	onEnter(): void
	{
		feed.clear();
		feed.publish("你尝试潜入水下", true);
	}

	getDisplayText(): string
	{
		return "你尝试潜入水下，但浅层强大的水流阻止你继续潜入几百米下的深水区";
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class TeleportScreen extends EventScreen
{
	_text: string;
	_destination: string;

	constructor(teleportText: string, destination: string)
	{
		super()
		this._text = teleportText;
		this._destination = destination;
	}

	onExit(): void
	{
		feed.clear();
		feed.publish("你已被传送至新地点", true);
	}

	getDisplayText(): string
	{
		return this._text;
	}

	onContinue(): void
	{
		gameManager.popScreen();
		messenger.sendMessage(new Message("teleport to", this._destination));
	}
}

export class MoveToScreen extends EventScreen
{
	_text: string;
	_destination: string;

	constructor(moveText: string, destination: string)
	{
		super()
		this._text = moveText;
		this._destination = destination;
	}

	getDisplayText(): string
	{
		return this._text;
	}

	onContinue(): void
	{
		gameManager.popScreen();
		messenger.sendMessage(new Message("move to", this._destination));
	}
}

export class SectorArrivalScreen extends EventScreen
{
	_arrivalText: string;
	_sectorName: string;

	constructor(arrivalText: string, sectorName: string)
	{
		super()
		this._arrivalText = arrivalText;
		this._sectorName = sectorName;
	}

	onEnter(): void
	{
		feed.clear();
		feed.publish("你已抵达" + this._sectorName);
	}

	getDisplayText(): string
	{
		return this._arrivalText;
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class QuantumArrivalScreen extends EventScreen
{
	_screenIndex: number = 0;
	_photoTaken: boolean = false;

	initButtons(): void
	{
		this.addDatabaseButton();
		this.addContinueButton();
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			if (!this._photoTaken)
			{
				return "你接近了量子卫星, 一团奇怪的迷雾开始遮挡你的视线...";
			}
			else
			{
				return "在它被逐渐逼近的迷雾完全遮挡之前，你使用小侦察兵拍摄了卫星的照片";
			}
		}
		else if (this._screenIndex == 1)
		{
			if (!this._photoTaken)
			{
				return "迷雾完全吞没了你的飞船，然后突然消散，就像它出现时那样\n\n你环顾四周，量子卫星已经神秘消失了";
			}
			else
			{
				return "你一头扎进雾中，确保自己盯着刚刚拍到的照片\n\n突然，巨大的形状从雾中浮现...你抵达了量子卫星的表面！";
			}
		}
		return "";
	}

	onInvokeClue(clue: Clue): void
	{
		if (clue.id === "QM_1")
		{
			gameManager.popScreen();
			this._photoTaken = true;
			this._databaseButton.enabled = false;
		}
		else
		{
			feed.publish("那个现在还不能帮助到你", true);
		}
	}

	onContinue(): void
	{
		this._screenIndex++;

		this._databaseButton.enabled = false;

		if (this._screenIndex > 1)
		{
			if (!this._photoTaken)
			{
				gameManager.popScreen();
				messenger.sendMessage("quantum moon vanished");
			}
			else
			{
				gameManager.popScreen();
			}
		}
	}
}

export class QuantumEntanglementScreen extends EventScreen
{
	_displayText: string;

	constructor()
	{
		super()
		if (locator.player.currentSector.getName() === "Quantum Moon")
		{
			this._displayText = "你关闭了手电筒，世界变得一片漆黑\n\n当你重新打开手电筒时，四周的环境发生了变化...";
		}
		else
		{
			this._displayText = "你爬上了量子碎片的顶部并关闭了手电筒。环境实在是太黑了，伸手不见五指\n\n当你重新打开手电筒时，你仍然站在量子碎片的顶部，但四周的环境发生了变化...";
		}
	}

	onEnter(): void
	{
		feed.clear();
		feed.publish("你与量子物体一块发生纠缠现象了");
	}

	getDisplayText(): string
	{
		return this._displayText;
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class FollowTheVineScreen extends EventScreen
{
	_screenIndex: number = 0;
	_silentRunning: boolean = false;

	initButtons(): void
	{
		this.addDatabaseButton();
		this.addContinueButton();
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "你向其中一朵怪异的蓝色花朵发射小侦察兵，它很快就被吞噬了。你跟随小侦察兵的追踪信号，顺着错综复杂的藤蔓进入黑荆星的中心深处\n\n你如此专注于跟随小侦察兵的信号，以至于你没有注意到发光的诱饵，但已为时已晚。你直接飞进了鮟鱇鱼的巢穴里！";
		}
		else if (this._screenIndex == 1)
		{
			if (!this._silentRunning)
			{
				return "你反转了飞船的推进器，但为时已晚。鮟鱇鱼飞速猛扑过来，吞噬了整个飞船";
			}
			else
			{
				return "你突然想起了那个古老儿童游戏的规则，你关掉了引擎，悄悄地漂进了巢穴\n\n似乎没有鮟鱇鱼注意到你，你安全地到达了另一边。你继续跟随小侦察兵的信号前进，没过多久，你到达了一个纠缠于黑荆根部的古老遗迹";
			}
		}
		return "";
	}

	onButtonUp(button: Button): void
	{
	    if (button == this._nextButton)
	    {
	    	this.onContinue();
	    }
	    else if (button == this._databaseButton)
	    {
			gameManager.pushScreen(gameManager.databaseScreen);
			gameManager.databaseScreen.setObserver(this);
	    }
	}

	onInvokeClue(clue: Clue): void
	{
		if (clue.id === "D_2")
		{
			gameManager.popScreen();
			this._silentRunning = true;
			this._screenIndex++;
			this._databaseButton.enabled = false;
		}
		else
		{
			feed.publish("那个现在还不能帮助到你", true);
		}
	}

	onContinue(): void
	{
		this._screenIndex++;
		this._databaseButton.enabled = false;

		if (this._screenIndex > 1)
		{
			if (!this._silentRunning)
			{
				gameManager.popScreen();
				playerData.killPlayer();
			}
			else
			{
				gameManager.popScreen();
				messenger.sendMessage(new Message("move to", "古飞船"));
			}
		}
	}
}

export class AncientVesselScreen extends EventScreen
{
	_warpButton: Button;
	_displayText: string;

	constructor()
	{
		super();
		this._displayText = "你探索了这片废墟，最终找到了这里。尽管飞船的生命维持系统已经失效，但一些计算机终端仍在使用某种辅助电源运行。你找到了挪麦人从宇宙之眼接收的原始信号的记录。根据它们的分析，无论信号来自什么物体，都比宇宙本身更为古老！\n\n你又四处探查了一番，发现这艘船的跃迁装置在几百年前就完成了充能";
	}

	initButtons(): void
	{
		this.addButtonToToolbar(this._warpButton = new Button("使用跃迁装置", 0, 0, 150, 50));
		super.initButtons();
	}

	getDisplayText(): string
	{
		return this._displayText;
	}

	onButtonUp(button: Button): void
	{
	    if (button == this._warpButton)
	    {
	    	if (playerData.knowsSignalCoordinates())
	    	{
	    		if (!timeLoop.getEnabled())
	    		{
	    			gameManager.popScreen();
	    			messenger.sendMessage(new Message("teleport to", "Ancient Vessel 2"));
	    			feed.clear();
	    			feed.publish("古飞船跃迁到了宇宙之眼所在的坐标");
	    		}
	    		else
	    		{
	    			this._displayText = "你输入了宇宙之眼的坐标并尝试使用跃迁装置，但由于存在“巨大的时间扭曲”，它拒绝启动'.";
	    		}
	    	}
	    	else
	    	{
	    		this._displayText = "你试图使用跃迁装置，但没有目的地坐标，装置显然无法启动";
	    	}
	    }
	    else if (button == this._nextButton)
	    {
			this.onContinue();
	    }
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class TimeLoopCentralScreen extends EventScreen
{
	_screenIndex: number = 0;
	_yes: Button;
	_no: Button;

	initButtons(): void
	{
		this.addContinueButton();
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "你正位于灰烬双星中心的一个巨大球形舱内。你在外面看到的两根巨型天线延伸到了地表以下，并汇聚到了密室中心一个精心制作的线圈状的挪麦科技装置中。这一定就是时间循环的源头！\n\n你发现了一个信号发射器，它能自动通知深巨星轨道上的挪麦空间站在每次循环开始时发射一个探测器\n\n时间循环装置需要超新星的能量来改变时间的流逝。几千年前，挪麦人曾试人工激发超新星，但没有成功";
		}

		return "你最终找到了通往密室中心的路，并找到了看起来像是时间循环机器的界面\n\n你想关闭时间循环吗？";
	}

	onButtonUp(button: Button): void
	{
		super.onButtonUp(button);
		
		if (button == this._yes)
		{
			messenger.sendMessage("关闭时间循环");
			gameManager.popScreen();
		}
		else if (button == this._no)
		{
			gameManager.popScreen();
		}
	}

	onContinue(): void
	{
		this._screenIndex++;
		this.removeButtonFromToolbar(this._nextButton);
		this.addButtonToToolbar(this._yes = new Button("是"));
		this.addButtonToToolbar(this._no = new Button("否"));
	}
}

export class EyeOfTheUniverseScreen extends EventScreen
{
	_screenIndex: number = 0;

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "当你靠近围绕着宇宙之眼的奇特能量云时，你看到最后几颗恒星在远处爆发。宇宙变成了一片漆黑的虚无\n\n当你到达云层中心时，云层逐渐消散，露出一个漂浮在空中的奇特球形物体。在它闪闪发光的表面上，你看到了数十亿个光点。当你靠近时，你发现这些光点像是恒星和星系团。每当你把目光从球体上移开，再移回来时，恒星和星系的结构就会发生变化\n\n你启动了喷气背包，进入了球体...";
		}

		return "有那么一瞬间，你发现自己漂浮在星辰和银河的海洋中。突然，所有的恒星都坍缩成你正前方的一个光点。前几秒什么都没有发生，然后光点突然向外爆发出惊人的能量。冲击波将你猛烈撞向了空中\n\n你的生命维持系统正在崩溃，而你只能眼睁睁地看着能量与物质四向喷向太空\n\n过了一会，你的视野正在逐渐变黑";
	}

	onContinue(): void
	{
		this._screenIndex++;

		if (this._screenIndex == 2)
		{
			gameManager._solarSystem.player.currentSector = null;
			gameManager.pushScreen(new EndScreen());
		}
	}
}

export class BrambleOutskirtsScreen extends EventScreen
{
	_screenIndex: number = 0;
	_yes: Button;
	_no: Button;

	initButtons(): void
	{
		this.addDatabaseButton();
		this.addButtonToToolbar(this._yes = new Button("是"));
		this.addButtonToToolbar(this._no = new Button("否"));
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "你正在探索黑荆星的外围，藤蔓的顶端会开出巨大的异形白花（以及几朵蓝花）\n\n你注意到靠近每朵花中心的地方都有一个小开口...你想靠近仔细看看吗？";
		}

		return "当你靠近时，花朵打开了，一股奇怪的力量开始把你推进去。你拼命想逃离，但没有用\n\n你被一朵巨大的花朵毫不留情地吞噬了。世界一片漆黑，你能听到自己被消化的声音...";
	}

	onButtonUp(button: Button): void
	{
		super.onButtonUp(button);
		
		if (button == this._yes)
		{
			this._screenIndex++;
			this.removeButtonFromToolbar(this._yes);
			this.removeButtonFromToolbar(this._no);
			this.removeButtonFromToolbar(this._databaseButton);
			this.addContinueButton();
		}
		else if (button == this._no)
		{
			gameManager.popScreen();
		}
	}

	onInvokeClue(clue: Clue): void
	{
		if (clue.id === "D_3")
		{
			gameManager.popScreen();
			messenger.sendMessage("follow the vine");
		}
		else
		{
			feed.publish("那个现在还不能帮助到你", true);
		}
	}

	onContinue(): void
	{
		playerData.killPlayer();
	}
}