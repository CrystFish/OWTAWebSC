import { Button } from "./Button";
import { Entity } from "./Entity";
import { Frequency } from "./Enums";
import { OWNode } from "./Node";
import { Sector } from "./Sector";
import { Vector2 } from "./Vector2";
import { frequencyToString, mediumFontData, playerData, smallFontData } from "./app";

export class FrequencyButton extends Button
{
	_rightFacing: boolean = true;

	constructor(rightFacing: boolean)
	{
		super("切换频率", width/2 + 140, 40, 50, 50);

		this._rightFacing = rightFacing;

		if (!rightFacing)
		{
			this.setScreenPosition(new Vector2(width/2 - 140, 40));
		}
		//_disabledPrompt = "Switch Frequency\n(none known)";
	}

	drawShape(): void
	{
		push();
		translate(this.screenPosition.x, this.screenPosition.y);

		if (this._rightFacing)
		{
			triangle(25, 0, 0, 15, 0, -15);
		}
		else
		{
			triangle(-25, 0, 0, 15, 0, -15);
		}

		pop();
	}

	drawText(alpha: number): void {}
}

export class Telescope
{
	_frequency: Frequency = Frequency.TRAVELER;
	_signalStrength: number;

	update(signalSources: SignalSource[]): void
	{
		this._signalStrength = 0;

		for (let i: number = 0; i < signalSources.length; i++)
		{
			this._signalStrength += signalSources[i].getSignalStrength(new Vector2(mouseX, mouseY), this._frequency);
		}
	}

	render(): void
	{
		let frequencyText: string = frequencyToString(this._frequency);

		if (!playerData.knowsFrequency(this._frequency))
		{
			if (this._frequency == Frequency.BEACON)
			{
				frequencyText = "未知频率 001";
			}
		    else if (this._frequency == Frequency.QUANTUM)
		    {
		    	frequencyText = "未知频率 002";
		    }
		}

		const xPos: number = width/2;

		fill(0, 0, 100);
		textSize(18);
		textFont(mediumFontData);
		text(frequencyText, xPos, 40);
		textFont(smallFontData);

		// draw signal feedback
		stroke(0, 0, 100);
		fill(200, 100, 100);
		rectMode(CENTER);
		rect(xPos, 70, max(0, this._signalStrength * 300 - random(50)), 7);

		// draw crosshairs
	    noFill();
	    stroke(0, 0, 100);
	    line(mouseX, 0, mouseX, height);
	    line(0, mouseY, width, mouseY);
	}

	nextFrequency(): void
	{
		const index: number = (this._frequency + 1) % this.getFrequencyValues().length;
		this._frequency = this.getFrequencyValues()[index];

		// if (!playerData.knowsFrequency(_frequency))
		// {
		// 	nextFrequency();
		// }
	}

	previousFrequency(): void
	{
		let index: number = this._frequency - 1;

		if (index < 0)
		{
			index = this.getFrequencyValues().length - 1;
		}

		this._frequency = this.getFrequencyValues()[index];

		// if (!playerData.knowsFrequency(_frequency))
		// {
		// 	previousFrequency();
		// }
	}

	getFrequencyValues(): Frequency[] {
		return Object.values(Frequency).filter(f => typeof f === 'number') as Frequency[]
	}
}

export class SignalSource extends Entity
{
	_signals: Signal[];

	constructor(node: OWNode)
	constructor(screenPosition: Vector2, sector: Sector)
	constructor(nodeOrPos: OWNode | Vector2, sector?: Sector)
	{
		super()
		if (nodeOrPos instanceof OWNode) {
			this.setScreenPosition(nodeOrPos.screenPosition);
			this._signals = new Array<Signal>();
			this._signals.push(nodeOrPos.getSignal());
		} else {
			this.setScreenPosition(nodeOrPos);
			this._signals = sector.getSectorSignals();
		}
	}

	addSignal(signal: Signal): void
	{
		this._signals.push(signal);
	}

	getSignalStrength(telescopePos: Vector2, frequency: Frequency): number
	{
		if (this.hasSignalWithFrequency(frequency))
		{
			const d: Vector2 = telescopePos.sub(this.screenPosition);
			const dist: number = d.magnitude();

			const u: number = max(0, 1 - (dist / 150));
			return u * u * u;
		}
		return 0;
	}

	hasSignalWithFrequency(frequency: Frequency): boolean
	{
		for (let i: number = 0; i < this._signals.length; i++)
		{
			if (this._signals[i].frequency == frequency)
			{
				return true;
			}
		}
		return false;
	}
}

export class Signal
{
	frequency: Frequency = Frequency.BEACON;

	constructor(signalType: string)
	{
		if (signalType === "QUANTUM")
		{
			this.frequency = Frequency.QUANTUM;
		}
		else if (signalType === "BEACON")
		{
			this.frequency = Frequency.BEACON;
		}
		else if (signalType === "TRAVELER")
		{
			this.frequency = Frequency.TRAVELER;
		}
	}
}