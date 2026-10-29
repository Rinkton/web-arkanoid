import { Assets, Sprite} from "pixi.js";

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
}