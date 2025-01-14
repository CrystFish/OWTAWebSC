# Outer Wilds Text Adventure - 汉化网页版（施工中）

A port of the Java-based [Outer Wilds Text Adventure](https://www.mobiusdigitalgames.com/outer-wilds-text-adventure.html) to the web. Play it live in your browser at [hawk.bar/OuterWildsTextAdventureWeb](https://hawk.bar/OuterWildsTextAdventureWeb).

## Technical Details

The original game is written in Java, and the source code and assets for it are included in the downloaded zip files containing the game. This made it possible to port the game to other platforms and languages.

For the web port, the Java source code files were renamed to .ts (TypeScript) files and then edited line by line to convert the syntax to the new language. The largest issues encountered were:
- Implicit class field accesses (e.g. simply `_myVar` instead of JavaScript's `this._myVar`), which required reviewing each variable reference by hand and adding `this.` where necessary. This was time-consuming but reasonably easy since the source code had no ambiguous usage.
- Method overloads, especially with constructors, as JavaScript functions can only have a single implemention. These methods were rewritten into equivalent singular implementations using TypeScript's type unions and optional parameters.
- The C-style type declarations (e.g. `String foo` instead of TypeScript's `foo: string`), which was addressed through aggressive Regex find-and-replace.

The Java version of this game uses the [Processing](https://processing.org/) engine, which is a lightweight 'game engine' designed for creating graphical sketches and interactive visual demonstrations. The Processing Foundation also has a JavaScript version of this engine, [p5.js](https://p5js.org/), which has an extremely similar API, although obviously written for a different language. This meant that once the language syntax was converted, most functionality worked identically out of the box with no additional implementation code.

A few methods and helper classes that did not have perfect equivalents in p5.js were written from scratch and placed in `compat.ts`.

# Copyright Notice

All assets and the original source code belong to their original copyright holders. The authors of this project make no claim to the copyright of said assets or source code, including any derivative material.

This project is intended for educational purposes only.

The authors of this project will comply with any requests from the copyright holders.
