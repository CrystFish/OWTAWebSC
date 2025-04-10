import { Frequency, Curiosity } from "./Enums";
import { GameSave } from "./GameSave";
import { GlobalObserver, Message } from "./GlobalMessenger";
import { START_WITH_LAUNCH_CODES, START_WITH_COORDINATES, START_WITH_SIGNALS, messenger, feed, locator, gameManager, START_WITH_CLUES, frequencyToString } from "./app";

export class PlayerData implements GlobalObserver
{
	_knowsLaunchCodes: boolean;
	_knowsSignalCoordinates: boolean;

	_clueList: Clue[];
	_knownFrequencies: Frequency[];

	_knownClueCount: number = 0;

	// resets every loop
	_isDead: boolean = false;

	constructor()
	{
		this._knowsLaunchCodes = START_WITH_LAUNCH_CODES;
		this._knowsSignalCoordinates = START_WITH_COORDINATES;

		this._clueList = new Array<Clue>();
		this._knownFrequencies = new Array<Frequency>();
		this._knownFrequencies.push(Frequency.TRAVELER);

		if (START_WITH_SIGNALS)
		{ 
			this._knownFrequencies.push(Frequency.BEACON);
			this._knownFrequencies.push(Frequency.QUANTUM);
		}

		this._clueList.push(new Clue(Curiosity.ANCIENT_PROBE_LAUNCHER, "APL_1", "沉底模块", "数据收集模块从挪麦探测器发射器上脱落，掉进了深巨星的中心。"));
		this._clueList.push(new Clue(Curiosity.ANCIENT_PROBE_LAUNCHER, "APL_2", "汹涌的龙卷风", "深巨星上的大多数龙卷风都有强烈的上升气流，但有些逆时针旋转的龙卷风有着下行气流"));
		this._clueList.push(new Clue(Curiosity.ANCIENT_PROBE_LAUNCHER, "APL_3", "水母", "深巨星水母的空腔恰好能够容下一个人"));

		this._clueList.push(new Clue(Curiosity.QUANTUM_MOON, "QM_3", "第五个位置", "量子卫星有时会拜访太阳系外的第五个位置"));
		this._clueList.push(new Clue(Curiosity.QUANTUM_MOON, "QM_1", "量子成像", "观察量子物体的照片与直接观察物体本身一样，能有效地防止物体移动"));
		this._clueList.push(new Clue(Curiosity.QUANTUM_MOON, "QM_2", "量子纠缠", "普通物体在靠近量子物体时会与之“纠缠”在一起，并开始表现出量子属性\n\n只要无法观察自己或周围环境，即使是生命体也会被纠缠"));

		this._clueList.push(new Clue(Curiosity.VESSEL, "D_1", "失落的飞船", "挪麦人来到这个太阳系是为了寻找它们称之为“宇宙之眼”的神秘的信号，它们乘坐的飞船在黑荆星的某处遇难"));
		this._clueList.push(new Clue(Curiosity.VESSEL, "D_2", "孩童的游戏", "挪麦人孩童们玩了一个游戏，重现了族人逃离黑荆星的情景。根据游戏规则，三名玩家（逃生舱）必须在不被发现的情况下偷偷溜过蒙着眼睛的玩家（鮟鱇鱼）"));
		this._clueList.push(new Clue(Curiosity.VESSEL, "D_3", "追踪装置", "挪麦飞船坠毁在黑荆的根部。挪麦人试图将追踪装置插入黑荆的一根藤蔓中，以重新定位根部，但它们无法穿透藤蔓坚硬的外表"));

		this._clueList.push(new Clue(Curiosity.TIME_LOOP_DEVICE, "TLD_1", "时间循环装置", "挪麦研究人员在深巨星制造出一个小型但功能正常的时间循环装置后，计划在灰烬双星上建造一个完整规模的装置（前提是能产生足够的能量为其提供动力）"));
		this._clueList.push(new Clue(Curiosity.TIME_LOOP_DEVICE, "TLD_2", "跃迁塔", "挪麦人建造了特殊的塔楼，可以将塔内的任何人传送到相应的接收平台。只有当你能透过塔顶看到目的地时，才会传送"));
		this._clueList.push(new Clue(Curiosity.TIME_LOOP_DEVICE, "TLD_3", "大工程", "挪麦人挖掘了沙漏双星，建造了一台能够利用超新星能量的巨大装置\n\n控制中心位于行星中心的一个中空空腔内，与地表完全隔绝"));
	}

	init(): void
	{
		messenger.addObserver(this);
		this._isDead = false;
	}

	onReceiveGlobalMessage(message: Message): void
	{
		if (message.id === "learn launch codes" && !this._knowsLaunchCodes)
		{
			this._knowsLaunchCodes = true;
			feed.publish("已获取发射密码", true);
			messenger.sendMessage("spawn ship");
		}
		else if (message.id === "learn signal coordinates" && !this._knowsSignalCoordinates)
		{
			this._knowsSignalCoordinates = true;
			feed.publish("已获取信号坐标", true);
		}

		GameSave.saveData(this);
	}

	killPlayer(): void
	{
		this._isDead = true;

		GameSave.saveData(this);
	}

	isPlayerDead(): boolean
	{
		return this._isDead;
	}

	isPlayerAtEOTU(): boolean
	{
		return ((locator.player.currentSector == gameManager._solarSystem.quantumMoon && locator.getQuantumMoonLocation() == 4) || locator.player.currentSector == gameManager._solarSystem.eyeOfTheUniverse);
	}

	knowsFrequency(frequency: Frequency): boolean
	{
		return this._knownFrequencies.includes(frequency);
	}

	knowsSignalCoordinates(): boolean
	{
		return this._knowsSignalCoordinates;
	}

	learnFrequency(frequency: Frequency): void
	{
		if (!this.knowsFrequency(frequency))
		{
			this._knownFrequencies.push(frequency);
			feed.publish("频率已识别: " + frequencyToString(frequency), true);
		}

		GameSave.saveData(this);
	}

	getFrequencyCount(): number
	{
		return this._knownFrequencies.length;
	}

	knowsLaunchCodes(): boolean
	{
		return this._knowsLaunchCodes;
	}

	getClueAt(i: number): Clue
	{
		return this._clueList[i];
	}

	getClueCount(): number
	{
		return this._clueList.length;
	}

	getKnownClueCount(): number
	{
		return this._knownClueCount;
	}

	discoverClue(id: string): void
	{
		for (let i: number = 0; i < this._clueList.length; i++)
		{
			if (this._clueList[i].id === id && !this._clueList[i].discovered)
			{
				this._clueList[i].discovered = true;
				this._knownClueCount++;
				feed.publish("信息已添加至数据库", true);
			}
		}

		GameSave.saveData(this);
	}
}

export class Clue
{
	id: string;
	name: string;
	description: string;
	discovered: boolean;
	invoked: boolean = false;
	curiosity: Curiosity;

	constructor(curiosity: Curiosity, id: string, name: string, description: string)
	{
		this.curiosity = curiosity;
		this.id = id;
		this.name = name;
		this.description = description;
		this.discovered = false || START_WITH_CLUES;
	}
}
