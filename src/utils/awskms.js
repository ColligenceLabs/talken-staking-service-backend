const Web3 = require("web3");
const { KmsProvider } = require("aws-kms-provider");

module.exports = {
    getKlaytnKmsWeb3: function () {
        const accessKeyId = process.env.ACCESS_KEY_ID;
        const secretAccessKey = process.env.SECRET_ACCESS_KEY;
        const region = process.env.REGION;
        const provider = new KmsProvider(process.env.KLAYTN_NODE,
            {region, keyIds: [process.env.KEY_ID], credential: {accessKeyId, secretAccessKey}});

        return new Web3(provider);
    },
}