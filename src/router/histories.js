const express = require('express');
const rewardsRouter = new express.Router();
const rewardsCtrl = require('../controller/rewards.ctrl');

/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: rewards api
 */

/**
 * @swagger
 * /rewards:
 *   get:
 *     tags:
 *       - Rewards
 *     description: rewards 조회
 *     produces:
 *     - "application/json"
 *     responses:
 *       "200":
 *         description: "successful operation"
 */
rewardsRouter.get('/', rewardsCtrl.test);

module.exports = rewardsRouter;