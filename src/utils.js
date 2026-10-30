import { Assets, Sprite, Texture, Rectangle, AnimatedSprite, Text } from "pixi.js";
import { Game } from "./main.js";

export class Utils {
    /**
   * 
   * @param {*} texture Asset path where the png is placed
   * @param {*} x its x pos
   * @param {*} y its y pos
   * @param {*} container some container(e.g. app.stage or game)
   * @returns sprite
   */
  static async createAndPlaceSprite(assetPath, x, y, container, anchor=0.5) {
    const texture = await Assets.load(assetPath);
    
    return await this.createAndPlaceSpriteByTexture(texture, x, y, container, anchor);
  }

  static async createAndPlaceSpriteByTexture(texture, x, y, container=null, anchor=0.5) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(anchor); // center it
    sprite.position.set(x, y);
    
    if (container != null) {
      container.addChild(sprite);
    }

    return sprite;
  }

  static async createAndPlaceAnimatedSprite(assetPath, cols, rows, x, y, container, animationSpeed, anchor=0.5) {
    const frames = await this.getFrames(assetPath, cols, rows)

    const anim = new AnimatedSprite(frames);

    anim.x = x;
    anim.y = y;
    anim.anchor.set(anchor);
    anim.animationSpeed = animationSpeed;

    container.addChild(anim);

    return anim;
  }

  static async getFrames(assetPath, cols, rows) {
    const baseTexture = await Assets.load(assetPath);

    const frameWidth = baseTexture.width / cols;
    const frameHeight = baseTexture.height / rows;

    const frames = [];

    // Cut the texture into frame
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const frameTexture = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(c * frameWidth, r * frameHeight, frameWidth, frameHeight)
        });
        
        frames.push(frameTexture);
      }
    }

    return frames;
  }

  static createAndPlaceText(content, x, y, container, anchor=0.5, fontFill='#ffffff', fontSize=48) {
    const text = new Text({
        text: content,
        style: {
            fontFamily: '"MS Gothic", "Fixedsys", monospace',
            fontSize: fontSize,
            fill: fontFill,
            align: 'center',
        },
        anchor: anchor
    });

    text.x = x;
    text.y = y;
    text.scale.set(1 / Game.gameScale); 

    container.addChild(text);

    return text
  }

  static objTop(what) {
    return what.y - what.height/2
  }

  static objRight(what) {
    return what.x + what.width/2
  }

  static objBottom(what) {
    return what.y + what.height/2
  }

  static objLeft(what) {
    return what.x - what.width/2
  }
}