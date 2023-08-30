require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { join } = require('path');
const runRoute = require("./Routes/tenteruAPI");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/views", express.static(join(__dirname, "views")));
app.use("/tenteruv1", runRoute);

const port = process.env.NODE_ENV === "production" ? process.env.PORT : 5500;


  

app.get("/tenteruv1/home", (req, res) => {
    res.sendFile(join(__dirname, "views/index.html"));
});




// Specific routes are defined above the catch-all handler
// Catch-all handler should be the last route
app.all("*", (req, res) => {
    res.sendFile(join(__dirname, "views/404.html"));
});

app.listen(port, async (err) => {
    const chalk = (await import('chalk')).default;
    if (err) {
        throw new Error("Error connecting to the server");
    }
    console.log(chalk.bgRed(`Server is running on http://localhost:${port}`));
});

