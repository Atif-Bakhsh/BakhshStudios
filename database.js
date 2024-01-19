import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function runQueries() {
    try {
        const allBookings = await getAllBookings();
        console.log("All Bookings:", allBookings);
        const allClients = await getAllClients();
        console.log("All Clients:", allClients);
    } catch (error) {
        console.error("Error running queries:", error);
    }
}

// In database.js

// In database.js

export async function deleteBooking(bookingId) {
    try {
        const deleteQuery = `DELETE FROM Bookings WHERE BookingID = ?`;
        await pool.query(deleteQuery, [bookingId]);
        return { message: "Booking deleted successfully." };
    } catch (error) {
        console.error("Error in deleteBooking:", error);
        throw error;
    }
}

export async function updateBooking(bookingId, serviceName, date, time, location, notes) {
    try {
        const updateQuery = `
            UPDATE Bookings 
            SET ServiceName = ?, Date = ?, Time = ?, Location = ?, AdditionalNotes = ? 
            WHERE BookingID = ?
        `;
        await pool.query(updateQuery, [serviceName, date, time, location, notes, bookingId]);
        return { message: "Booking updated successfully." };
    } catch (error) {
        console.error("Error in updateBooking:", error);
        throw error;
    }
}


export async function getUserAndBookingsByEmail(email) {
    const query = `
        SELECT c.ClientID, c.Name, c.Email, c.PhoneNumber, b.BookingID, b.ServiceName, b.Date, b.Time, b.Location, b.AdditionalNotes
        FROM Clients c
        LEFT JOIN Bookings b ON c.ClientID = b.ClientID
        WHERE c.Email = ?
    `;
    try {
        const [rows] = await pool.query(query, [email]);
        if (rows.length > 0) {
            return {
                email: rows[0].Email,
                name: rows[0].Name,
                phoneNumber: rows[0].PhoneNumber,
                bookings: rows.map(row => ({
                    bookingID: row.BookingID,
                    serviceName: row.ServiceName,
                    date: row.Date,
                    time: row.Time,
                    location: row.Location,
                    additionalNotes: row.AdditionalNotes
                })).filter(booking => booking.bookingID != null)
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in getUserAndBookingsByEmail:', error);
        throw error;
    }
}

export async function updateClientInfo(clientId, newName, newPhone) {
    try {
        const updateQuery = `
            UPDATE Clients 
            SET Name = ?, PhoneNumber = ? 
            WHERE ClientID = ?
        `;
        await pool.query(updateQuery, [newName, newPhone, clientId]);
        return { message: "Client information updated successfully." };
    } catch (error) {
        console.error("Error in updateClientInfo:", error);
        throw error;
    }
}



export async function validateUser(email, password) {
    try {
        // Use 'ClientID as id' to alias the column name
        const query = `SELECT ClientID as id, Email, Password FROM Clients WHERE Email = ?`;
        const [rows] = await pool.query(query, [email]);
        console.log("rows", rows);

        if (rows.length > 0) {
            const user = rows[0];
            console.log("user", user);

            const validPassword = await bcrypt.compare(password, user.Password);
            if (validPassword) {
                console.log("Valid password");
                // Return an object with id and email
                return { valid: true, user: { id: user.id, email: user.Email } };
            }
        }
        return { valid: false };
    } catch (error) {
        console.error("Error in validateUser:", error);
        throw error;
    }
}




export async function getUserByEmail(email) {
    try {
        const query = `SELECT Name, Email, PhoneNumber FROM Clients WHERE Email = ?`;
        const [rows] = await pool.query(query, [email]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
}


export async function getAllBookings() {
    try {
        const [rows] = await pool.query("SELECT * FROM Bookings");
        return rows;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
}

export async function getAllClients() {
    try {
        const [rows] = await pool.query("SELECT * FROM Clients");
        return rows;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
}

export async function getClientIdByEmail(email) {
    try {
        console.log("email", email);
        const query = `SELECT ClientID FROM Clients WHERE Email = ?`;
        const [rows] = await pool.query(query, email);
        if (rows.length > 0) {
            console.log("rows[0].ClientID", rows[0].ClientID);
            return rows[0].ClientID;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching ClientID by email:", error);
        throw error;
    }
}

export async function getServiceIdByName(serviceName) {
    const query = 'SELECT ServiceID FROM Services WHERE ServiceName = ?';

    // Add console logs for debugging
    console.log('Executing query:', query);
    console.log('With parameters:', [serviceName]);

    try {
        // The query function returns an array where the first element is the rows
        const [rows] = await pool.query(query, [serviceName]);

        if (rows.length > 0) {
            // Return the ServiceID of the first row
            return rows[0].ServiceID;
        } else {
            // If no rows are returned, the service name does not exist
            return null;
        }
    } catch (error) {
        console.error('Error in getServiceIdByName:', error.message);
        throw error;
    }
}





export async function createBooking(clientId, serviceName, date, time, location, notes) {
    try {
        const insertQuery = `
            INSERT INTO Bookings (ClientID, ServiceName, Date, Time, Location, AdditionalNotes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await pool.query(insertQuery, [clientId, serviceName, date, time, location, notes]);

        return { message: "Booking successfully created." };
    } catch (error) {
        console.error("Error in createBooking:", error);
        throw error;
    }
}



export async function newClient(name, email, phone, password) {
    try {
        // Check if the email already exists in the database
        const query = `SELECT * FROM Clients WHERE Email = ?`;
        const [rows] = await pool.query(query, [email]);
        if (rows.length > 0) {
            throw new Error("Email already exists");
        }

        // Hash the password and create the new client
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `
            INSERT INTO Clients(Name, Email, PhoneNumber, Password) 
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(insertQuery, [name, email, phone, hashedPassword]);

        return { message: "Client successfully created." };
    } catch (error) {
        console.error("Error in creating Client:", error);
        throw error;
    }
}

runQueries();

// import mysql from 'mysql2';
// import dotenv from 'dotenv';
// import bcrypt from 'bcrypt';

// dotenv.config();

// const pool = mysql.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// }).promise();

// export async function runQueries() {
//     try {
//         const allBookings = await getAllBookings();
//         console.log("All Bookings:", allBookings);
//         const allClients = await getAllClients();
//         console.log("All Clients:", allClients);
//     } catch (error) {
//         console.error("Error running queries:", error);
//     }
// }

// // In database.js

// // In database.js

// export async function validateUser(email, password) {
//     try {
//         // Use 'ClientID as id' to alias the column name
//         const query = `SELECT ClientID as id, Email, Password FROM Clients WHERE Email = ?`;
//         const [rows] = await pool.query(query, [email]);
//         console.log("rows", rows);

//         if (rows.length > 0) {
//             const user = rows[0];
//             console.log("user", user);

//             const validPassword = await bcrypt.compare(password, user.Password);
//             if (validPassword) {
//                 console.log("Valid password");
//                 // Return an object with id and email
//                 return { valid: true, user: { id: user.id, email: user.Email } };
//             }
//         }
//         return { valid: false };
//     } catch (error) {
//         console.error("Error in validateUser:", error);
//         throw error;
//     }
// }




// export async function getUserByEmail(email) {
//     try {
//         const query = `SELECT Name, Email, PhoneNumber FROM Clients WHERE Email = ?`;
//         const [rows] = await pool.query(query, [email]);
//         if (rows.length > 0) {
//             return rows[0];
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Error fetching user by email:", error);
//         throw error;
//     }
// }


// export async function getAllBookings() {
//     try {
//         const [rows] = await pool.query("SELECT * FROM Bookings");
//         return rows;
//     } catch (error) {
//         console.error("Error fetching bookings:", error);
//         throw error;
//     }
// }

// export async function getAllClients() {
//     try {
//         const [rows] = await pool.query("SELECT * FROM Clients");
//         return rows;
//     } catch (error) {
//         console.error("Error fetching bookings:", error);
//         throw error;
//     }
// }

// export async function getClientIdByEmail(email) {
//     try {
//         console.log("email", email);
//         const query = `SELECT ClientID FROM Clients WHERE Email = ?`;
//         const [rows] = await pool.query(query, email);
//         if (rows.length > 0) {
//             console.log("rows[0].ClientID", rows[0].ClientID);
//             return rows[0].ClientID;
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Error fetching ClientID by email:", error);
//         throw error;
//     }
// }

// export async function getServiceIdByName(serviceName) {
//     const query = 'SELECT ServiceID FROM Services WHERE ServiceName = ?';

//     // Add console logs for debugging
//     console.log('Executing query:', query);
//     console.log('With parameters:', [serviceName]);

//     try {
//         // The query function returns an array where the first element is the rows
//         const [rows] = await pool.query(query, [serviceName]);

//         if (rows.length > 0) {
//             // Return the ServiceID of the first row
//             return rows[0].ServiceID;
//         } else {
//             // If no rows are returned, the service name does not exist
//             return null;
//         }
//     } catch (error) {
//         console.error('Error in getServiceIdByName:', error.message);
//         throw error;
//     }
// }





// export async function createBooking(serviceName, date, time, location, notes) {
//     try {
//         // No need to get the service ID anymore
//         // const serviceId = await getServiceIdByName(serviceName);

//         // Insert the new booking into the database
//         const insertQuery = `
//             INSERT INTO Bookings (ServiceName, Date, Time, Location, AdditionalNotes)
//             VALUES (?, ?, ?, ?, ?)
//         `;
//         await pool.query(insertQuery, [serviceName, date, time, location, notes]);

//         return { message: "Booking successfully created." };
//     } catch (error) {
//         console.error("Error in createBooking:", error);
//         throw error;
//     }
// }



// export async function newClient(name, email, phone, password) {
//     try {
//         // Check if the email already exists in the database
//         const query = `SELECT * FROM Clients WHERE Email = ?`;
//         const [rows] = await pool.query(query, [email]);
//         if (rows.length > 0) {
//             throw new Error("Email already exists");
//         }

//         // Hash the password and create the new client
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const insertQuery = `
//             INSERT INTO Clients(Name, Email, PhoneNumber, Password) 
//             VALUES (?, ?, ?, ?)
//         `;
//         await pool.query(insertQuery, [name, email, phone, hashedPassword]);

//         return { message: "Client successfully created." };
//     } catch (error) {
//         console.error("Error in creating Client:", error);
//         throw error;
//     }
// }

// export async function getUserAndBookingDetailsByEmail(email) {
//     try {
//         const query = `
//             SELECT c.Name, c.Email, c.PhoneNumber, b.ServiceName, b.Date, b.Time, b.Location, b.AdditionalNotes
//             FROM Clients c
//             LEFT JOIN Bookings b ON c.ClientID = b.ClientID
//             WHERE c.Email = ?
//         `;
//         const [rows] = await pool.query(query, [email]);
//         return rows; // This will return an array of user and booking details
//     } catch (error) {
//         console.error("Error fetching user and booking details:", error);
//         throw error;
//     }
// }



// runQueries();