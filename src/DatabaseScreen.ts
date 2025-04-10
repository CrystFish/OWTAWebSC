import { Color } from "p5";
import { Button } from "./Button";
import { Entity } from "./Entity";
import { Curiosity } from "./Enums";
import { Clue } from "./PlayerData";
import { OWScreen } from "./Screen";
import { playerData, feed, gameManager, mediumFontData } from "./app";

export interface DatabaseObserver
{
  onInvokeClue(clue: Clue): void;
}

export class DatabaseScreen extends OWScreen implements ClueButtonObserver
{
  _clueRoot: Entity;
  _activeClue: Clue;
  _observer: DatabaseObserver;

  constructor()
  {
    super();
    this.addButtonToToolbar(new Button("关闭数据库",  0, 0, 150, 50));
    this._clueRoot = new Entity(100, 140);

    // create clue buttons using PlayerData's list of clues
    for (let i: number = 0; i < playerData.getClueCount(); i++)
    {
      const clueButton: ClueButton = new ClueButton(playerData.getClueAt(i), i * 40, this);
      this.addButton(clueButton);
      this._clueRoot.addChild(clueButton);
    }
  }

  setObserver(observer: DatabaseObserver): void
  {
    this._observer = observer;
  }

  onEnter(): void
  {
  }

  onExit(): void
  {
    this._observer = null;
  }

  onClueMouseOver(clue: Clue): void
  {
    this._activeClue = clue;
  }

  onClueSelected(clue: Clue): void
  {
    if (this._observer != null)
    {
      this._observer.onInvokeClue(clue);
    }
    else
    {
      feed.publish("那个现在还不能帮助到你", true);
    }
  }

  onButtonUp(button: Button): void
  {
    if (button.id == "关闭数据库")
    {
      gameManager.popScreen();
    }
  }

  update(): void {}

  render(): void
  {
    fill(0, 0, 0);
    stroke(0, 0, 100);

    rectMode(CORNER);

    const x: number = width/2 - 100;
    const y: number = 200;
    const w: number = 500;
    const h: number = 300;

    rect(x, y, w, h);

    let _displayText: string = "选择一项条目";

    if (this._activeClue != null)
    {
      _displayText = this._activeClue.description;
    }
    else if (playerData.getKnownClueCount() == 0)
    {
      _displayText = "暂无条目";
    }

    textFont(mediumFontData);
    textSize(18);
    textAlign(LEFT, TOP);
    fill(0, 0, 100);

    // 自动换行处理
    const wrappedLines = this.wrapText(_displayText, w - 20);

    let currentY = y + 10; // 初始 y 坐标
    const lineHeight = 24; // 行高

    for (const line of wrappedLines) {
        if (line === "") {
            // 如果是空行，增加 y 坐标，保留空行
            currentY += lineHeight;
        } else {
            text(line, x + 10, currentY); // 绘制每一行文本
            currentY += lineHeight; // 增加 y 坐标，确保下一行不会重叠
        }
    }

    feed.render();
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
}

export interface ClueButtonObserver
{
  onClueSelected(clue: Clue): void;
  onClueMouseOver(clue: Clue): void;
}

export class ClueButton extends Button
{
  _clue: Clue;
  _clueObserver: ClueButtonObserver;

  constructor(clue: Clue, y: number, observer: ClueButtonObserver)
  {
    super(clue.name, (textWidth(clue.name) + 10) * 0.5, y, textWidth(clue.name) + 10, 20);
    this._clue = clue;
    this._clueObserver = observer;
  }

  getClue(): Clue
  {
    return this._clue;
  }

  update(): void
  {
    this.enabled = this._clue.discovered;
    this.visible = this._clue.discovered;
    super.update();
  }

  draw(): void
  {
    if (!this.visible) {return;}
    
    super.draw();

    let symbolColor: Color;

    if (this._clue.curiosity == Curiosity.VESSEL)
    {
        symbolColor = color(100, 100, 100);
    }
    else if (this._clue.curiosity == Curiosity.ANCIENT_PROBE_LAUNCHER)
    {
      symbolColor = color(200, 100, 100);
    }
    else if (this._clue.curiosity == Curiosity.TIME_LOOP_DEVICE)
    {
      symbolColor = color(20, 100, 100);
    }
    else
    {
      symbolColor = color(300, 100, 100);
    }

    fill(symbolColor);
    noStroke();
    ellipse(this.screenPosition.x - this._bounds.x * 0.5 - 20, this.screenPosition.y, 10, 10);

    noFill();
    stroke(symbolColor);
    ellipse(this.screenPosition.x - this._bounds.x * 0.5 - 20, this.screenPosition.y, 15, 15);
  }

  onButtonEnterHover(): void
  {
    this._clueObserver.onClueMouseOver(this._clue);
  }

  onButtonUp(): void
  {
    this._clueObserver.onClueSelected(this._clue);
  }
}