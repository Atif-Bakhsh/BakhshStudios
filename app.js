import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import morgan from 'morgan'; // Import morgan

// Initialize dotenv to load environment variables
dotenv.config();


// Import your database functions
import { getClientIdByEmail, getServiceIdByName, createBooking, newClient, validateUser, getUserByEmail, getAllBookings, getUserAndBookingsByEmail, updateClientInfo, updateBooking, deleteBooking } from './database.js';

// Create an Express application
const app = express();

// Use middleware for handling JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));


// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

app.post('/updateBooking', authenticateToken, async (req, res) => {
    try {
        const { bookingId, serviceName, date, time, location, notes } = req.body;
        const response = await updateBooking(bookingId, serviceName, date, time, location, notes);
        res.json(response);
    } catch (error) {
        console.error("Error in /updateBooking route:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.delete('/deleteBooking/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const response = await deleteBooking(bookingId);
        res.json(response);
    } catch (error) {
        console.error("Error in /deleteBooking route:", error);
        res.status(500).send("Internal Server Error");
    }
});




app.get("/user/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const user = await getUserByEmail(email);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error in GET /user route:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/updateUserInfo', authenticateToken, async (req, res) => {
    try {
        const clientId = req.user.id; // Assuming the client's ID is in the JWT token
        const { name, phoneNumber } = req.body;

        // Input validation (basic example, consider more robust validation)
        if (!name || !phoneNumber) {
            return res.status(400).send("Name and phone number are required.");
        }

        const response = await updateClientInfo(clientId, name, phoneNumber);
        res.json(response);
    } catch (error) {
        console.error("Error in /updateUserInfo route:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post("/clients", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const response = await newClient(name, email, phone, password); 
        res.status(201).json(response);
    } catch (error) {
        console.error("Error in /clients route:", error);
        if (error.message === "Email already exists") {
            res.status(400).send("Email already exists");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
});


// In app.js

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const validationResponse = await validateUser(email, password);
    console.log(validationResponse);

    if (validationResponse.valid) {
        const user = validationResponse.user;
        const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});


// Middleware function to authenticate JWT tokensd
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Ensure this contains the 'email' field
        next();
    });
}


// app.get('/profile', authenticateToken, async (req, res) => {
//     try {
//         const userEmail = req.user.email; // Assuming email is included in the JWT payload
//         const userDetails = await getUserByEmail(userEmail); // Fetch user details from database

//         if (userDetails) {
//             res.json({
//                 email: userDetails.Email,
//                 name: userDetails.Name,
//                 phoneNumber: userDetails.PhoneNumber
//             });
//         } else {
//             res.status(404).send('User not found');
//         }
//     } catch (error) {
//         console.error('Error fetching user data:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email; // Extracted from JWT payload
        const clientDetails = await getUserAndBookingsByEmail(userEmail);

        if (clientDetails) {
            res.json(clientDetails);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.post("/bookings", authenticateToken, async (req, res) => {
    try {
        const { serviceType, date, time, location, notes } = req.body;
        // console.log("req.body", req.body);
        const clientId = req.user.id; // Extracting ClientID from the JWT token
        // consle.log("clientId", clientId);

        const response = await createBooking(clientId, serviceType, date, time, location, notes);
        res.status(201).json(response);
    } catch (error) {
        console.error("Error in /bookings route:", error);
        res.status(500).send("Internal Server Error");
    }
});



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => console.log('Server running on port 8080'));



// import express from 'express';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import morgan from 'morgan'; // Import morgan

// // Initialize dotenv to load environment variables
// dotenv.config();


// // Import your database functions
// import { getClientIdByEmail, getServiceIdByName, createBooking, newClient, validateUser, getUserByEmail, getAllBookings, getUserAndBookingDetailsByEmail } from './database.js';

// // Create an Express application
// const app = express();

// // Use middleware for handling JSON and URL encoded data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(morgan('dev'));


// // JWT secret key
// const JWT_SECRET = process.env.JWT_SECRET;


// app.post("/bookings", async (req, res) => {
//     try {
//         const { serviceType, date, time, location, notes } = req.body;

//         // const { serviceName, date, time, location, notes } = req.body;
//         const response = await createBooking(serviceType, date, time, location, notes);
//         res.status(201).json(response);
//     } catch (error) {
//         console.error("Error in /bookings route:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

// // app.get("/user/:email", async (req, res) => {
// //     try {
// //         const email = req.params.email;
// //         const userProfileAndBookings = await getUserProfileAndBookings(email);
// //         if (userProfileAndBookings) {
// //             res.json(userProfileAndBookings);
// //         } else {
// //             res.status(404).send("User not found");
// //         }
// //     } catch (error) {
// //         console.error("Error in GET /user route:", error);
// //         res.status(500).send("Internal Server Error");
// //     }
// // });



// app.post("/clients", async (req, res) => {
//     try {
//         const { name, email, phone, password } = req.body;
//         const response = await newClient(name, email, phone, password); 
//         res.status(201).json(response);
//     } catch (error) {
//         console.error("Error in /clients route:", error);
//         if (error.message === "Email already exists") {
//             res.status(400).send("Email already exists");
//         } else {
//             res.status(500).send("Internal Server Error");
//         }
//     }
// });


// // In app.js

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     const validationResponse = await validateUser(email, password);
//     console.log(validationResponse);

//     if (validationResponse.valid) {
//         const user = validationResponse.user;
//         const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
//         res.json({ accessToken });
//     } else {
//         res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
// });

// app.get('/user-details', authenticateToken, async (req, res) => {
//     try {
//         const userEmail = req.user.email;
//         const userAndBookingDetails = await getUserAndBookingDetailsByEmail(userEmail);

//         if (userAndBookingDetails && userAndBookingDetails.length > 0) {
//             // Format the response
//             const response = {
//                 email: userAndBookingDetails[0].Email,
//                 name: userAndBookingDetails[0].Name,
//                 phoneNumber: userAndBookingDetails[0].PhoneNumber,
//                 bookings: userAndBookingDetails.map(booking => ({
//                     serviceName: booking.ServiceName,
//                     date: booking.Date,
//                     time: booking.Time,
//                     location: booking.Location,
//                     additionalNotes: booking.AdditionalNotes
//                 }))
//             };
//             res.json(response);
//         } else {
//             res.status(404).send('User details not found');
//         }
//     } catch (error) {
//         console.error('Error fetching user and booking details:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// // Middleware function to authenticate JWT tokensd
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token == null) return res.sendStatus(401);

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user; // Ensure this contains the 'email' field
//         next();
//     });
// }


// app.get('/profile', authenticateToken, async (req, res) => {
//     try {
//         const userEmail = req.user.email; // Assuming email is included in the JWT payload
//         const userDetails = await getUserByEmail(userEmail); // Fetch user details from database

//         if (userDetails) {
//             res.json({
//                 email: userDetails.Email,
//                 name: userDetails.Name,
//                 phoneNumber: userDetails.PhoneNumber
//             });
//         } else {
//             res.status(404).send('User not found');
//         }
//     } catch (error) {
//         console.error('Error fetching user data:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });




// app.get("/bookings", async (req, res) => {
//     try {
//         const bookings = await getAllBookings();
//         res.json(bookings);
//     } catch (error) {
//         console.error("Error in GET /bookings route:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

// app.listen(8080, () => console.log('Server running on port 8080'));