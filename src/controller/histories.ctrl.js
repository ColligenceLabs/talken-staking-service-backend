const {handlerError, handlerSuccess} = require('../utils/handler_response');
const models = require("../models");
const {getHeaders} = require("../utils/helper");

module.exports = {
    getHistory: async (req, res) => {
        try {
            const sortBy = req.query.sortBy ?? "createdAt:DESC";
            const wallet = req.params.wallet ?? null;
            let page = +req.query.page || 1;
            let limit = +req.query.limit || 5;
            const options = {};
            options.where = { wallet };
            const totCnt = await models.histories.count(options);
            const responseHeaders = getHeaders(totCnt, page, limit);
            options.limit = limit;
            options.offset = (page - 1) * limit;
            options.order = [sortBy.split(":")];
            const histories = await models.histories.findAll(options);
            return handlerSuccess(req, res, { histories, headers: responseHeaders });
        } catch (e) {
            console.log(e);
            return handlerError(req, res, e.message);
        }
    }
}