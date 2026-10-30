import { BlocksLevel } from "./blocksLevel";

export class Blocks {
    static maxBlocksInRow = 11;

    static async spawnBlocks(container) {
        const blocksLevel = new BlocksLevel();

        await blocksLevel.fillRows('empty', 4);
        await blocksLevel.fillRow('red');
        await blocksLevel.fillRow('blue');
        await blocksLevel.fillRow('orange');
        await blocksLevel.fillRow('pink');
        await blocksLevel.fillRow('green');

        const blocks = blocksLevel.build();
        this.placeBlocks(blocks, container);

        return blocks;
    }

    static placeBlocks(blocks, container) {
        blocks.forEach(function(b) {
            if (b != null) {
                container.addChild(b);
            }
        });
    }
}