// const collectionRepository = require('../../repositories/collection_repository');
// const lastblockRepository = require('../../repositories/lastblock_repository');
// const tradeRepository = require('../../repositories/trade_repository');
// const {NftModel, SerialModel, TransactionModel, ListenerModel, TradeModel} = require('../../models');
// const BigNumber = require('bignumber.js');
// const consts = require('../../utils/consts');
//
// const {getCoinPrice, getWeb3ByChainName, getChainId, getMarketAddress, getMarketContract, getQuote} = require('../../utils/helper');
//
// // convert hex result to address
// function hexToAddress(hexVal) {
//     return '0x' + hexVal.substr(-40);
// }

// get events
const models = require('../../models');
const {getWeb3} = require('../../utils/helper');
const web3 = getWeb3();
const {BigNumber} = require('@ethersproject/bignumber');
const {types} = require('../../config/constants');

const contracts = [
  '0xB52d73B2f86D63E1F707aC32cFD697fff2937954', // StKlay
  // '0x0013E63515fbCe7Ba92cF783c231C4844B97d118', // NodeManager
];

async function parseSharesChanged(eventData) {
  // StKlay Event : SharesChanged(address,uint256,uint256,uint256,uint8)
  if (eventData.topics[0] == '0x0e4033ca59159fed9e716efba93cc8fc4e08e122cce662e9449ef210cca29411') {
    let contractAddress = eventData.address.toLowerCase();
    const data = web3.eth.abi.decodeParameters(
      ['uint256', 'uint256', 'uint256', 'uint8'],
      eventData.data,
    );

    let user = web3.eth.abi.decodeParameters(['address'], eventData.topics[1])[0];
    let prevShares = data[0];
    let shares = data[1];
    let amount = data[2];
    let changeType = data[3]; // 1 stake, 2 unstake, 3 cancel, 4 transfer
    console.log('!! SharesChanged : ', user, prevShares, shares, amount, changeType);

    let transactionHash = eventData.transactionHash;
    try {
      const history = new models.histories();
      history.block_number = eventData.blockNumber;
      history.tx_hash = transactionHash;
      history.wallet = user;
      history.prev_shares = prevShares;
      history.shares = shares;
      history.amount = amount;
      history.type = types[changeType];

      await history.save();
    } catch (e) {
      console.log('saveHistory error:', e);
    }
  }
}

async function parseRestakedFromManager(eventData) {
  // StKlay Event : RestakedFromManager(uint256,uint256,uint256,uint256,uint256)
  if (eventData.topics[0] == '0x47c355b9d84fb97b1b36daa506b9fc8f856bb70659ec082640a13dc944dee214') {
    let contractAddress = eventData.address.toLowerCase();
    const data = web3.eth.abi.decodeParameters(
      ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
      eventData.data,
    );

    let totalRestaked = data[0];
    let amount = data[1];
    let increase = data[2];
    let totalStaking = data[3];
    let totalShares = data[4];
    let transactionHash = eventData.transactionHash;

    // const reward = BigNumber.from(data[1].toString())
    //   .mul(BigNumber.from('1000000000000000000000000000')) // <-- prevShares
    //   .div(BigNumber.from(data[3].toString())); // = 8.8 Klay
    // console.log('!! reward = ', reward.toString());

    console.log(
      '!! RestakedFromManager : ',
      totalRestaked,
      amount,
      increase,
      totalStaking,
      totalShares,
    );

    try {
      await models.rewards.createRewards(
        eventData.blockNumber,
        transactionHash,
        amount,
        increase,
        totalShares,
      );
    } catch (e) {
      console.log('createRewards error', e);
    }
  }
}

exports.getLastEvents = async function (toBlock, chainName) {
  console.log('=======getLastEvents start');
  let lastBlock = await models.lastblock.findByNetwork(process.env.TARGET_NETWORK ?? '1001');
  console.log(chainName, 'getLastEvents', lastBlock.blocknumber, toBlock);
  try {
    const result = await web3.eth
      .getPastLogs(
        {fromBlock: lastBlock.blocknumber, toBlock: toBlock, address: contracts},
        // {fromBlock: 120155776, toBlock: 120156637, address: contracts},
      );
      // .catch((e) => {
      //   console.log('collection contract getEvents', e);
      // });
    console.log('=====!!!!!', result);
    if (result) {
      lastBlock.blocknumber = toBlock + 1;
      await lastBlock.save();
      console.log(chainName + ' event last block update complete.', lastBlock.blocknumber);

      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          let contract = result[i].address;
          let contractAddress = contract.toLowerCase();
          if (result[i].topics) {
            await parseSharesChanged(result[i]);
            await parseRestakedFromManager(result[i]);
          }
        }
      }
    }
  } catch (e) {
    console.log('error ====> ', e);
  }
  console.log('getlastevent end');
};
