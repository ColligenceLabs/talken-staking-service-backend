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
const {types} = require("../../config/constants");

const contracts = [
  '0x99f2a8cf094345DD5C07A61dA6E1f32b7FCBeA23', // StKlay
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
  // StKlay Event : RestakedFromManager(uint256,uint256,uint256,uint256)
  if (eventData.topics[0] == '0xbe925ea73f84fbf40768382f9842e5041363e6983747d2c6c9f6d3a377265764') {
    let contractAddress = eventData.address.toLowerCase();
    const data = web3.eth.abi.decodeParameters(
      ['uint256', 'uint256', 'uint256', 'uint256'],
      eventData.data,
    );

    let totalRestaked = data[0];
    let amount = data[1];
    let totalStaking = data[2];
    let totalShares = data[3];
    let transactionHash = eventData.transactionHash;

    // const reward = BigNumber.from(data[1].toString())
    //   .mul(BigNumber.from('1000000000000000000000000000')) // <-- prevShares
    //   .div(BigNumber.from(data[3].toString())); // = 8.8 Klay
    // console.log('!! reward = ', reward.toString());

    console.log('!! RestakedFromManager : ', totalRestaked, amount, totalStaking, totalShares);

    try {
      await models.rewards.createRewards(eventData.blockNumber, transactionHash, amount, totalShares);
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
    await web3.eth
      .getPastLogs(
        // {fromBlock: lastBlock.blocknumber, toBlock: toBlock, address: contracts},
        {fromBlock: 120127634, toBlock: 120128017, address: contracts},
        async (err, result) => {
          if (!err) {
            // console.log(result);
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
        },
      )
      .catch((e) => {
        console.log('collection contract getEvents', e);
      });
  } catch (e) {
    console.log('error ====> ', e);
  }
  console.log('getlastevent end');

  // try {
  //     await web3.eth.getPastLogs(
  //         // {fromBlock: lastBlock, toBlock: toBlock, address: contractAddress},
  //         {fromBlock: lastBlock, toBlock: toBlock, address: contracts},
  //         async (err, result) => {
  //             if (!err) {
  //                 if (result.length > 0) {
  //                     lastBlock = result[result.length - 1].blockNumber + 1;
  //                     console.log('update last block ----->', result);
  //                     for (let i = 0; i < result.length; i++) {
  //                         let contract = result[i].address;
  //                         let collection = await collectionRepository.findByContractAddress(contract);
  //                         if (!collection) {
  //                             continue;
  //                         }
  //                         let contractAddress = contract.toLowerCase();
  //                         if (result[i].topics) {
  //                             if (result[i].topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {// transfer
  //                                 let fromAddress = hexToAddress(result[i].topics[1]);
  //                                 let toAddress = hexToAddress(result[i].topics[2]);
  //                                 let tokenIdDeciaml = web3.utils.hexToNumber(result[i].topics[3]);
  //                                 let tokenIdHex = '0x' + tokenIdDeciaml.toString(16);
  //                                 let transactionHash = result[i].transactionHash;
  //                                 console.log(`tokenIdDeciaml: ${tokenIdDeciaml} hash: ${transactionHash}`);
  //
  //                                 if (fromAddress == '0x0000000000000000000000000000000000000000') {// mint
  //                                     let nftIds = await SerialModel.aggregate([
  //                                         {$match: {contract_address: contractAddress, token_id: tokenIdHex}},
  //                                         {$group: {_id: '$nft_id'}}
  //                                     ]);
  //                                     if (nftIds.length > 1) {
  //                                         const nfts = await NftModel.find({_id: {$in: nftIds}});
  //                                         for (let i = 0; i < nfts.length; i++) {
  //                                             if (nfts[i].onchain === 'false') {
  //                                                 // serials 삭제
  //                                                 console.log('duplicate token id onchain false nft id : ', nfts[i]._id);
  //                                                 try {
  //                                                     const ret1 = await SerialModel.deleteMany({nft_id: nfts[i]._id});
  //                                                     const ret2 = await NftModel.deleteOne({_id: nfts[i]._id});
  //                                                     console.log('removed', ret1, ret2);
  //                                                 } catch (e) {
  //                                                     console.log(e);
  //                                                 }
  //                                             }
  //                                         }
  //                                     }
  //                                     let serial = await SerialModel.findOneAndUpdate(
  //                                         {
  //                                             contract_address: contractAddress,
  //                                             token_id: tokenIdHex,
  //                                             // owner: null,
  //                                             status: consts.SERIAL_STATUS.INACTIVE,
  //                                         },
  //                                         {$set: {status: consts.SERIAL_STATUS.ACTIVE}},
  //                                         {returnDocument: 'after'},
  //                                     ).sort({createdAt: -1});
  //                                     if (!serial) continue;
  //                                     await ListenerModel.create({
  //                                         token_id: tokenIdDeciaml,
  //                                         tx_id: transactionHash,
  //                                         from: fromAddress,
  //                                         to: toAddress,
  //                                         nft_id: serial.nft_id._id,
  //                                         chain_id: getChainId(chainName),
  //                                         contract_address: contractAddress,
  //                                         type: consts.LISTENER_TYPE.MINT,
  //                                     });
  //                                     if (serial) await NftModel.findOneAndUpdate({_id: serial.nft_id._id}, {
  //                                         status: consts.NFT_STATUS.ACTIVE,
  //                                     });
  //                                 } else if (toAddress == '0x0000000000000000000000000000000000000000') {// burn
  //                                     let serial = await SerialModel.findOneAndUpdate(
  //                                         {contract_address: contractAddress, token_id: tokenIdHex},
  //                                         {$set: {status: consts.SERIAL_STATUS.SUSPEND}},
  //                                         {returnDocument: 'after'},
  //                                     );
  //                                     if (!serial) continue;
  //                                     await ListenerModel.create({
  //                                         token_id: tokenIdDeciaml,
  //                                         tx_id: transactionHash,
  //                                         nft_id: serial.nft_id._id,
  //                                         from: fromAddress,
  //                                         to: toAddress,
  //                                         chain_id: getChainId(chainName),
  //                                         contract_address: contractAddress,
  //                                         type: consts.LISTENER_TYPE.BURN,
  //                                     });
  //                                     // todo do not update quantity_selling
  //                                     if (serial) await NftModel.findOneAndUpdate({_id: serial.nft_id._id}, {
  //                                         // $inc: {quantity_selling: -1},
  //                                         status: consts.NFT_STATUS.SUSPEND,
  //                                     });
  //                                 } else {// other transfer(buy, airdrop)
  //                                     console.log('17 transfer event', result[i]);
  //                                     let transaction = await TransactionModel.findOneAndUpdate(
  //                                         {tx_id: transactionHash},
  //                                         {$set: {status: consts.TRANSACTION_STATUS.SUCCESS}},
  //                                         {returnDocument: 'after'},
  //                                     );
  //                                     if (transaction) await SerialModel.findOneAndUpdate({_id: transaction.serial_id._id}, {transfered: consts.TRANSFERED.TRANSFERED});
  //                                 }
  //                             }
  //                                 // keccak hash : TransferSingle(address,address,address,uint256,uint256)
  //                             // https://baobab.scope.klaytn.com/tx/0xa376776f1fd040e1e78499c9d15db374b64ccb27d994c2bcd31f7c4a4d9a06a5?tabId=eventLog
  //                             else if (
  //                                 result[i].topics[0] ==
  //                                 '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
  //                             ) {
  //                                 let contractAddress = result[i].address.toLowerCase();
  //                                 const data = web3.eth.abi.decodeParameters(['uint256', 'uint256'], result[i].data);
  //                                 let fromAddress = hexToAddress(result[i].topics[1]);
  //                                 let toAddress = hexToAddress(result[i].topics[3]);
  //                                 console.log('====!!!!', result[i].topics, data);
  //                                 let tokenIdDeciaml = parseInt(data[0]);
  //                                 let tokenIdHex = '0x' + tokenIdDeciaml.toString(16);
  //
  //                                 let transactionHash = result[i].transactionHash;
  //                                 // transfer
  //                                 if (
  //                                     result[i].topics[2] ==
  //                                     '0x0000000000000000000000000000000000000000000000000000000000000000'
  //                                 ) {
  //                                     let nftIds = await SerialModel.aggregate([
  //                                         {$match: {contract_address: contractAddress, token_id: tokenIdHex}},
  //                                         {$group: {_id: '$nft_id'}}
  //                                     ]);
  //                                     if (nftIds.length > 1) {
  //                                         const nfts = await NftModel.find({_id: {$in: nftIds}});
  //                                         for (let i = 0; i < nfts.length; i++) {
  //                                             if (nfts[i].onchain === 'false') {
  //                                                 // serials 삭제
  //                                                 console.log('duplicate token id onchain false nft id : ', nfts[i]._id);
  //                                                 try {
  //                                                     const ret1 = await SerialModel.deleteMany({nft_id: nfts[i]._id});
  //                                                     const ret2 = await NftModel.deleteOne({_id: nfts[i]._id});
  //                                                     console.log('removed. ', ret1, ret2);
  //                                                 } catch (e) {
  //                                                     console.log(e);
  //                                                 }
  //                                             }
  //                                         }
  //                                     }
  //                                     // mint
  //                                     let result = await SerialModel.updateMany(
  //                                         {
  //                                             contract_address: contractAddress,
  //                                             token_id: tokenIdHex,
  //                                             owner: null,
  //                                             status: consts.SERIAL_STATUS.INACTIVE,
  //                                         },
  //                                         {$set: {status: consts.SERIAL_STATUS.ACTIVE}},
  //                                     );
  //                                     const serial = await SerialModel.findOne({
  //                                         contract_address: contractAddress,
  //                                         token_id: tokenIdHex,
  //                                     }).sort({createdAt: -1});
  //                                     if (!serial) continue;
  //                                     await ListenerModel.create({
  //                                         token_id: tokenIdDeciaml,
  //                                         tx_id: transactionHash,
  //                                         nft_id: serial.nft_id._id,
  //                                         from: fromAddress,
  //                                         to: toAddress,
  //                                         chain_id: getChainId(chainName),
  //                                         contract_address: contractAddress,
  //                                         type: consts.LISTENER_TYPE.MINT,
  //                                     });
  //                                     if (serial) await NftModel.findOneAndUpdate({_id: serial.nft_id._id}, {status: consts.NFT_STATUS.ACTIVE});
  //                                 } else if (
  //                                     result[i].topics[3] ==
  //                                     '0x0000000000000000000000000000000000000000000000000000000000000000'
  //                                 ) {
  //                                     // burn
  //                                     let amount = data[1];
  //                                     let result = await SerialModel.updateMany(
  //                                         {contract_address: contractAddress, token_id: tokenIdHex},
  //                                         {$set: {status: consts.SERIAL_STATUS.SUSPEND}},
  //                                         {returnDocument: 'after'},
  //                                     );
  //                                     const serial = await SerialModel.findOne({
  //                                         contract_address: contractAddress,
  //                                         token_id: tokenIdHex,
  //                                     });
  //                                     if (!serial) continue;
  //                                     await ListenerModel.create({
  //                                         token_id: tokenIdDeciaml,
  //                                         tx_id: transactionHash,
  //                                         nft_id: serial.nft_id._id,
  //                                         from: fromAddress,
  //                                         to: toAddress,
  //                                         chain_id: getChainId(chainName),
  //                                         contract_address: contractAddress,
  //                                         type: consts.LISTENER_TYPE.BURN,
  //                                     });
  //                                     if (serial) await NftModel.findOneAndUpdate({_id: serial.nft_id._id}, {
  //                                         quantity_selling: 0,
  //                                         status: consts.NFT_STATUS.SUSPEND,
  //                                     });
  //                                 } else {
  //                                     let amount = data[1];
  //                                     // buy or airdrop nft
  //                                     // TODO 여러개가 한번에 팔리는 경우에 대한 처리 필요(여러개의 serial 을 suspend 처리해야함?)
  //                                     let transaction = await TransactionModel.findOneAndUpdate(
  //                                         {tx_id: transactionHash},
  //                                         {$set: {status: consts.TRANSACTION_STATUS.SUCCESS}},
  //                                         {returnDocument: 'after'},
  //                                     );
  //                                     const serials = await SerialModel.find({
  //                                         owner_id: {$regex: toAddress, $options: 'i'},
  //                                         contract_address: {$regex: contractAddress, $options: 'i'},
  //                                         transfered: consts.TRANSFERED.NOT_TRANSFER
  //                                     })
  //                                         .select('_id');
  //                                     const serialIds = serials.map((doc) => doc._id);
  //                                     if (transaction) await SerialModel.updateMany({_id: {$in: serialIds}}, {$set: {transfered: consts.TRANSFERED.TRANSFERED}});
  //                                 }
  //                             } else if (result[i].topics[0] == '0x000000') {
  //                                 // approve chưa biết mã topic nên chưa xong
  //                             }
  //                         }
  //                     }
  //                 }
  //                 lastBlock = toBlock + 1;
  //                 await lastblockRepository.update(getChainId(chainName), 'event', lastBlock);
  //                 console.log(chainName + ' event last block update complete.', lastBlock);
  //                 return true;
  //             }
  //             console.log(err);
  //         },
  //     ).catch((e) => {
  //         console.log('collection contract getEvents', e);
  //     });
  // } catch (error) {
  //     console.log(error);
  // }
};
