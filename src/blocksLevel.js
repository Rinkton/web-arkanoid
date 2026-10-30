import { Utils } from "./utils";
import { Game } from "./main.js";
import { Blocks } from "./blocks.js";

export class BlocksLevel {
    static simpleTypes = ['red', 'blue', 'orange', 'pink', 'green'];
    static blockWidth = 16;
    static blockHeight = 8;

    constructor() {
        this.blocks = [];
    }

    async fillRows(type, count) {
        for (let i = 0; i < count; i++) {
            this.fillRow(type);
        }
    }
    
    async fillRow(type) {
        if (BlocksLevel.simpleTypes.includes(type)) {
            for (let i = 0; i < Blocks.maxBlocksInRow; i++) {
                const { x, y } = this.getCurrentPosition();
                const block = await this.getSimpleBlock(type, x, y);
                this.blocks.push(block);
            }
        }
        else if (type == 'empty') {
            for (let i = 0; i < Blocks.maxBlocksInRow; i++) {
                this.blocks.push(null);
            }
        }
        else {
            console.log("Trying to fillRow with unknown type!")
        }
    }

    async getSimpleBlock(type, x, y) {
        const textures = await Utils.getFrames("/assets/blocks.png", 1, 5);
        const texture = textures[BlocksLevel.simpleTypes.indexOf(type)];
        const sprite = await Utils.createAndPlaceSpriteByTexture(texture, x, y);
        sprite.customData = { "type": "simple" }

        return sprite
    }

    getCurrentPosition() {
        const y = Game.wallsWidth + BlocksLevel.blockHeight/2 + BlocksLevel.blockHeight * 
            Math.floor(this.blocks.length / Blocks.maxBlocksInRow);
        const remaining = this.blocks.length % Blocks.maxBlocksInRow;
        const x = Game.wallsWidth + BlocksLevel.blockWidth/2 + BlocksLevel.blockWidth * remaining

        return {x, y}
    }
}