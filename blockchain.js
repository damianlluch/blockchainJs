var Block = require("./block.js")
var MinerReward = require("./minerReward.js");

class Blockchain {
    constructor(miner, difficulty) {
        this.miner = miner;
        this.pendingDocuments = [];
        this.difficulty = difficulty;
        this.miningReward = 100; // reward to miner

        this.chain = [];
    }

    createGenesisBlock() {
        this.add({ type: 'genesis block' });
        this.minePendingTransaction(); // mine genesis block
    }

    find(document) {
        var other = this.pendingDocuments.find(d => d == document);
        return other;
    }

    add(document) {
        this.pendingDocuments.push(document);
        return document;
    }

    getBalanceOfAddress(account) {
        let balance = 0;
        for (const block of this.chain) {
            for (const document of block.documents) {
                if (document.from === account)
                    balance -= document.ammount;
                else if (document.to === account)
                    balance += document.ammount;
            }
        }

        for (const document of this.pendingDocuments) {
            if (document.from === account)
                balance -= document.ammount;
            else if (document.to === account)
                balance += document.ammount;
        }

        return balance;
    }

    minePendingTransaction() {
        if (this.pendingDocuments.length == 0) {
            console.log("no documents to mine");
            return;
        }

        var reward = new MinerReward(this.miner.account, this.miningReward);
        this.add(reward);

        console.log(`mining ${this.pendingDocuments.length} documents`);
        var last = this.getLatestBlock() || { index: -1, hash: "" };

        var block = new Block(Date.now(), this.pendingDocuments);
        block.index = last.index + 1;
        block.previousHash = last.hash;

        this.miner.mine(block, this.difficulty);

        console.log("Block mined!");
        this.chain.push(block);
        this.pendingDocuments = [];

        return block;
    }

    getLatestBlock() {
        return this.chain.length !== 0
            ? this.chain[this.chain.length - 1]
            : undefined;
    }

    isValid() {
        for (const block of this.chain) {
            if (!this.isValidBlock(block)) {
                return false;
            }
        }
        return true;
    }

    isValidBlock(block) {
        var previousBlock = this.chain[block.index - 1];
        if (previousBlock && previousBlock.index + 1 !== block.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock && previousBlock.hash !== block.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (block.calculateHash() !== block.hash) {
            console.log('invalid hash: ' + block.calculateHash() + ' ' + block.hash);
            return false;
        }
        return true;
    }
}

module.exports = Blockchain;