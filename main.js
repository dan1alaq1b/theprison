const MongoClient = require("mongodb").MongoClient;
const User = require("./user.js");
const Visitor = require("./visitor.js");
const Inmate = require("./inmate.js");
//const Visitorlog = require("./visitorlog.js")
const VisitorPass = require('./visitorpass.js');

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
	//Visitorlog.injectDB(client);
	VisitorPass.injectDB(client);
})

const express = require('express')
const app = express()
const port = process.env.PORT || 3030

const jwt = require ('jsonwebtoken');
function generateAccessToken(payload){
	return jwt.sign(payload, "secretcode", { expiresIn: '1d' }); //expiration can be 'd' (day), 'h' (hour), 'm' (minute), 's' (second)
}



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
 *       404:
 *         description: Visitor pass not found
 *       500:
 *         description: Internal server error
 */


app.get('/retrieve/visitorpass', async (req, res) => {
	try {
	  const firstname = req.query.firstname;
	  const lastname = req.query.lastname;
  
	  // Retrieve visitor pass from the database based on inmate's name
	  const retrievedPass = await VisitorPass.retrieve({ firstname, lastname });
  
	  if (retrievedPass) {
		res.status(200).json({
		  status: 'Visitor pass retrieved successfully',
		  retrievedPass
		});
	  } else {
		res.status(404).json({ error: 'Visitor pass not found' });
	  }
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });

/**
 * @swagger
 * /login/system:
 *   post:
 *     summary: System Login
 *     description: For User and Admin Login
 *     tags:
 *       - System
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
 *             example:
 *               users: []
 *               inmates: []
 *               token: <token>
 *               role: <user/admin>
 *       401:
 *         description: Invalid username or password
 */

app.post('/login/system', async (req, res) => {
	console.log(req.body);
  
	let user = await User.login(req.body.username, req.body.password);
	let admin = await User.adminLogin(req.body.username, req.body.password);
  
	if (user.status === 'invalid username' && admin.status === 'invalid username') {
	  res.status(401).send('Invalid username or password');
	  return;
	}
  
	if (user.status === 'invalid password' && admin.status === 'invalid password') {
	  res.status(401).send('Invalid username or password');
	  return;
	}
  
	if (user.rank) {
	  const allUsers = await User.getAllUsers();
	  const allInmates = await Inmate.getAllInmates();
	  res.status(200).json({
		users: allUsers,
		inmates: allInmates,
		token: generateAccessToken({ rank: user.rank }),
		role: 'user'
	  });
	} else if (admin.rank) {
	  const allUsers = await User.getAllUsers();
	  const allInmates = await Inmate.getAllInmates();
	  res.status(200).json({
		users: allUsers,
		inmates: allInmates,
		token: generateAccessToken({ rank: admin.rank }),
		role: 'admin'
	  });
	}
  });
  
/**
 * @swagger
 * /delete/user:
 *   delete:
 *     summary: Delete User
 *     security:
 *      - jwt: []
 *     tags:
 *       - Admin
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
 *     responses:
 *       200:
 *         description: Successful delete
 *       401:
 *         description: There is an error during deleting , Please try again
 */
app.delete('/delete/user', async (req, res) => {
	if (req.user.rank === 'admin') {
	  const del = await User.delete(req.body.username);
	  res.status(200).send(del);
	} else {
	  res.status(403).send('You are unauthorized');
	}
  });
  
  /**
   * @swagger
   * /update/user:
   *   patch:
   *     summary: Update User Information
   *     security:
   *      - jwt: []
   *     tags:
   *       - Admin
   *     description: Update User Information
   *     parameters:
   *       - in: path
   *         name: username
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             type: object
   *             properties:
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
   *         description: Information updated
   *       401:
   *         description: There is an error during updating , Please try again
   */
  app.patch('/update/user/:username', async (req, res) => {
	const username = req.params.username;
	if (req.user.rank === 'admin') {
	  const updatedInfo = await User.update(
		username,
		req.body.name,
		req.body.officerno,
		req.body.rank,
		req.body.phone
	  );
	  res.status(200).send(updatedInfo);
	} else {
	  res.status(403).send('You are unauthorized');
	}
  });
  
  /**
   * @swagger
   * /delete/visitorpass:
   *   delete:
   *     summary: Delete VisitorPass
   *     security:
   *      - jwt: []
   *     tags:
   *       - User
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
   *     responses:
   *       200:
   *         description: Successful delete
   *       401:
   *         description: You are unauthorized
   */
  app.delete('/delete/visitorpass', async (req, res) => {
	if (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin') {
	  const del = await VisitorPass.delete(req.body.logno);
	  res.status(200).send(del);
	} else {
	  res.status(403).send('You are unauthorized');
	}
  });
  
  /**
   * @swagger
   * /update/visitorpass:
   *   patch:
   *     summary: Update VisitorPass
   *     security:
   *      - jwt: []
   *     tags:
   *       - User
   *     description: Update VisitorPass
   *     parameters:
   *       - in: path
   *         name: logno
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             type: object
   *             properties:
   *               firstname:
   *                 type: string
   *               lastname:
   *                 type: string
   *               visitorRelationship:
   *                 type: string
   *               timeIn:
   *                 type: string
   *               timeOut:
   *                 type: string
   *               officerno:
   *                 type: string
   *     responses:
   *       200:
   *         description: Information updated
   *       401:
   *         description: You are unauthorized
   */
  app.patch('/update/visitorpass/:logno', async (req, res) => {
	const logno = req.params.logno;
	if (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin') {
	  const updatedInfo = await VisitorPass.update(
		logno,
		req.body.firstname,
		req.body.lastname,
		req.body.visitorRelationship,
		req.body.timeIn 
		req.body.timeOut,
      	req.body.officerno 
	);
	res.status(200).send(updatedInfo);
  } else {
    res.status(403).send('You are unauthorized');
  }
});

/**
 * @swagger
 * /delete/inmate:
 *   delete:
 *     summary: Delete Inmate
 *     security:
 *      - jwt: []
 *     tags:
 *       - User
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
 *     responses:
 *       200:
 *         description: Successful delete
 *       401:
 *         description: You are unauthorized
 */
app.delete('/delete/inmate', async (req, res) => {
	if (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin') {
	  const del = await Inmate.delete(req.body.inmateno);
	  res.status(200).send(del);
	} else {
	  res.status  (403).send('You are unauthorized');
	}
  });
  
  /**
   * @swagger
   * /update/inmate:
   *   patch:
   *     summary: Update Inmate Information
   *     security:
   *      - jwt: []
   *     tags:
   *       - User
   *     description: Update Inmate Information
   *     parameters:
   *       - in: path
   *         name: inmateno
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             type: object
   *             properties:
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
   *         description: Information updated
   *       401:
   *         description: You are unauthorized
   */
  app.patch('/update/inmate', async (req, res) => {
	if (req.user.rank === 'officer' || req.user.rank === 'security' || req.user.rank === 'admin') {
	  const updatedInfo = await Inmate.update(
		req.body.inmateno,
		req.body.firstname,
		req.body.lastname,
		req.body.age,
		req.body.gender,
		req.body.guilty
	  );
	  res.status(200).send(updatedInfo);
	} else {
	  res.status(403).send('You are unauthorized');
	}
  });

// /**
//  * @swagger
//  * /login/user:
//  *   post:
//  *     summary : System Login
//  *     security:
//  *      - jwt: []
//  *     description: For User and Admin Login
//  *     tags:
//  *     - System
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



// app.post('/login/user', async (req, res) => {
// 	console.log(req.body);
  
// 	let user = await User.login(req.body.username, req.body.password);
  
// 	if (user.status == ("invalid username" || "invalid password")) {
// 	  res.status(401).send("invalid username or password");
// 	  return;
// 	}
  
// 	// Retrieve all users from the database after successful login
// 	try {
// 	  const allUsers = await User.getAllUsers();
// 	  res.status(200).json({
// 		users: allUsers,
// 		token: generateAccessToken({ rank: user.Rank }),
// 	  });
// 	} catch (error) {
// 	  console.error(error);
// 	  res.status(500).json({ error: 'Internal server error' });
// 	}
//   });
  

app.get('/view/visitor', async (req, res) => {
	try {
	  const allVisitors = await Visitor.getAllVisitors(); // Add this method in the Visitor class
	  res.status(200).json(allVisitors);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });



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



/**
 * @swagger
 * /create/visitorpass:
 *   post:
 *     summary: VisitorPass Creation
 *     security:
 *      - jwt: []
 *     tags:
 *      - User
 *     description: Create VisitorPass
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               visitorRelationship:
 *                 type: string
 *               timeIn:
 *                 type: string
 *               timeOut:
 *                 type: string
 *               officerno:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created visitor pass
 *       401:
 *         description: You are unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/create/visitorpass', verifyToken, async (req, res) => {
	try {
	  const {
		firstname,
		lastname,
		timeIn,
		timeOut,
		officerno,
		visitorRelationship
	  } = req.body;
  
	  if (
		req.user.rank === 'officer' ||
		req.user.rank === 'security' ||
		req.user.rank === 'admin'
	  ) {
		const reg = await VisitorPass.create({
		  firstname,
		  lastname,
		  timeIn,
		  timeOut,
		  officerno,
		  visitorRelationship
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
//  * /delete/VisitorPass:
//  *   delete:
//  *     summary : Delete VisitorPass
//  *     security:
//  *      - jwt: []
//  *     tags:
//  *     - User
//  *     description: Delete VisitorPass
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema: 
//  *             type: object
//  *             properties:
//  *               logno: 
//  *                 type: integer
//  *               
//  *     responses:
//  *       200:
//  *         description: Successful delete
//  *       401:
//  *         description: There is an error during deleting , Please try again
//  */

//  app.delete('/delete/visitorpass', async (req, res) => {
// 	if (req.user.rank == "officer" || "security" || "admin"){
// 		const del = await Visitorlog.delete(req.body.logno)
// 		res.status(200).send(del)
// 	}
// 	else{
// 		res.status(403).send("You are unauthorized")
// 	}
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// app.post('/create/customer/admin', verifyToken, async (req, res) => {
//   let result = createcustomer(
//     req.body.customername,
//     req.body.idproof
//   ); 
//   res.send(result);
// });

// app.post('/add/sensor',async(req,res)=>{
//   let result = addsensor(
//     req.body.sensor,
//     req.body.date,
//     req.body.time,
//     req.body.value,
//     req.body.id,
//     req.body.name
//   );
//   res.send(result) 
// });

// function addsensor(reqsensor, reqdate, reqtime, reqvalue, reqname, reqidproof) {
//   client.db().collection().insertMany({
//       "sensor": reqsensor,
//       "date": reqdate,
//       "time": reqtime,
//       "value": reqvalue,
//       "name": reqname,
//       "id": reqidproof

//     });
//     return "sensor added";
//   }

// app.patch('/update/value/:id',async(req,res)=>{
//   const search = req.params.id;
//   const value = req.body.value;
//   await client.db().collection().updateOne({id: search},{$set:value});
// }) 
