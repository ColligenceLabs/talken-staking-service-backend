const {handlerError, handlerSuccessOnlyData, handlerSuccess} = require('../utils/handler_response');
const {getPolygonWeb3} = require('../utils/awskms');
const collectionAbi = require('../config/abi/collection.json');
const models = require('../models');
const {getHeaders} = require('../utils/helper');
const {BigNumber} = require("@ethersproject/bignumber");

module.exports = {
  transfer: async (req, res) => {
    try {
      const to = req.query.to;
      const tokenId = req.query.tokenId;
      console.log(to, tokenId);
      const web3 = getPolygonWeb3();
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      const nftContract = new web3.eth.Contract(collectionAbi, process.env.CONTRACT_ADDRESS);
      const receipt = await nftContract.methods
        .transferFrom(accounts[0], to, tokenId)
        .send({from: accounts[0]});
      const {status, transactionHash, message} = receipt;
      console.log(receipt);
      if (status) return handlerSuccessOnlyData(req, res, {transactionHash});
      else return handlerError(req, res, message);
    } catch (e) {
      console.log(e);
      return handlerError(req, res, e.message);
    }
  },
  getReward: async (req, res) => {
    try {
      const sortBy = req.query.sortBy ?? 'createdAt:DESC';
      const wallet = req.params.wallet ?? null;
      let page = +req.query.page || 1;
      let limit = +req.query.limit || 5;
      const options = {};
      options.where = {wallet};
      const totCnt = await models.rewards.count(options);
      const responseHeaders = getHeaders(totCnt, page, limit);
      options.limit = limit;
      options.offset = (page - 1) * limit;
      options.order = [sortBy.split(':')];
      const rewards = await models.rewards.findAll(options);
      return handlerSuccess(req, res, {rewards, headers: responseHeaders});
    } catch (e) {
      console.log(e);
      return handlerError(req, res, e.message);
    }
  },
  getTotalReward: async (req, res) => {
    try {
      const wallet = req.params.wallet ?? null;
      const options = {};
      options.where = {wallet};
      const rewards = await models.rewards.findAll(options);
      let totalReward = BigNumber.from('0');
      if (rewards) {
        for (let i = 0; i < rewards.length; i++) {
          const reward = BigNumber.from(rewards[i].amount).mul(BigNumber.from(rewards[i].shares)).div(BigNumber.from(rewards[i].total_shares));
          totalReward = totalReward.add(reward);
        }
      }
      return handlerSuccess(req, res, totalReward.toString());
    } catch (e) {
      console.log(e);
      return handlerError(req, res, e.message);
    }
  }
};
