import express, { response } from "express";
import Splitwise from "splitwise";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();
const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/metadata.json", (req, res) => {
  res.send(metadata);
});

type Metadata = {
  user: User;
  groups: Group[];
  categories: Category[];
};

type User = {
  id: string;
  first_name: string;
  last_name: string;
};

type Group = {};

type Category = {};

let metadata: Metadata;

const sw = Splitwise({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
});

function refreshMetadata(): Promise<Metadata> {
  let user: User;
  let groups: Group[];
  let categories: Category[];

  const userPromise = sw.getCurrentUser().then((response: User) => {
    user = response;
  });
  const groupsPromise = sw.getGroups().then((response: Group[]) => {
    groups = response;
  });
  const categoriesPromise = sw.getCategories().then((response: Category[]) => {
    categories = response;
  });

  return Promise.all([userPromise, groupsPromise, categoriesPromise]).then(
    () => {
      const result: Metadata = {
        user,
        groups,
        categories,
      };
      console.log(colors.green("Metadata REFRESHED"));
      metadata = result;
      return result;
    }
  );
}

if (process.env.CONSUMER_KEY && process.env.CONSUMER_SECRET) {
  sw.test()
    .then(() => {
      console.log(colors.green("Authentication SUCCESSFULL"));
      refreshMetadata();
    })
    .catch((error: any) => {
      console.log(
        colors.red(
          `Authentication with Splitwise failed! Please check CONSUMER_KEY and CONSUMER_SECRET`
        ),
        "\n"
      );
      console.log(colors.red(error));
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
