import { Application, Assets, Sprite, TextureSource, Container } from "pixi.js";
import { Utils } from "./utils.js";
import { Blocks } from "./blocks.js";

export class Game {
  static wallsWidth = 8;
  static gameScale = 2.5;

  constructor({container}) {
    this.container = container;
    this.platformSpeed = 3;
    this.ballReleased = false;
    this.ballSpeed = 2;
    this.ballYDir = -1;

    this.keys = {};
  }

  /**
   * Test For Hit
   * A basic AABB check between two different squares
   * (Took from official examples)
   */
  testForAABB(o1, o2, o1plusX, o1plusY) {
    const bounds1 = o1.getBounds();
    const bounds2 = o2.getBounds();

    return (
      bounds1.x + o1plusX < bounds2.x + bounds2.width &&
      bounds1.x + o1plusX + bounds1.width > bounds2.x &&
      bounds1.y + o1plusY < bounds2.y + bounds2.height &&
      bounds1.y + o1plusY + bounds1.height > bounds2.y
    );
  }

  /**
   * 
   * @param {*} plusX value that is gonna to be added to platform x position
   */
  isPlatformGonnaHitWall(plusX) {
    if (Utils.objLeft(this.platform) + plusX < Game.wallsWidth) {
      return true;
    }
    else if (Utils.objRight(this.platform) + plusX  > this.field.width - Game.wallsWidth) {
      return true;
    }

    return false;
  }

  /**
   * 
   * @param {*} plusX value that is gonna to be added to ball x position
   * @returns number from 0 to 1, which is fraction of distance the ball can move after it hit the wall
   * or -1 i there's nothing on the way
   */
  getBallWallFraction(plusX) {
    const exp1 = Utils.objLeft(this.ball) - plusX;
    const exp2 = Utils.objLeft(this.ball) + plusX;

    if (exp1 < Game.wallsWidth) {
      return (Game.wallsWidth - exp1) / Math.abs(plusX);
    }
    else if (exp2 > this.field.width - Game.wallsWidth) {
      return (exp2 - (this.field.width - Game.wallsWidth)) / Math.abs(plusX);
    }

    return -1;
  }

  /**
   * 
   * @param {*} plusY value that is gonna to be added to ball y position
   * @returns number from 0 to 1, which is fraction of distance the ball can move after it hit the ceiling
   * or -1 i there's nothing on the way
   */
  getBallCeilingFraction(plusY) {
    const exp = Utils.objTop(this.ball) + plusY;

    if (exp < Game.wallsWidth) {
      return Math.abs(exp - Game.wallsWidth) / Math.abs(plusY);
    }

    return -1;
  }

    /**
   * 
   * @param {*} plusX value that is gonna to be added to ball x position
   * @param {*} plusY value that is gonna to be added to ball y position
   * @returns number from 0 to 1, which is fraction of distance the ball can move after it hit the platform
   * or -1 i there's nothing on the way
   */
  getBallPlatformFraction(plusX, plusY) {
    const yleft1 = Utils.objBottom(this.ball) + plusY;
    const yright1 = Utils.objTop(this.platform);
    const yleft2 = Utils.objTop(this.ball) + plusY;
    const yright2 = Utils.objBottom(this.platform);
    const ycond = yleft1 >= yright1 && yleft2 <= yright2;
    const xleft = Math.abs(this.ball.x - this.platform.x + plusX); // x distance from ball to platform
    const xright = this.ball.width/2 + this.platform.width/2; // radius of collision
    const xcond = xleft <= xright

    if (ycond && xcond) {
      return 1 // without fraction mechanism
    }

    return -1;
  }

  getBallBlockFraction(plusX, plusY) {
    for (const block of this.blocks) {
      if (block != null && this.testForAABB(this.ball, block, plusX, plusY)) {
        return { blockFraction: 1, block };
      }
    }
    return { blockFraction: -1, block: null };
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
        this.platform.x = Game.wallsWidth + this.platform.width/2;
      }
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      const plusX = this.platformSpeed * time.deltaTime;
      if (!this.isPlatformGonnaHitWall(plusX)) {
        this.platform.x += plusX;
      }
      else {
        this.platform.x = this.field.width - Game.wallsWidth - this.platform.width/2;
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

  async handleBall(time) {
    if (!this.ballReleased) {
      this.ball.x = this.platform.x;
    }
    else {
      const plusX = this.ballSpeed * this.ballXDir * time.deltaTime;
      const plusY = this.ballSpeed * this.ballYDir * time.deltaTime;
      const wallFraction = this.getBallWallFraction(plusX);
      const ceilingFraction = this.getBallCeilingFraction(plusY);
      const platformFraction = this.getBallPlatformFraction(plusX, plusY)
      const { blockFraction, block } = this.getBallBlockFraction(plusX, plusY);

      if (wallFraction != -1 || ceilingFraction != -1 || platformFraction != -1 || blockFraction != -1) {
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
        else if (platformFraction != -1) {
          this.moveBall(1 - platformFraction, time);
          if (Utils.objBottom(this.ball) > Utils.objTop(this.platform)) {
            // when hitting the edges of the platform
            this.ballXDir = -this.ballXDir
            this.ballYDir = -this.ballYDir
          }
          else {
            this.ballYDir = -this.ballYDir
          }
          this.moveBall(platformFraction, time);
        }
        else if (blockFraction != -1) {
          const isHorizontalCollision = this.ball.y < Utils.objBottom(block) && 
            this.ball.y > Utils.objTop(block);

          this.moveBall(1 - blockFraction, time);
          if (isHorizontalCollision) {
            this.ballXDir = -this.ballXDir
          }
          else {
            this.ballYDir = -this.ballYDir
          }

          if (block.customData['type'] == 'simple') {
            this.blocks[this.blocks.indexOf(block)] = null;
            block.destroy();
          }

          const allBlocksDestroyed = this.blocks.filter(block => block === null).length == this.blocks.length;
          if (allBlocksDestroyed) {
            this.winText.visible = true;
          }
          this.moveBall(blockFraction, time);
        }
      }
      else {
        this.moveBall(1, time)
      }

      // if the top of the ball is lower than the bottom of the platform, then the player lost the game
      if (Utils.objTop(this.ball) > Utils.objBottom(this.platform) && !this.gameOver) {
        this.gameOver = true;
        this.ballSpeed = 0;
        this.platform.visible = false;
        const platformDestroyed = await Utils.createAndPlaceAnimatedSprite(
          "/assets/platformDestroyed.png", 3, 1, this.platform.x, this.platform.y, this.game, 0.25)
        platformDestroyed.loop = false;
        platformDestroyed.onComplete = () => {
            platformDestroyed.destroy();
        };
        platformDestroyed.play()
        if (!this.winText.visible) {
          this.loseText.visible = true
        }
      }
    }
  }

  async initObjects() {
    this.field = await Utils.createAndPlaceSprite(
      "/assets/field.png",
      0, 
      0,
      this.game,
      0
    )
    this.bunny = await Utils.createAndPlaceSprite(
      "/assets/bunny.png",
      this.app.screen.width / 2, 
      this.app.screen.height / 2,
      this.game
    )
    this.platform = await Utils.createAndPlaceSprite(
      "/assets/platform.png",
      this.field.width / 2, 
      this.field.height - 8,
      this.field
    )
    this.ball = await Utils.createAndPlaceSprite(
      "/assets/ball.png",
      this.platform.x, 
      this.platform.y - this.platform.height,
      this.field
    )
    this.blocks = await Blocks.spawnBlocks(this.field);
    this.loseText = Utils.createAndPlaceText(
      "YOU LOST!", 
      this.field.width/2, 
      this.field.height/2, 
      this.field, 0.5, "#B53121"
    )
    this.loseText.style.fontWeight = 'bold';
    this.winText = Utils.createAndPlaceText(
      "YOU WON!", 
      this.field.width/2, 
      this.field.height/2, 
      this.field, 0.5, "#8CD600"
    )
    this.winText.style.fontWeight = 'bold';
    this.loseText.visible = false;
    this.winText.visible = false;
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
    this.game.scale.set(Game.gameScale); 
    TextureSource.defaultOptions.scaleMode = 'nearest';
    

    this.keys = {};
    this.runKeyListener();

    await this.initObjects();
    
    this.tick = (ticker) => this.update(ticker);
    this.app.ticker.add(this.tick);
  }

  async update(time) {
    this.control(time)
    await this.handleBall(time)
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
