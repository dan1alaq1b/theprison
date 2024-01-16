const MongoClient = require("mongodb").MongoClient;
const User = require("./user.js");
const Visitor = require("./visitor.js");
const Inmate = require("./inmate.js");
const Visitorlog = require("./visitorlog.js")


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
	return jwt.sign(payload, "secretcode", { expiresIn: '1d' }); //expiration can be 'd' (day), 'h' (hour), 'm' (minute), 's' (second)
}

// function verifyToken(req, res, next) {
// 	const authHeader = req.headers['authorization']
// 	const token = authHeader && authHeader.split(' ')[1]

// 	if (token == null) return res.sendStatus(401)

// 	jwt.verify(token, "secretcode", (err, user) => {
// 		console.log(err);

// 		if (err) return res.sendStatus(403)

// 		req.user = user

// 		next()
// 	})
// }

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, "secretcode", (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        // Attach the decoded user information to req.user
        req.user = user;
        next();
    });
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
		security:[{
			"jwt": []
		}]
		}
	},
	apis: ['./main.js'], 
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /retrieve/visitorpass:
 *   get:
 *     summary: Retrieve Issued Visitor Pass
 *     tags:
 *       - Visitor
 *     description: Retrieve issued visitor pass by entering inmate's first and last name
 *     parameters:
 *       - in: query
 *         name: firstname
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: lastname
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
	  // Check if the user is a visitor or has the necessary permissions
	  if (req.user.rank === 'visitor' || req.user.rank === 'officer' || req.user.rank === 'security') {
		const firstname = req.query.firstname;
		const lastname = req.query.lastname;
  
		// Find the inmate based on the provided first and last names
		const inmate = await Inmate.find({ firstname: firstname, lastname: lastname });
  
		if (!inmate) {
		  return res.status(404).json({ error: 'Inmate not found' });
		}
  
		// Add logic to retrieve the visitor pass based on the inmate's name
		const retrievedPass = await Visitorlog.retrieveVisitorPass(`${firstname} ${lastname}`);
  
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
  

// /**
//  * @swagger
//  * /retrieve/visitorpass:
//  *   get:
//  *     summary: Retrieve Issued Visitor Pass
//  *     tags:
//  *       - Visitor
//  *     description: Retrieve issued visitor pass by entering inmate's name
//  *     parameters:
//  *       - in: query
//  *         name: inmateName
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Visitor pass retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden
//  *       404:
//  *         description: Visitor pass not found
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /retrieve/visitorpass:
//  *   get:
//  *     summary: Retrieve Issued Visitor Pass
//  *     tags:
//  *       - Visitor
//  *     description: Retrieve issued visitor pass by entering inmate's name
//  *     parameters:
//  *       - in: query
//  *         name: firstname
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: inmateName
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Visitor pass retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden
//  *       404:
//  *         description: Visitor pass not found
//  *       500:
//  *         description: Internal server error
//  */

// app.get('/retrieve/visitorpass', async (req, res) => {
// 	try {
// 	  // Check if the user is a visitor or has the necessary permissions
// 	  if (req.user.rank === 'visitor' || req.user.rank === 'officer' || req.user.rank === 'security') {
// 		const inmateName = req.query.inmateName;
// 		const firstname = req.query.firstname;
  
// 		// Find the inmate based on the provided first name
// 		const inmate = await Inmate.find({ firstname: firstname });
  
// 		if (!inmate) {
// 		  return res.status(404).json({ error: 'Inmate not found' });
// 		}
  
// 		// Add logic to retrieve the visitor pass based on the inmate's name
// 		const retrievedPass = await Visitorlog.retrieveVisitorPass(inmateName);
  
// 		if (retrievedPass) {
// 		  res.status(200).json({ status: 'Visitor pass retrieved successfully', retrievedPass });
// 		} else {
// 		  res.status(404).json({ error: 'Visitor pass not found' });
// 		}
// 	  } else {
// 		res.status(403).send('You are unauthorized');
// 	  }
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });
  

//   app.get('/retrieve/visitorpass', async (req, res) => {
// 	try {
// 	  // Check if the user is a visitor
// 	  if (req.user.rank === 'visitor') {
// 		const inmateName = req.query.inmateName;
  
// 		// Add logic to retrieve the visitor pass based on the inmate's name
// 		const retrievedPass = await Visitorlog.retrieveVisitorPass(inmateName);
  
// 		if (retrievedPass) {
// 		  res.status(200).json({ status: 'Visitor pass retrieved successfully', retrievedPass });
// 		} else {
// 		  res.status(404).json({ error: 'Visitor pass not found' });
// 		}
// 	  } else {
// 		res.status(403).send('You are unauthorized');
// 	  }
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });

// app.get('/retrieve/visitorpass', async (req, res) => {
// 	try {
// 	  // Check if the user is a visitor or has the necessary permissions
// 	  if (req.user.rank === 'visitor' || req.user.rank === 'officer' || req.user.rank === 'security') {
// 		const inmateName = req.query.inmateName;
  
// 		// Add logic to retrieve the visitor pass based on the inmate's name
// 		const retrievedPass = await Visitorlog.retrieveVisitorPass(inmateName);
  
// 		if (retrievedPass) {
// 		  res.status(200).json({ status: 'Visitor pass retrieved successfully', retrievedPass });
// 		} else {
// 		  res.status(404).json({ error: 'Visitor pass not found' });
// 		}
// 	  } else {
// 		res.status(403).send('You are unauthorized');
// 	  }
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });

// /**
//  * @swagger
//  * /login/user:
//  *   get:
//  *     summary: Get all users
//  *     tags:
//  *       - System
//  *     description: Retrieve all users from the database
//  *     security:
//  *      - jwt: []
//  *     responses:
//  *       200:
//  *         description: Users retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       500:
//  *         description: Internal server error
//  */
// app.get('/login/user', async (req, res) => {
// 	try {
// 	  const allUsers = await User.getAllUsers(); // Add this method in the User class
// 	  res.status(200).json(allUsers);
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });
  
// /**
//  * @swagger
//  * /view/visitor:
//  *   get:
//  *     summary: View all visitors
//  *     tags:
//  *       - User
//  *     description: Retrieve all created visitors from the database
//  *     security:
//  *      - jwt: []
//  *     responses:
//  *       200:
//  *         description: Visitors retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       500:
//  *         description: Internal server error
//  */
// app.get('/view/visitor', async (req, res) => {
// 	try {
// 	  const allVisitors = await Visitor.getAllVisitors(); // Add this method in the Visitor class
// 	  res.status(200).json(allVisitors);
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });
  

/**
 * @swagger
 * /login/user:
 *   post:
 *     summary : System Login
 *     security:
 *      - jwt: []
 *     description: For User and Admin Login
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
 *       401:
 *         description: Invalid username or password
 */

// app.post('/login/user', async (req, res) => {
// 	console.log(req.body);

// 	let user = await User.login(req.body.username, req.body.password);
	
// 	if (user.status == ("invalid username" || "invalid password")) {
// 		res.status(401).send("invalid username or password");
// 		return
// 	}


// 	res.status(200).json({
// 		username: user.username,
// 		name: user.Name,
// 		officerno: user.officerno,
// 		rank: user.Rank,
// 		phone: user.Phone,
// 		token: generateAccessToken({ rank: user.Rank })

// 	});
// })

app.post('/login/user', async (req, res) => {
	console.log(req.body);
  
	let user = await User.login(req.body.username, req.body.password);
  
	if (user.status == ("invalid username" || "invalid password")) {
	  res.status(401).send("invalid username or password");
	  return;
	}
  
	// Retrieve all users from the database after successful login
	try {
	  const allUsers = await User.getAllUsers();
	  res.status(200).json({
		users: allUsers,
		token: generateAccessToken({ rank: user.Rank }),
	  });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });
  

app.get('/view/visitor', async (req, res) => {
	try {
	  const allVisitors = await Visitor.getAllVisitors(); // Add this method in the Visitor class
	  res.status(200).json(allVisitors);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });

// /**
//  * @swagger
//  * /login/visitor:
//  *   post:
//  *     summary : Visitor Account Login
//  *     description: Visitor Login
//  *     tags: 
//  *     - Visitor
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               password: 
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful login
//  *       401:
//  *         description: Invalid username or password
//  */

// app.post('/login/visitor', async (req, res) => {
// 	console.log(req.body);

// 	let user = await Visitor.login(req.body.username, req.body.password);

// 	if (user.status == ("invalid username" || "invalid password")) {
// 		res.status(401).send("invalid username or password");
// 		return
// 	}

// 	res.status(200).json({
// 		username: user.username,
// 		name: user.Name,
// 		age: user.Age,
// 		gender: user.Gender,
// 		relation: user.Relation,
// 		token: generateAccessToken({ username: user.username })
// 	});
// })

//--------------------REGISTER OFFICER (USER)--------------------
/**
 * @swagger
 * /register/user:
 *   post:
 *     summary : User Account Registration
 *     security:
 *      - jwt: []
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

app.post('/register/user', verifyToken, async (req, res) => {
	console.log(req.body);
	
	const reg = await User.register(req.body.username, req.body.password, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
	console.log(reg);

	res.json({reg})
})

// /**
//  * @swagger
//  * /register/visitor:
//  *   post:
//  *     summary : Visitor Account Registration
//  *     description: Visitor Registration
//  *     tags:
//  *     - Visitor
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               password: 
//  *                 type: string
//  *               name: 
//  *                 type: string
//  *               age:
//  *                 type: integer
//  *               gender:
//  *                 type: string
//  *               relation:
//  *                 type: string
//  *               telno:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful registered
//  *       401:
//  *         description: There is an error during registration , Please try again
//  */

// app.post('/register/visitor', async (req, res) => {
// 	console.log(req.body);

// 		const reg = await Visitor.register(req.body.username, req.body.password, req.body.name, req.body.age, req.body.gender, req.body.relation, req.body.telno);
// 		console.log(reg);
	
// 	res.json({reg})
// })

// app.use(verifyToken);

// /**
//  * @swagger
//  * /create/visitorpass:
//  *   post:
//  *     summary : VisitorPass Creation
//  *     security:
//  *      - jwt: []
//  *     tags:
//  *     - User
//  *     description: Create VisitorPass
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               logno:
//  *                 type: integer
//  *               username: 
//  *                 type: string
//  *               inmateno: 
//  *                 type: string
//  *               dateofvisit:
//  *                 type: string
//  *               timein:
//  *                 type: string
//  *               timeout:
//  *                 type: string
//  *               purpose:
//  *                 type: string
//  *               officerno:
//  *                 type: string

//  *     responses:
//  *       200:
//  *         description: Successful registered
//  *       401:
//  *         description: There is an error during registration , Please try again
//  */


// //  app.post('/create/visitorpass', async (req, res) => {
// // 	console.log(req.body);

// // 	if (req.user.rank == "officer" || "security" || "admin"){
// // 		const reg = await Visitorlog.register(req.body.logno, req.body.username, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
// // 		res.status(200).send(reg)
// // 	}
// // 	else{
// // 		res.status(403).send("You are unauthorized")
// // 	}
// // })

// app.post('/create/visitorpass', async (req, res) => {
// 	try {
// 	  const reg = await Visitorlog.register(req.body.logno, req.body.username, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
// 	  res.status(200).send(reg);
  
// 	  // Optionally, you can call the retrieval function here to display the created visitor pass immediately
// 	  // const retrievedPass = await Visitorlog.retrieveVisitorPass(req.body.inmateno);
// 	  // console.log('Created Visitor Pass:', retrievedPass);
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });

// /**
//  * @swagger
//  * /create/visitorpass:
//  *   post:
//  *     summary : VisitorPass Creation
//  *     security:
//  *      - jwt: []
//  *     tags:
//  *     - User
//  *     description: Create VisitorPass
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               inmateno: 
//  *                 type: string
//  *               relationship:
//  *                 type: string
//  *               timein:
//  *                 type: string
//  *               timeout:
//  *                 type: string
//  *               officerno:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful registered
//  *       401:
//  *         description: There is an error during registration, Please try again
//  */

// app.post('/create/visitorpass', async (req, res) => {
// 	try {
// 	  const reg = await Visitorlog.register(
// 		req.body.inmateno,
// 		req.body.relationship,
// 		req.body.timein,
// 		req.body.timeout,
// 		req.body.officerno
// 	  );
// 	  res.status(200).send(reg);
  
// 	  // Optionally, you can call the retrieval function here to display the created visitor pass immediately
// 	  // const retrievedPass = await Visitorlog.retrieveVisitorPass(req.body.inmateno);
// 	  // console.log('Created Visitor Pass:', retrievedPass);
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });

// /**
//  * @swagger
//  * /create/visitorpass:
//  *   post:
//  *     summary : VisitorPass Creation
//  *     security: 
//  *      - jwt: []
//  *     tags:
//  *     - User
//  *     description: Create VisitorPass
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               inmateName: 
//  *                 type: string
//  *               visitorRelationship:
//  *                 type: string
//  *               timeIn:
//  *                 type: string
//  *               timeOut:
//  *                 type: string
//  *               officerno:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful registered
//  *       401:
//  *         description: There is an error during registration , Please try again
//  */
// // app.post('/create/visitorpass', async (req, res) => {
// // 	try {
// // 	  // Extracting relevant parameters from the request body
// // 	  const { inmateName, visitorRelationship, timeIn, timeOut, officerno } = req.body;
  
// // 	  // Checking user authorization
// // 	  if (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin') {
// // 		// Call the register function with the extracted parameters
// // 		const reg = await Visitorlog.register({
// // 		  inmateName,
// // 		  visitorRelationship,
// // 		  timeIn,
// // 		  timeOut,
// // 		  officerno,
// // 		});
  
// // 		res.status(200).send(reg);
// // 	  } else {
// // 		res.status(403).send("You are unauthorized");
// // 	  }
// // 	} catch (error) {
// // 	  console.error(error);
// // 	  res.status(500).json({ error: 'Internal server error' });
// // 	}
// //   });
  
// app.post('/create/visitorpass', verifyToken, async (req, res) => {
// 	try {
// 	  const { inmateName, visitorRelationship, timeIn, timeOut, officerno } = req.body;
  
// 	  if (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin') {
// 		const reg = await Visitorlog.register({
// 		  inmateName,
// 		  visitorRelationship,
// 		  timeIn,
// 		  timeOut,
// 		  officerno,
// 		});
  
// 		res.status(200).send(reg);
// 	  } else {
// 		res.status(403).send("You are unauthorized");
// 	  }
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });

/**
 * @swagger
 * /create/visitorpass:
 *   post:
 *     summary: VisitorPass Creation
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Create VisitorPass
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               inmateName: 
 *                 type: string
 *               visitorRelationship:
 *                 type: string
 *               timeIn:
 *                 type: string
 *               timeOut:
 *                 type: string
 *               officerno:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registered
 *       401:
 *         description: There is an error during registration, Please try again
 */

app.post('/create/visitorpass', verifyToken, async (req, res) => {
	try {
	  const {
		inmateName,
		visitorRelationship,
		timeIn,
		timeOut,
		officerno,
		firstname,
		lastname
	  } = req.body;
  
	  if (
		req.user.rank === 'officer' ||
		req.user.rank === 'security' ||
		req.user.rank === 'admin'
	  ) {
		const reg = await Visitorlog.register({
		  inmateName,
		  visitorRelationship,
		  timeIn,
		  timeOut,
		  officerno,
		  firstname,
		  lastname
		});
  
		res.status(200).send(reg);
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
 * /register/inmate:
 *   post:
 *     summary : Inmate Registration
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

//  app.post('/register/inmate', async (req,res)=>{
// 	console.log(req.body)

// 	if (req.user.rank == "officer" || "security" || "admin"){
// 		const reg = await Inmate.register(req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty );
// 		res.status(200).send(reg)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}

// })

app.post('/register/inmate', verifyToken, async (req, res) => {
	try {
	  console.log(req.body);
	  
	  if (req.user && (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin')) {
		const reg = await Inmate.register(req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty);
		res.status(200).send(reg);
	  } else {
		res.status(403).send("You are unauthorized");
	  }
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });
  

// /**
//  * @swagger
//  * /user/update:
//  *   patch:
//  *     security:
//  *      - jwt: []
//  *     description: User Update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               name: 
//  *                 type: string
//  *               officerno:
//  *                 type: string
//  *               rank:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful updated
//  *       401:
//  *         description: There is an error during updating , Please try again
//  */

// app.patch('/user/update', async (req, res) => {
// 	console.log(req.body);

// 	if (req.user.rank == "officer"){
// 		const update = await User.update(req.body.username, req.body.name, req.body.officerno, req.body.rank, req.body.phone);
// 		res.status(200).send(update)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}

// })

// /**
//  * @swagger
//  * /visitor/update:
//  *   patch:
//  *     security:
//  *      - jwt: []
//  *     description: Visitor Update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               password: 
//  *                 type: string
//  *               name: 
//  *                 type: string
//  *               age:
//  *                 type: integer
//  *               gender:
//  *                 type: string
//  *               relation:
//  *                 type: string
//  *               telno:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful updated
//  *       401:
//  *         description: There is an error during updating , Please try again
//  */

// app.patch('/visitor/update', async (req, res) => {
// 	console.log(req.body);

// 	if (req.user.rank == "officer"){
// 		const update = await Visitor.update(req.body.username, req.body.name, req.body.age, req.body.gender, req.body.relation, req.body.telno);
// 		res.status(200).send(update)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /inmate/update:
//  *   patch:
//  *     security:
//  *      - jwt: []
//  *     description: Inmate Update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               inmateno: 
//  *                 type: string
//  *               firstname: 
//  *                 type: string
//  *               lastname: 
//  *                 type: string
//  *               age:
//  *                 type: integer
//  *               gender:
//  *                 type: string
//  *               guilty:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Successful updated
//  *       401:
//  *         description: There is an error during updating , Please try again
//  */

//  app.patch('/inmate/update', async (req, res) => {
// 	console.log(req.body);
// 	if (req.user.rank == "officer"){
// 		const update = await Inmate.update( req.body.inmateno, req.body.firstname, req.body.lastname, req.body.age, req.body.gender, req.body.guilty);
// 		res.status(200).send(update)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /VisitorPass/update:
//  *   patch:
//  *     security:
//  *      - jwt: []
//  *     description: Visitorlog Update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               logno:
//  *                 type: integer
//  *               inmateno: 
//  *                 type: string
//  *               dateofvisit:
//  *                 type: string
//  *               timein:
//  *                 type: string
//  *               timeout:
//  *                 type: string
//  *               purpose:
//  *                 type: string
//  *               officerno:
//  *                 type: string

//  *     responses:
//  *       200:
//  *         description: Successful updated
//  *       401:
//  *         description: There is an error during updating , Please try again
//  */

//  app.patch('/visitorlog/update', async (req, res) => {
// 	console.log(req.body);

// 	if (req.user.username == req.body.username){
// 		const update = await Visitorlog.update(req.body.logno, req.body.inmateno, req.body.dateofvisit, req.body.timein, req.body.timeout, req.body.purpose, req.body.officerno);
// 		res.status(200).send(update)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /delete/user:
//  *   delete:
//  *     security:
//  *      - jwt: []
//  *     description: Delete User
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               
//  *     responses:
//  *       200:
//  *         description: Successful delete
//  *       401:
//  *         description: There is an error during deleting , Please try again
//  */

// app.delete('/delete/user', async (req, res) => {
// 	if (req.user.rank == "officer"){
// 		const del = await User.delete(req.body.username)
// 		res.status(200).send(del)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /delete/visitor:
//  *   delete:
//  *     security:
//  *      - jwt: []
//  *     description: Delete Visitor
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               username: 
//  *                 type: string
//  *               
//  *     responses:
//  *       200:
//  *         description: Successful deleted
//  *       401:
//  *         description: There is an error during deleting , Please try again
//  */

// app.delete('/delete/visitor', async (req, res) => {
// 	if (req.user.rank == "officer"){
// 		const del = await Visitor.delete(req.body.username)
// 		res.status(200).send(del)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// /**
//  * @swagger
//  * /delete/Inmate:
//  *   delete:
//  *     security:
//  *      - jwt: []
//  *     description: Delete Inmate
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               inmateno: 
//  *                 type: string
//  *               
//  *     responses:
//  *       200:
//  *         description: Successful deleted
//  *       401:
//  *         description: There is an error during deleting , Please try again
//  */

//  app.delete('/delete/inmate', async (req, res) => {
// 	if (req.user.rank == "officer"){
// 		const del = await Inmate.delete(req.body.inmateno)
// 		res.status(200).send(del)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

/**
 * @swagger
 * /delete/VisitorPass:
 *   delete:
 *     summary : Delete VisitorPass
 *     security:
 *      - jwt: []
 *     tags:
 *     - User
 *     description: Delete VisitorPass
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

 app.delete('/delete/visitorpass', async (req, res) => {
	if (req.user.rank == "officer" || "security" || "admin"){
		const del = await Visitorlog.delete(req.body.logno)
		res.status(200).send(del)
	}
	else{
		res.status(403).send("You are unauthorized")
	}
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/create/customer/admin', verifyToken, async (req, res) => {
  let result = createcustomer(
    req.body.customername,
    req.body.idproof
  ); 
  res.send(result);
});

app.post('/add/sensor',async(req,res)=>{
  let result = addsensor(
    req.body.sensor,
    req.body.date,
    req.body.time,
    req.body.value,
    req.body.id,
    req.body.name
  );
  res.send(result) 
});

function addsensor(reqsensor, reqdate, reqtime, reqvalue, reqname, reqidproof) {
  client.db().collection().insertMany({
      "sensor": reqsensor,
      "date": reqdate,
      "time": reqtime,
      "value": reqvalue,
      "name": reqname,
      "id": reqidproof

    });
    return "sensor added";
  }

app.patch('/update/value/:id',async(req,res)=>{
  const search = req.params.id;
  const value = req.body.value;
  await client.db().collection().updateOne({id: search},{$set:value});
}) 
