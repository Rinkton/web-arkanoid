import { Application, Assets, Sprite, TextureSource, Container } from "pixi.js";

const gameScale = 4

/**
 * 
 * @param {*} texture Asset path where the png is placed
 * @param {*} x its x pos
 * @param {*} y its y pos
 * @param {*} container some container(e.g. app.stage or game)
 * @returns sprite
 */
async function createAndPlaceSprite(assetPath, x, y, container) {
  const texture = await Assets.load(assetPath);
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5); // center it
  sprite.position.set(x / gameScale, y / gameScale);
  
  container.addChild(sprite);
  
  return sprite;
}

(async () => {
  // Create a new application
  const app = new Application();
  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });
  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  // TO make it look ok for pixelart images
  const game = new Container();
  app.stage.addChild(game);
  game.scale.set(gameScale); 
  TextureSource.defaultOptions.scaleMode = 'nearest'; 

  const bunny = await createAndPlaceSprite(
    "/assets/bunny.png",
    app.screen.width / 2, 
    app.screen.height / 2,
    game
  )
  const platform = await createAndPlaceSprite(
    "/assets/platform.png",
    app.screen.width / 4, 
    app.screen.height / 4,
    game
  )
  const ball = await createAndPlaceSprite(
    "/assets/platform.png",
    app.screen.width / 4, 
    app.screen.height / 4,
    game
  )

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
