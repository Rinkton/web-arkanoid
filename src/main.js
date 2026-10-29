import { Application, Assets, Sprite, TextureSource, Container } from "pixi.js";

class Game {
  constructor({container}) {
    this.container = container;
    this.gameScale = 2.5;
    this.wallsWidth = 8;
    this.platformSpeed = 3;
    this.ballReleased = false;
    this.ballSpeed = 3;
    this.ballYDir = -1;

    this.keys = {};
  }

  /**
   * 
   * @param {*} texture Asset path where the png is placed
   * @param {*} x its x pos
   * @param {*} y its y pos
   * @param {*} container some container(e.g. app.stage or game)
   * @returns sprite
   */
  async createAndPlaceSprite(assetPath, x, y, container, anchor=0.5) {
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
  testForAABB(object1, object2) { // gonna be used for collision of ball and platform
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
   * @param {*} plusX value that is gonna to be added to platform x position
   */
  isPlatformGonnaHitWall(plusX) {
    if (this.platform.x + plusX - this.platform.width/2 < this.wallsWidth) {
      return true;
    }
    else if (this.platform.x + plusX + this.platform.width/2 > this.field.width - this.wallsWidth) {
      return true;
    }

    return false;
  }

  /**
   * 
   * @param {*} plusX value that is gonna to be added to ball x position
   */
  getBallWallFraction(plusX) {
    const exp1 = this.ball.x + plusX - this.ball.width/2;
    const exp2 = this.ball.x + plusX + this.ball.width/2;

    if (exp1 < this.wallsWidth) {
      return (this.wallsWidth - exp1) / Math.abs(plusX);
    }
    else if (exp2 > this.field.width - this.wallsWidth) {
      return (exp2 - (this.field.width - this.wallsWidth)) / Math.abs(plusX);
    }

    return -1;
  }

  /**
   * 
   * @param {*} plusY value that is gonna to be added to ball y position
   * @returns 
   */
  getBallCeilingFraction(plusY) {
    const exp = this.ball.y + plusY - this.ball.height/2;

    if (exp < this.wallsWidth) {
      return Math.abs(exp - this.wallsWidth) / Math.abs(plusY);
    }

    return -1;
  }

  runKeyListener() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  control(time) {
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      const plusX = -this.platformSpeed * time.deltaTime;
      if (!this.isPlatformGonnaHitWall(plusX)) {
        this.platform.x += plusX;
      }
      else {
        this.platform.x = this.wallsWidth + this.platform.width/2;
      }
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      const plusX = this.platformSpeed * time.deltaTime;
      if (!this.isPlatformGonnaHitWall(plusX)) {
        this.platform.x += plusX;
      }
      else {
        this.platform.x = this.field.width - this.wallsWidth - this.platform.width/2;
      }
    }

    if (!this.ballReleased && (this.keys['KeyW'] || this.keys['ArrowUp'])) {
        this.ballXDir = Math.random() < 0.5 ? 1 : -1; // Chooses randomly 1 or -1
        this.ballReleased = true;
      }
  }

  moveBall(fraction, time) {
    const plusX = this.ballSpeed * this.ballXDir * time.deltaTime;
    const plusY = this.ballSpeed * this.ballYDir * time.deltaTime;
    this.ball.x += plusX * fraction;
    this.ball.y += plusY * fraction;
  }

  handleBall(time) {
    if (!this.ballReleased) {
      this.ball.x = this.platform.x;
    }
    else {
      const plusX = this.ballSpeed * this.ballXDir * time.deltaTime;
      const plusY = this.ballSpeed * this.ballYDir * time.deltaTime;
      const wallFraction = this.getBallWallFraction(plusX);
      const ceilingFraction = this.getBallCeilingFraction(plusY);

      if (wallFraction != -1 || ceilingFraction != -1) {
        if (wallFraction != -1) {
          this.moveBall(1 - wallFraction, time);
          this.ballXDir = -this.ballXDir
          this.moveBall(wallFraction, time);
        }
        else if (ceilingFraction != -1) {
          this.moveBall(1 - ceilingFraction, time);
          this.ballYDir = -this.ballYDir
          this.moveBall(ceilingFraction, time);
        }
      }
      else {
        this.moveBall(1, time)
      }
    }
  }

  async initObjects() {
    this.field = await this.createAndPlaceSprite(
      "/assets/field.png",
      0, 
      0,
      this.game,
      0
    )
    this.bunny = await this.createAndPlaceSprite(
      "/assets/bunny.png",
      this.app.screen.width / 2, 
      this.app.screen.height / 2,
      this.game
    )
    this.platform = await this.createAndPlaceSprite(
      "/assets/platform.png",
      this.field.width / 2, 
      this.field.height - 8,
      this.field
    )
    this.ball = await this.createAndPlaceSprite(
      "/assets/ball.png",
      this.platform.x, 
      this.platform.y - this.platform.height,
      this.field
    )
  }

  async init () {
    // Create a new application
    this.app = new Application();
    // Initialize the application
    await this.app.init({ background: "#000000", resizeTo: window });
    // Append the application canvas to the document body
    this.container.appendChild(this.app.canvas);

    // TO make it look ok for pixelart images
    this.game = new Container();
    this.app.stage.addChild(this.game);
    this.game.scale.set(this.gameScale); 
    TextureSource.defaultOptions.scaleMode = 'nearest'; 

    this.keys = {};
    this.runKeyListener();

    await this.initObjects();
    
    this.tick = (ticker) => this.update(ticker);
    this.app.ticker.add(this.tick);
  }

  update(time) {
    this.control(time)
    this.handleBall(time)
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup',   this.onKeyUp);
    this.app?.ticker.remove(this.tick);
    this.app?.destroy(true, { children: true });
    this.app = null;
  }
}

const game = new Game({ container: document.getElementById("pixi-container") });
await game.init();
