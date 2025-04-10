import { Font } from "p5";
import { AudioManager } from "./AudioManager";
import { Frequency } from "./Enums";
import { GameManager } from "./GameManager";
import { GlobalMessenger } from "./GlobalMessenger";
import { Locator } from "./Locator";
import { PlayerData } from "./PlayerData";
import { StatusFeed } from "./StatusFeed";
import { TimeLoop } from "./TimeLoop";
import { Minim, preloadAudio, preloadJSONObject, println } from "./compat";
import { GameSave } from "./GameSave";

/*** GLOBALS ***/
export const TEXT_SIZE: number = 14;

export let locator: Locator;
export let gameManager: GameManager;
export let timeLoop: TimeLoop;
export let messenger: GlobalMessenger;
export let feed: StatusFeed;
export let playerData: PlayerData;
 
export let minim: Minim;
export let audioManager: AudioManager;

/*** DEBUG ***/
export const EDIT_MODE: boolean = false;
export const SKIP_TITLE: boolean = false;
export const START_WITH_LAUNCH_CODES: boolean = false;
export const START_WITH_CLUES: boolean = false;
export const START_WITH_SIGNALS: boolean = false;
export const START_WITH_COORDINATES: boolean = false;

let lastMillis: number;
let deltaMillis: number;

export let smallFontData: Font;
export let mediumFontData: Font;

(window as any).preload = function preload(): void {
  smallFontData = loadFont("data/fonts/JiangChengYuanTi-400W.ttf");
  mediumFontData = loadFont("data/fonts/JiangChengYuanTi-400W.ttf");
  preloadAudio("data/audio/ow_kazoo_theme.mp3");
  preloadJSONObject("data/sectors/brittle_hollow.json");
  preloadJSONObject("data/sectors/comet.json");
  preloadJSONObject("data/sectors/dark_bramble.json");
  preloadJSONObject("data/sectors/eye_of_the_universe.json");
  preloadJSONObject("data/sectors/giants_deep.json");
  preloadJSONObject("data/sectors/quantum_moon.json");
  preloadJSONObject("data/sectors/rocky_twin.json");
  preloadJSONObject("data/sectors/sandy_twin.json");
  preloadJSONObject("data/sectors/timber_hearth.json");
};

(window as any).setup = function setup(): void
{
  const canvas = document.getElementById("game-canvas");
  createCanvas(960, 720, null, canvas);

  // Prevent p5 from setting canvas size, we do it in css.
  canvas.style.removeProperty("width");
  canvas.style.removeProperty("height");

  // Disable context menu on canvas,
  // to avoid interfering with game's right click.
  canvas.oncontextmenu = () => false;

  canvas.ontouchstart = (e) => {
    // Simulate right click on p5 when touching with a second finger
    mouseButton = e.touches.length === 2 ? RIGHT : LEFT;
  }

  const fullScreenButton = document.getElementById("full-screen-button");
  fullScreenButton.onclick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  noSmooth();
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  ellipseMode(CENTER);
  
  smallFont();
    
  minim = new Minim();

  initGame();
};

function initGame(): void
{
  const startLoadTime: number = millis();
  
  timeLoop = new TimeLoop();
  audioManager = new AudioManager();
  messenger = new GlobalMessenger();
  feed = new StatusFeed();
  gameManager = new GameManager();
  playerData =  GameSave.loadData();
  gameManager.newGame();
  
  println("Load time:", (millis() - startLoadTime));
}

(window as any).draw = function draw(): void
{
  gameManager.runGameLoop();

  // stroke(0, 0, 100);
  // fill(0, 0, 0);
  // triangle(mouseX, mouseY, mouseX, mouseY - 10, mouseX + 10, mouseY - 10);
  
  deltaMillis = millis() - lastMillis;
  lastMillis = millis();
  
  //println(deltaMillis);
};

export function frequencyToString(frequency: Frequency): string
{
  switch(frequency)
  {
    case Frequency.TRAVELER:
      return "旅行者频率";
    case Frequency.BEACON:
      return "求救信标";
    case Frequency.QUANTUM:
      return "量子波动";
    default:
      return "";
  }
}

export function resetLocator(): void {
  locator = new Locator();
}

export function smallFont(): void
{
  textSize(14);
  textFont(smallFontData);
}

export function mediumFont(): void
{
  textSize(18);
  textFont(mediumFontData);
}
