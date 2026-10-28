import { Application, Assets, Sprite, TextureSource, Container } from "pixi.js";

const gameScale = 2.5
const wallsWidth = 8
const platformSpeed = 3

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

/**
 * Test For Hit
 * A basic AABB check between two different squares
 * (Took from official examples)
 */
function testForAABB(object1, object2) { // gonna be used for collision of ball and platform
  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();

  return (
    bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height &&
    bounds1.y + bounds1.height > bounds2.y
  );
}

/**
 * 
 * @param {*} platform 
 * @param {*} field 
 * @param {*} plusX value that is gonna to be added to platform x position
 */
function isPlatformGonnaHitWall(platform, field, plusX) {
  if (platform.x + plusX - platform.width/2 < wallsWidth) {
    return true;
  }
  else if (platform.x + plusX + platform.width/2 > field.width - wallsWidth) {
    return true;
  }

  return false;
}

function runKeyListener(keys) {
  window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
  });

  window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
  });
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

  const keys = {};
  runKeyListener(keys);

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
    if (keys['KeyA'] || keys['ArrowLeft']) {
        const plusX = -platformSpeed * time.deltaTime;
        if (!isPlatformGonnaHitWall(platform, field, plusX)) {
          platform.x += plusX;
        }
        else {
          platform.x = wallsWidth + platform.width/2;
        }
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        const plusX = platformSpeed * time.deltaTime;
        if (!isPlatformGonnaHitWall(platform, field, plusX)) {
          platform.x += plusX;
        }
        else {
          platform.x = field.width - wallsWidth - platform.width/2;
        }
    }
  });
})();
