const express = require('express');
const rewardRouter = new express.Router();
const rewardCtrl = require('../controller/rewards.ctrl');

/**
 * @swagger
 * tags:
 *   name: Reward
 *   description: reward api
 */

/**
 * @swagger
 * /api/reward/{wallet}:
 *   get:
 *     tags:
 *       - Reward
 *     description: reward 조회
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: wallet
 *         description: wallet address
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
rewardRouter.get('/:wallet', rewardCtrl.getReward);

/**
 * @swagger
 * /api/reward/total/{wallet}:
 *   get:
 *     tags:
 *       - Reward
 *     description: reward 조회
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: wallet
 *         description: wallet address
 *         schema:
 *           type: string
 *           example: '0x12345'
 *     responses:
 *       "200":
 *         description: "successful operation"
 */
rewardRouter.get('/total/:wallet', rewardCtrl.getTotalReward);

module.exports = rewardRouter;