module.exports = (sequelize, Sequelize) => {
    const Rewards = sequelize.define("rewards", {
            wallet: {
                type: Sequelize.STRING,
            },
            shares: {
                type: Sequelize.STRING,
            },
            total_shares: {
                type: Sequelize.STRING,
            },
            amount: {
                type: Sequelize.STRING,
            },
            tx_hash: {
                type: Sequelize.STRING,
            },
            block_number: {
                type: Sequelize.BIGINT,
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        }
    );
    Rewards.removeAttribute('id');

    Rewards.createRewards = async function (blockNumber, txHash, amount, totalShares) {
        let query = `insert into rewards (wallet, shares, total_shares, amount, tx_hash, block_number, "createdAt")
                     select wallet, shares, ${totalShares}, ${amount}, '${txHash}', ${blockNumber}, NOW()
                       from histories where id in (select max(id) from histories group by wallet)`;
        return await sequelize.query(query);
    };

    return Rewards;
};