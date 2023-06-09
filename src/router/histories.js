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
 * /api/history/{wallet}:
 *   get:
 *     tags:
 *       - History
 *     description: histories 조회
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: wallet
 *         description: abc wallet address
 *         schema:
 *           type: string
 *           example: '0x12345'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 5
 *       - in: query
 *         name: sortBy
 *         description: '"id:ASC" or "id:DESC"'
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *     responses:
 *       "200":
 *         description: "successful operation"
 */
historyRouter.get('/:wallet', historyCtrl.getHistory);

module.exports = historyRouter;