const app = require("./app");

app.all("*", (req, res, next) => {
  res
    .status(400)
    .json({ message: "Can't find " + req.originalUrl + "in this server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
