module.exports = (sequelize, Sequelize) => {
    const Lastblock = sequelize.define("lastblocks", {
            // id: {
            //     type: Sequelize.INTEGER,
            //     primaryKey: true,
            //     autoIncrement: true,
            // },
            network: {
                type: Sequelize.SMALLINT,
                primaryKey: true,
            },
            blocknumber: {
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
    Lastblock.findByNetwork = async function (network) {
        return await this.findOne({where: {network}});
    };

    return Lastblock;
};