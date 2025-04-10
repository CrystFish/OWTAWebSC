import { Button } from "./Button";
import { DatabaseObserver } from "./DatabaseScreen";
import { ExploreData } from "./ExploreData";
import { OWNode } from "./Node";
import { Clue } from "./PlayerData";
import { OWScreen } from "./Screen";
import { feed, timeLoop, gameManager, locator, mediumFontData } from "./app";

export class ExploreScreen extends OWScreen implements DatabaseObserver
{
	static BOX_WIDTH: number = 700;
	static BOX_HEIGHT: number = 400;
	_exploreData: ExploreData;

	_databaseButton: Button;
	_backButton: Button;
	_waitButton: Button;

	constructor(location: OWNode)
	{
		super();
		this._exploreData = location.getExploreData();
		this.overlay = true; // continue to render BG

		this.addButtonToToolbar(this._databaseButton = new Button("查看数据库", 0, 0, 150, 50));
		this.addButtonToToolbar(this._waitButton  = new Button("等待 [ 1分钟 ]", 0, 0, 150, 50));
		this.addButtonToToolbar(this._backButton = new Button("继续", 0, 0, 150, 50));

		this._exploreData.parseJSON();
	}

	update(): void{}

	renderBackground(): void {}

	render(): void
	{
		push();
		translate(width / 2 - ExploreScreen.BOX_WIDTH / 2, height / 2 - ExploreScreen.BOX_HEIGHT / 2);

		stroke(0, 0, 100);
		fill(0, 0, 0);
		rectMode(CORNER);
		rect(0, 0, ExploreScreen.BOX_WIDTH, ExploreScreen.BOX_HEIGHT);

		fill(0, 0, 100);

		textFont(mediumFontData);
		textSize(18);
		textAlign(LEFT, TOP);

		const exploreText = this._exploreData.getExploreText();
		const wrappedLines = this.wrapText(exploreText, ExploreScreen.BOX_WIDTH - 20); // 自动换行处理

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

	onEnter(): void {}

	onExit(): void {}

	onInvokeClue(clue: Clue): void
	{
		// try to invoke it on the node first
		if (this._exploreData.canClueBeInvoked(clue.id))
		{
			// force-quit the database screen
			gameManager.popScreen();
			this._exploreData.invokeClue(clue.id);
			this._exploreData.explore();
		}
		// next try the whole sector
		else if (locator.player.currentSector != null && locator.player.currentSector.canClueBeInvoked(clue))
		{
			gameManager.popScreen();
			locator.player.currentSector.invokeClue(clue);
		}
		else
		{
			feed.publish("那个现在还不能帮助到你", true);
		}
	}

	onButtonUp(button: Button): void
	{
		if (button == this._databaseButton)
	    {
	      gameManager.pushScreen(gameManager.databaseScreen);
	      gameManager.databaseScreen.setObserver(this);
	    }
	    else if (button == this._backButton)
	    {
	    	gameManager.popScreen();
	    }
	    else if (button == this._waitButton)
	    {
	    	timeLoop.waitFor(1);
	    	this._exploreData.explore();
	    }
	}

	onButtonEnterHover(button: Button): void{}
	onButtonExitHover(button: Button): void{}
}