/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API endpoints for admin actions
 */

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin account
 *     description: Register a new admin with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully registered
 *       '400':
 *         description: Bad request
 */

/**
 * @swagger
 * /admin/visitors:
 *   get:
 *     summary: Get all created visitors by an admin
 *     description: Retrieves a list of all visitors created by an admin
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '404':
 *         description: No visitors found
 */

/**
 * @swagger
 * /admin/generatepass:
 *   post:
 *     summary: Generate a visitor pass by an admin
 *     description: Generate a pass for a visitor with name and purpose of visit
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
