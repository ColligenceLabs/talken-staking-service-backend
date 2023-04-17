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

    return Rewards;
};