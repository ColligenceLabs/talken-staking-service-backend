module.exports = (sequelize, Sequelize) => {
    const Histories = sequelize.define("histories", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            type: {
                type: Sequelize.STRING,
            },
            wallet: {
                type: Sequelize.STRING,
            },
            prev_shares: {
                type: Sequelize.STRING,
            },
            shares: {
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

    return Histories;
};