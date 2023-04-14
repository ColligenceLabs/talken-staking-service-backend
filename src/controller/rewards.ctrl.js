const {handlerError, handlerSuccessOnlyData, handlerSuccess} = require('../utils/handler_response');
const {getPolygonWeb3} = require("../utils/awskms");
const collectionAbi = require('../config/abi/collection.json');

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
            const receipt = await nftContract.methods.transferFrom(accounts[0], to, tokenId).send({from: accounts[0]});
            const {status, transactionHash, message} = receipt;
            console.log(receipt);
            if (status)
                return handlerSuccessOnlyData(req, res, {transactionHash});
            else
                return handlerError(req, res, message);
        } catch (e) {
            console.log(e);
            return handlerError(req, res, e.message);
        }
    },
    test: async (req, res) => {
        try {
            return handlerSuccess(req, res, 'test');
        } catch (e) {
            console.log(e);
            return handlerError(req, res, e.message);
        }
    }
}