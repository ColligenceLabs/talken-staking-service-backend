const {getKlaytnKmsWeb3} = require('../../utils/awskms');
const {getLastEvents} = require('./crawler');
const {getWeb3} = require("../../utils/helper");
const models = require("../../models");
const collectionAbi = require("../../config/abi/collection.json");
const {BigNumber} = require("@ethersproject/bignumber");

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
        try {
            const web3 = getWeb3();
            if (!web3) return;
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

async function transferRewards() {
    console.log('transfer rewards');
    const web3 = getKlaytnKmsWeb3();
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);

    const toAddress = '0x57fBfa7C25D5C701E86484E19BFb9df9dCAe6D40';
    const nonce = await web3.eth.getTransactionCount(accounts[0]);
    const gasPrice = await web3.eth.getGasPrice();

    const value = web3.utils.toWei('0.1', 'ether');
    const gasLimit = await web3.eth.estimateGas({
        to: toAddress,
        from: accounts[0],
        value: value
    }).catch((e) => {
        console.log(e);
    }); // the used gas for the simulated call/transaction (,,21000)
    console.log('2222222', accounts, balance);
    const txObject = {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        to: toAddress,
        from: accounts[0],
        value: value
    };
    // console.log('333333', nonce, gasPrice, gasLimit, value);
    const {status, transactionHash, message} = await web3.eth.sendTransaction(txObject);
    console.log(status, transactionHash, message);
}

async function main() {
    try {
        // init
        const lastBlocks = await loadConfFromDB();
        console.log('lastBlocks', lastBlocks);
        await getChainEvents('klaytn', lastBlocks);

        // set timer to get events every 2 seconds
        setInterval(async function() {
            await getChainEvents('klaytn', lastBlocks);
        }, 10000);

        // transfer rewards
        setInterval(async function() {
            await transferRewards();
        }, 5 * 60 * 1000);
    } catch (e) {
        console.log('crawler error', e);
    }
}

main();