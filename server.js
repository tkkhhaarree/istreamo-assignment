const express = require("express");
const app = express();
const connectDB = require("./config/db");

connectDB();

app.use(express.json({ extended: false }));

app.use("/userauth", require("./routes/userauth"));

app.use("/post", require("./routes/post"));

app.use("/profile", require("./routes/profile"));

app.use("/explore", require("./routes/explore"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
