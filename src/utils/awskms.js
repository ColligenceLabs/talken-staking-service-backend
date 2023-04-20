const Web3 = require("web3");
const { KmsProvider } = require("aws-kms-provider");
const {provider} = require("../config/constants");

module.exports = {
    getKlaytnKmsWeb3: function () {
        try {
            const accessKeyId = process.env.ACCESS_KEY_ID;
            const secretAccessKey = process.env.SECRET_ACCESS_KEY;
            const region = process.env.REGION;
            const kmsProvider = new KmsProvider(provider[parseInt(process.env.TARGET_NETWORK)],
                {region, keyIds: [process.env.KEY_ID], credential: {accessKeyId, secretAccessKey}});

            return new Web3(kmsProvider);
        } catch (e) {
            console.log('getKlaytnKmsWeb3', e);
            throw e;
        }
    },
}