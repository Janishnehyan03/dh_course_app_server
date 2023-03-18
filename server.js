const mongoose = require("mongoose");
const app = require("./app");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./models/graphQlSchema");

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === "development",
  })
);

app.all("*", (req, res, next) => {
  res
    .status(400)
    .json({ message: "Can't find " + req.originalUrl + "in this server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
