const MongoClient = require("mongodb").MongoClient;
const User = require("./user");
const Visitor = require("./visitor.js");
const Inmate = require("./inmate");
const Visitorlog = require("./visitorlog")
const bcrypt = require("bcrypt")

MongoClient.connect(
	// TODO: Connection 
	//"mongodb+srv://m001-student:Dan_2218@sandbox.yldg8.mongodb.net/    ", 
	"mongodb+srv://danial:779hRsy0RVMRRRlP@gulag0.ij0pzbn.mongodb.net/?retryWrites=true&w=majority",
	{ useNewUrlParser: true },
).catch(err => {
	console.error(err.stack)
	process.exit(1)
}).then(async client => {
	console.log('Connected to MongoDB');
	User.injectDB(client);
	Visitor.injectDB(client);
	Inmate.injectDB(client);
	Visitorlog.injectDB(client);
})

const express = require('express')
const app = express()
const port = process.env.PORT || 3030

const jwt = require ('jsonwebtoken');
function generateAccessToken(payload){
	return jwt.sign(payload, "secretcode", { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, "secretcode", (err, user) => {
		console.log(err);

		if (err) return res.sendStatus(403)

		req.user = user

		next()
	})
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Prison Visitor Management System',
			description: 'Welcome!',
			version: '1.0.11',
		},
		components:{
			securitySchemes:{
				jwt:{
					type: 'http',
					scheme: 'bearer',
					in: "header",
					bearerFormat: 'JWT'
				}
			},
			schemas: {
				User: {
				  type: 'object',
				  properties: {
					username: { type: 'string' },
					name: { type: 'string' },
					officerno: { type: 'string' },
					rank: { type: 'string' },
					phone: { type: 'string' },
					// Add other properties as needed
				  },
				},
			  //},
			},
		security:[{
			"jwt": []
		}]
		},
	},

	apis: ['./main.js'], 
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
// *****************************USER************************************
//const bcrypt = require("bcrypt")
let users;
// /
class User {
	static async injectDB(conn) {
		users = await conn.db("Prison_VMS").collection("users")
	}

	/**
	 * @remarks
	 * This method is not implemented yet. To register a new user, you need to call this method.
	 * 
	 * @param {*} username 
	 * @param {*} password 
	 * @param {*} phone 
	 */
/*	static async register(username, password, name, officerno, rank, phone) {
		// TODO: Check if username exists
		const res = await users.findOne({ username: username })

			if (res){
				return { status: "duplicate username"}
			}

			// TODO: Hash password
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt)

			// TODO: Save user to database
			users.insertOne({
							"username": username,
							"Password": password,
							"HashedPassword": hash,
							"Name": name,
							"OfficerNo": officerno,
							"Rank": rank,
							"Phone": phone,});
			return { status: "Succesfully register user"}
	}

	static async login(username, password) {
			// TODO: Check if username exists
			const result = await users.findOne({username: username});

				if (!result) {
					return { status: "invalid username" }
				}

			// TODO: Validate password
				const com = await bcrypt.compare(password, result.HashedPassword)
				if (!com){
					return { status: "invalid password"}
				}
			// TODO: Return user object
				return result;
				
	}
	
	static async update(username, name, officerno, rank, phone){
			users.updateOne({username:username},{$set:{
			"Name": name,
			"OfficerNo": officerno,
			"Rank": rank,
			"Phone": phone,}});
			return { status: "Information updated" }
	}

	static async delete(username) {
		users.deleteOne({username: username})
		return { status: "User deleted!" }
	}

	// Add a new method to retrieve all users after a successful login
	static async loginAndRetrieveAllUsers(username, password) {
    	const loginResult = await this.login(username, password);

    	if (loginResult.status !== "invalid username" && loginResult.status !== "invalid password") {
        	const allUsers = await this.getAllUsers();
        	return { loginStatus: "success", allUsers: allUsers };
    }

    	return { loginStatus: loginResult.status };
	}

	}
*/

/*
// Assuming you have received username and password from the login form
const username = "username"; // Replace with actual username
const password = "password"; // Replace with actual password

User.loginAndRetrieveAllUsers(username, password)
    .then((loginData) => {
        if (loginData.loginStatus === "success") {
            const allUsers = loginData.allUsers;
            // Display allUsers on the login page or perform actions with the data
            console.log(allUsers); // Replace this with your display logic
        } else {
            // Handle invalid username/password cases
            console.log(loginData.loginStatus);
        }
    })
    .catch((err) => {
        console.error(err);
        // Handle error if necessary
    });
	*/
/*
/**
 * @swagger
 * /login/user:
 *   post:
 *     summary : login to account
 *     description: User Login
 *     tags:
 *     - User
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
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid username or password
 */
/*
app.post('/login/user', async (req, res) => {
	console.log(req.body);

	let user = await User.login(req.body.username, req.body.password);
	
	if (user.status == ("invalid username" || "invalid password")) {
		res.status(401).send("invalid username or password");
		return
	}


	res.status(200).json({
		username: user.username,
		name: user.Name,
		officerno: user.officerno,
		rank: user.Rank,
		phone: user.Phone,
		token: generateAccessToken({ rank: user.Rank })

	});
})

*/

/**
 * @swagger
 * /login/user:
 *   post:
 *     summary : login to account
 *     description: User Login
 *     tags:
 *     - System
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
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 name:
 *                   type: string
 *                 officerno:
 *                   type: string
 *                 rank:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 token:
 *                   type: string
 *                 allUsers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid username or password
 */

app.post('/login/user', async (req, res) => {
	console.log(req.body);

	let user = await User.loginAndRetrieveAllUsers(req.body.username, req.body.password);
	
	if (user.loginStatus === "success") {
		res.status(200).json({
			username: user.username,
			name: user.Name,
			officerno: user.officerno,
			rank: user.Rank,
			phone: user.Phone,
			token: generateAccessToken({ rank: user.Rank }),
			allUsers: user.allUsers
		});
	} else {
		res.status(401).send("Invalid username or password");
	}
});

/* -------------------------- NOT USED -------------------------- *//*
/**
 * @swagger
 * /login/visitor:
 *   post:
 *     summary : Visitor Account Login
 *     description: Visitor Login
 *     tags: 
 *     - Visitor
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
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid username or password
 */
/*
app.post('/login/visitor', async (req, res) => {
	console.log(req.body);

	let user = await Visitor.login(req.body.username, req.body.password);

	if (user.status == ("invalid username" || "invalid password")) {
		res.status(401).send("invalid username or password");
		return
	}

	res.status(200).json({
		username: user.username,
		name: user.Name,
		age: user.Age,
		gender: user.Gender,
		relation: user.Relation,
		token: generateAccessToken({ username: user.username })
	});
})
*/

/**
 * @swagger
 * /register/user:
 *   post:
 *     summary : Visitor Account Login
 *     description: User Registration
 *     tags:
 *     - Admin
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
 *               name: 
 *                 type: string
 *               officerno:
 *                 type: string
 *               rank:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */

app.post('/register/user', async (req, res) => {
	console.log(req.body);
	
	const reg = await User.register(req.body.username, req.body.password, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
	console.log(reg);

	res.json({reg})
})

/**
 * @swagger
 * /register/visitor:
 *   post:
 *     summary : Visitor Account Registration
 *     description: Visitor Registration
 *     tags:
 *     - User
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
 *               name: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               relation:
 *                 type: string
 *               telno:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */

app.post('/register/visitor', async (req, res) => {
	console.log(req.body);

		const reg = await Visitor.register(req.body.username, req.body.password, req.body.name, req.body.age, req.body.gender, req.body.relation, req.body.telno);
		console.log(reg);
	
	res.json({reg})
})

app.use(verifyToken);

/**
 * @swagger
 * /register/Visitorlog:
 *   post:
 *     summary : Visitorlog Registration
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Create Visitorlog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               logno:
 *                 type: integer
 *               username: 
 *                 type: string
 *               inmateno: 
 *                 type: string
 *               dateofvisit:
 *                 type: string
 *               timein:
 *                 type: string
 *               timeout:
 *                 type: string
 *               purpose:
 *                 type: string
 *               officerno:
 *                 type: string

 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */


 app.post('/register/visitorlog', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer" || "security"){
		const reg = await Visitorlog.register(req.body.logno, req.body.username, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
		res.status(200).send(reg)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /register/inmate:
 *   post:
 *   summary : Inmate Registration
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Inmate Registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateno: 
 *                 type: string
 *               firstname: 
 *                 type: string
 *               lastname: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               guilty:
 *                 type: string
 *              
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration , Please try again
 */

 app.post('/register/inmate', async (req,res)=>{
	console.log(req.body)

	if (req.user.rank == "officer"){
		const reg = await Inmate.register(req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty );
		res.status(200).send(reg)
	}
	else{
		res.status(403).send("You are unauthorized")
	}

})

// Display all user to admin upon login
/**
 * @swagger
 * /user/allusers:
 *   get:
 *     summary: Retrieve all users
 *     security:
 *      - jwt: []
 *     tags:
 *     - Admin
 *     description: Get all users from the database
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User' // Define your User schema here
 */
app.get('/user', async (req, res) => {
  try {
    const allUsers = await User.getAllUsers();
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});


/**
 * @swagger
 * /user/update:
 *   patch:
 *     summary : User Update
 *     security:
 *      - jwt: []
 *     tags:
 *     - Admin
 *     description: User Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               name: 
 *                 type: string
 *               officerno:
 *                 type: string
 *               rank:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

app.patch('/user/update', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "admin"){
		const update = await User.update(req.body.username, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}

})

/**
 * @swagger
 * /visitor/update:
 *   patch:
 *     summary : Visitor Update
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Visitor Update
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
 *               name: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               relation:
 *                 type: string
 *               telno:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

app.patch('/visitor/update', async (req, res) => {
	console.log(req.body);

	if (req.user.rank == "officer"){
		const update = await Visitor.update(req.body.username, req.body.name, req.body.age, req.body.gender, req.body.relation, req.body.telno);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /inmate/update:
 *   patch:
 *     summary : Inmate Update
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Inmate Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateno: 
 *                 type: string
 *               firstname: 
 *                 type: string
 *               lastname: 
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               guilty:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

 app.patch('/inmate/update', async (req, res) => {
	console.log(req.body);
	if (req.user.rank == "officer"){
		const update = await Inmate.update( req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /visitorlog/update:
 *   patch:
 *     summary : Visitorlog Update
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Visitorlog Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               logno:
 *                 type: integer
 *               inmateno: 
 *                 type: string
 *               dateofvisit:
 *                 type: string
 *               timein:
 *                 type: string
 *               timeout:
 *                 type: string
 *               purpose:
 *                 type: string
 *               officerno:
 *                 type: string

 *     responses:
 *       200:
 *         description: Successful updated
 *       401:
 *         description: There is an error during updating , Please try again
 */

 app.patch('/visitorlog/update', async (req, res) => {
	console.log(req.body);

	if (req.user.username == req.body.username){
		const update = await Visitorlog.update(req.body.logno, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
		res.status(200).send(update)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/user:
 *   delete:
 *     summary : User Delete
 *     security:
 *      - jwt: []
 *     tags:
 *     - Admin
 *     description: Delete User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful delete
 *       401:
 *         description: There is an error during deleting , Please try again
 */

app.delete('/delete/user', async (req, res) => {
	if (req.user.rank == "admin"){
		const del = await User.delete(req.body.username)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/visitor:
 *   delete:
 *     summary : Visitor Delete
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Delete Visitor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful deleted
 *       401:
 *         description: There is an error during deleting , Please try again
 */

app.delete('/delete/visitor', async (req, res) => {
	if (req.user.rank == "admin"){
		const del = await Visitor.delete(req.body.username)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/Inmate:
 *   delete:
 *     summary : Inmate Delete
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Delete Inmate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateno: 
 *                 type: string
 *               
 *     responses:
 *       200:
 *         description: Successful deleted
 *       401:
 *         description: There is an error during deleting , Please try again
 */

 app.delete('/delete/inmate', async (req, res) => {
	if (req.user.rank == "admin"){
		const del = await Inmate.delete(req.body.inmateno)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

/**
 * @swagger
 * /delete/visitorlog:
 *   delete:
 *     summary : Visitorlog Delete
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Delete Visitorlog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               logno: 
 *                 type: integer
 *               
 *     responses:
 *       200:
 *         description: Successful delete
 *       401:
 *         description: There is an error during deleting , Please try again
 */

 app.delete('/delete/visitorlog', async (req, res) => {
	if (req.user.rank == "admin" || "security"){
		const del = await Visitorlog.delete(req.body.logno)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

/**
 * @swagger
 * /issue/visitorpass:
 *   post:
 *     summary: Issue Visitor Pass
 *     security:
 *       - jwt: []
 *     tags:
 *       - User
 *     description: Issue visitor pass (only store visitor record)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inmateName:
 *                 type: string
 *               visitorName:
 *                 type: string
 *               visitorAge:
 *                 type: integer
 *               visitorGender:
 *                 type: string
 *               visitorRelation:
 *                 type: string
 *               visitorTelNo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visitor pass issued successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

app.post('/issue/visitorpass', async (req, res) => {
	try {
	  // Check if the user has the necessary permissions (e.g., guard)
	  if (req.user.rank === 'guard') {
		// Extract relevant information from the request body
		const { inmateName, visitorName, visitorAge, visitorGender, visitorRelation, visitorTelNo } = req.body;
  
		// Add logic to store the visitor record in the database (Visitorlog)
		const issuedPass = await Visitorlog.issueVisitorPass(inmateName, visitorName, visitorAge, visitorGender, visitorRelation, visitorTelNo);
  
		res.status(200).json({ status: 'Visitor pass issued successfully', issuedPass });
	  } else {
		res.status(403).send('You are unauthorized');
	  }
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });

  /**
 * @swagger
 * /retrieve/visitorpass:
 *   get:
 *     summary: Retrieve Issued Visitor Pass
 *     tags:
 *       - Visitor
 *     description: Retrieve issued visitor pass by entering inmate's name
 *     parameters:
 *       - in: query
 *         name: inmateName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visitor pass retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Visitor pass not found
 *       500:
 *         description: Internal server error
 */

app.get('/retrieve/visitorpass', async (req, res) => {
	try {
	  // Check if the user is a visitor
	  if (req.user.rank === 'visitor') {
		const inmateName = req.query.inmateName;
  
		// Add logic to retrieve the visitor pass based on the inmate's name
		const retrievedPass = await Visitorlog.retrieveVisitorPass(inmateName);
  
		if (retrievedPass) {
		  res.status(200).json({ status: 'Visitor pass retrieved successfully', retrievedPass });
		} else {
		  res.status(404).json({ error: 'Visitor pass not found' });
		}
	  } else {
		res.status(403).send('You are unauthorized');
	  }
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });
  