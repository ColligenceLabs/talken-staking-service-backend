const {getKlaytnWeb3} = require('../../utils/awskms');
const {getLastEvents} = require('./crawler');
const {getWeb3} = require("../../utils/helper");
const models = require("../../models");

// load last checked block from file
async function loadConfFromDB() {
    // 설정된 chain id 별로 lastblock 조회 없을 경우 create
    // event crawler
    // ethereum
    const eventBlocks = {};

    const network = process.env.TARGET_NETWORK ?? '1001';
    let klaytnEventLastBlock = await models.lastblock.findByNetwork(network);
    if (!klaytnEventLastBlock) {
        if (network === '8217')
            klaytnEventLastBlock = 119540257;
        else if (network === '1001')
            klaytnEventLastBlock = 119876188;
        await models.lastblock.create({network, blocknumber: klaytnEventLastBlock})
    } else
        klaytnEventLastBlock = klaytnEventLastBlock.blocknumber;

    eventBlocks.klaytn = klaytnEventLastBlock;

    const lastBlocks = {
        event: eventBlocks
    }
    return lastBlocks;
}

async function getChainEvents(chainName, lastBlocks) {
    if (lastBlocks.event[chainName]) {
        const web3 = getWeb3();
        if (!web3) return;
        try {
            let toBlock = await web3.eth.getBlockNumber();
            if (lastBlocks.event[chainName]) {
                const lastBlockNumber = parseInt(lastBlocks.event[chainName]);
                // console.log('event', lastBlockNumber, toBlock, toBlock - lastBlockNumber, toBlock - lastBlockNumber > 1000);
                if (toBlock - lastBlockNumber > 1000) {
                    for (let to = lastBlockNumber + 1000; to <= toBlock; to += 1000) {
                        // console.log('111111', lastBlocks.event[chainName], to);
                        await getLastEvents(to, chainName);
                        lastBlocks.event[chainName] = to + 1;
                    }
                }
                // console.log('22222', lastBlocks.event[chainName], toBlock);
                await getLastEvents(toBlock, chainName);
                lastBlocks.event[chainName] = toBlock + 1;
            }
        } catch (e) {
            console.log(e);
        }
    }
}

async function main() {
    // init
    const lastBlocks = await loadConfFromDB();
    console.log('lastBlocks', lastBlocks);
    await getChainEvents('klaytn', lastBlocks);

    // set timer to get events every 2 seconds
    // setInterval(async function() {
    //     await getChainEvents('klaytn', lastBlocks);
    // }, 30000);
}

main();