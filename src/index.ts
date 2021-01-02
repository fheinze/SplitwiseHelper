import express from "express";
import Splitwise from "splitwise";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();
const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});

console.log(process.env);

if (process.env.CONSUMER_KEY && process.env.CONSUMER_SECRET) {
  const sw = Splitwise({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
  });

  sw.getCurrentUser()
    .then((response: any) => {
      console.log(
        colors.green(
          `Authentication with Splitwise SUCCESSFULL -> id: "${response.id}" first_name: "${response.first_name}" last_name: "${response.last_name}"`
        )
      );
    })
    .catch(() => {
      console.error(
        colors.red(
          `Authentication with Splitwise failed! Please check CONSUMER_KEY and CONSUMER_SECRET`
        )
      );
      process.exit(0);
    });
} else {
  console.error(
    colors.red("Please provide a CONSUMER_KEY and a CONSUMER_SECRET!")
  );
  process.exit(0);
}

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
