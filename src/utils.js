import { Assets, Sprite, Texture, Rectangle, AnimatedSprite } from "pixi.js";

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
    const sprite = new Sprite(texture);
    sprite.anchor.set(anchor); // center it
    sprite.position.set(x, y);
    
    container.addChild(sprite);
    
    return sprite;
  }

  static async createAndPlaceAnimatedSprite(assetPath, cols, rows, x, y, container, animationSpeed, anchor=0.5) {
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

    const anim = new AnimatedSprite(frames);

    anim.x = x;
    anim.y = y;
    anim.anchor.set(anchor);
    anim.animationSpeed = animationSpeed;

    container.addChild(anim);

    return anim;
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