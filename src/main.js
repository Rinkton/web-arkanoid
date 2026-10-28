import { Application, Assets, Sprite, TextureSource, Container } from "pixi.js";

const gameScale = 2.5

/**
 * 
 * @param {*} texture Asset path where the png is placed
 * @param {*} x its x pos
 * @param {*} y its y pos
 * @param {*} container some container(e.g. app.stage or game)
 * @returns sprite
 */
async function createAndPlaceSprite(assetPath, x, y, container, anchor=0.5) {
  const texture = await Assets.load(assetPath);
  const sprite = new Sprite(texture);
  sprite.anchor.set(anchor); // center it
  sprite.position.set(x, y);
  
  container.addChild(sprite);
  
  return sprite;
}

(async () => {
  // Create a new application
  const app = new Application();
  // Initialize the application
  await app.init({ background: "#000000", resizeTo: window });
  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  // TO make it look ok for pixelart images
  const game = new Container();
  app.stage.addChild(game);
  game.scale.set(gameScale); 
  TextureSource.defaultOptions.scaleMode = 'nearest'; 

  const field = await createAndPlaceSprite(
    "/assets/field.png",
    0, 
    0,
    game,
    0
  )
  const bunny = await createAndPlaceSprite(
    "/assets/bunny.png",
    app.screen.width / 2, 
    app.screen.height / 2,
    game
  )
  const platform = await createAndPlaceSprite(
    "/assets/platform.png",
    field.width / 2, 
    field.height - 8,
    field
  )
  const ball = await createAndPlaceSprite(
    "/assets/ball.png",
    platform.x, 
    platform.y - platform.height,
    field
  )

  // Listen for animate update
  app.ticker.add((time) => {
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
