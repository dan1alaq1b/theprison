/**
 * @swagger
 * tags:
 *   name: Generate Your Pass
 *   description: Generate A Visitor Pass (Used By Admin Only)
 */

/**
 * @swagger
 * /generatepass/generate:
 *   post:
 *     summary: Generate a visitor pass
 *     description: Generate a pass for a visitor with necessary details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitorName:
 *                 type: string
 *               purpose:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Pass generated successfully
 *       '400':
 *         description: Bad request
 */
