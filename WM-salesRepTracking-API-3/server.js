import express from 'express'
import cors from 'cors'
import mysql from 'mysql'

const app = express();
const funtions = require("firebase-functions");
app.use(cors());
app.use(express.json());

app.listen(8081, () => {
    console.log('Server is running on port 8081');
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to database server:', err);
            return;
        }
        console.log('Database server is connected');
    });
})

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "isuru123",
    database: "sales_track"
});

app.get('/getCustomerSales', (req, res) => {
    const sql = "SELECT * FROM sales WHERE customerId=?";
    const id = req.params.id;
    db.query(sql, [id], (err, result) => {
        if (err) return res.json(err);
        return res.json(result);

    })
})

app.get('/getSalesData', (req, res) => {
    const sql = "SELECT * FROM sales"

    db.query(sql, (err, result) => {
        if (err) return res.json(err)
        return res.json(result);
    })
})

app.get('/SalesData/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM sales WHERE salesId = ?"

    db.query(sql, id, (err, result) => {
        if (err) return res.json(err)
        return res.json(result);
    })
})

app.get('/getSalesData/:repsId', (req, res) => {
    const repId = req.params.repsId;
    const sql = "SELECT * FROM sales WHERE repId = ?"

    db.query(sql, repId, (err, result) => {
        if (err) return res.json(err)
        return res.json(result);
    })
})

app.get('/getrepContact/:repsId', (req, res) => {
    const repId = req.params.repsId;
    const sql = "SELECT mobileNo FROM user WHERE id = ?"

    db.query(sql, repId, (err, result) => {
        if (err) return res.json(err)
        return res.json(result);
    })
})

app.get('/getSalesDataBydate/:repId', (req, res) => {
    const repId = req.params.repId;
    const currentDate = new Date().toISOString().slice(0, 10); // Get the current date in 'YYYY-MM-DD' format
    const sql = "SELECT * FROM sales WHERE repId = ? AND DATE(time) = ?";

    db.query(sql, [repId, currentDate], (err, result) => {
        if (err) return res.json(err);
        return res.json(result);
    });
});


function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }
    return password;
}


app.post('/regUser', (req, res) => {
    const generatedPassword = generateRandomPassword(8);
    const sql = "INSERT INTO user (name, userName, pw, mobileNo, address, type ) VALUES (?,?,?,?,?,?)"
    const values = [
        req.body.name,
        req.body.userName,
        generatedPassword,
        req.body.mobileNo,
        req.body.address,
        req.body.type,
    ];

    db.query(sql, values, (err, result) => {
        if (err) return res.json(err);
        return res.json(result);
    })
})

app.post('/regCustomer', (req, res) => {
    const sql = "INSERT INTO customer (name,address,mobileNo,repId) VALUES (?,?,?,?)";
    const values = [
        req.body.name,
        req.body.address,
        req.body.mobileNo,
        req.body.repId
    ]
    db.query(sql, [values], (err, result) => {
        if (err) return res.json(err);
        return res.json(result);
    })
})


app.post('/saveLocation', (req, res) => {
    const sql = "INSERT INTO location (repId,location) VALUES (?,?)";
    const values = [
        req.body.repId,
        req.body.location
    ]

    db.query(sql, [values], (err, result) => {
        if (err) return res.json(err)
        return res.json(result);
    })
})

app.post('/saveSale', (req, result) => {
    const sql = "INSERT INTO sales (repId,customerId,itemName,qty,paymentMethod,bank,branch,amount,remarks,time) VALUES (?,?,?,?,?,?,?,?,?,?)"
    const values = [
        req.body.repId,
        req.body.customerId,
        req.body.itemName,
        req.body.qty,
        req.body.paymentMethod,
        req.body.bank,
        req.body.branch,
        req.body.amount,
        req.body.remarks
    ]

    db.query(sql, [values], (err, res) => {
        if (err) return res.json(err)
        return res.json(result)
    })

})

app.put('/updateSale/:id', (req, res) => {
    const saleId = req.params.id; // Extract the sale ID from the URL
    const { repId, customerId, itemName, qty, paymentMethod, bank, branch, amount, remarks } = req.body;

    // Customize the SQL query for updating the specific sale record
    const sql = "UPDATE sales SET repId = ?, customerId = ?, itemName = ?, qty = ?, paymentMethod = ?, bank = ?, branch = ?, amount = ?, remarks = ? WHERE id = ?";

    const values = [repId, customerId, itemName, qty, paymentMethod, bank, branch, amount, remarks, saleId];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.json(err);
        }

        return res.json(result);
    });
});


app.get('/login', (req, res) => {
    const {userName, pw} = req.query;
    const type = "leader";
    const sql = "SELECT * FROM user WHERE userName=? AND pw=? AND type=?";
    const values = [
        userName,
        pw,
        type
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.json(err);
        }
        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.status(401).send('Login failed');
        }
    });
});

app.get('/adminlogin', (req, res) => {
    const {userName, pw} = req.query;
    const type = "admin";
    const sql = "SELECT * FROM user WHERE userName=? AND pw=? AND type=?";
    const values = [
        userName,
        pw,
        type
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.json(err);
        }
        if (result.length > 0) {
            return res.send('Login successful');
        } else {
            return res.status(401).send('Login failed');
        }
    });
});


app.get('/getReps', (req, res) => {
    const type = "rep";
    const sql = "SELECT * FROM user WHERE type=?"

    db.query(sql, type, (err, result) => {
        if (err) return res.json({Message: "Error"})
        return res.json(result)
    })
})


app.get('/getRep/:managerId', (req, res) => {
    const managerId = req.params.managerId;

    const sql = "SELECT * FROM user WHERE managerId = ?";

    db.query(sql, managerId, (err, result) => {
        if (err) {
            return res.json({Message: "Error"});
        }
        return res.json(result);
    });
});

app.get('/getReps/:repId', (req, res) => {
    const repId = req.params.repId;

    const sql = "SELECT * FROM user WHERE id = ?";

    db.query(sql, repId, (err, result) => {
        if (err) {
            return res.json({Message: "Error"});
        }
        return res.json(result);
    });
});

app.get('/getRepsLocation/:repId', (req, res) => {
    const repId = req.params.repId;

    const sql = "SELECT lat,lng FROM location WHERE repId = ?";

    db.query(sql, repId, (err, result) => {
        if (err) {
            return res.json({Message: "Error"});
        }
        console.log(result);
        return res.json(result);
    });
});


app.get('/getSalesLeaders', (req, res) => {
    const type = "leader";
    const sql = "SELECT * FROM user WHERE type=?"

    db.query(sql, type, (err, result) => {
        if (err) return res.json({Message: "Error"})
        return res.json(result)
    })
})

app.get('/getRepRoot', (req, res) => {
    const sql = "SELECT * FROM "
})


app.get('/getCustomerDetails', (req, res) => {
    const sql = "SELECT * FROM customer"

    db.query(sql, (err, result) => {
        if (err) return res.json({Message: "Error"})
        return res.json(result);
    })
})

app.get('/getCustomerLocations', (req, res) => {
    const sql = "SELECT lat,lng FROM customer"
    db.query(sql, (err, result) => {
        if (err) return res.json(err)
        return res.json(result);
    })
})

exports.api = funtions