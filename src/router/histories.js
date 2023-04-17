const express = require('express');
const historyRouter = new express.Router();
const historyCtrl = require('../controller/histories.ctrl');

/**
 * @swagger
 * tags:
 *   name: History
 *   description: histories api
 */

/**
 * @swagger
 * /api/histories:
 *   get:
 *     tags:
 *       - History
 *     description: histories 조회
 *     produces:
 *     - "application/json"
 *     responses:
 *       "200":
 *         description: "successful operation"
 */
historyRouter.get('/', historyCtrl.test);

module.exports = historyRouter;