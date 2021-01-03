import express, { response } from "express";
import Splitwise from "splitwise";
import dotenv from "dotenv";
import colors from "colors";
import path from "path";
import { Group, Metadata, Expense, User, Category } from "./types/api";

dotenv.config();
const app = express();
const port = 8080;

let metadata: Metadata;

app.get("/metadata.js", (req, res) => {
  console.log("/metadata.js");
  res.send(`window.splitwiseHelper={ metadata: ${JSON.stringify(metadata)}};`);
});

app.get("/group/:id/expenses", (req, res) => {
  const group = metadata.groups.find(
    (group) => String(group.id) === req.params.id
  );

  sw.getExpenses({
    group_id: group.id,
    limit: 0,
  }).then((response: Expense[]) => {
    const expenses = response.filter((expense) => {
      return !expense.deleted_at;
    });
    res.send(expenses);
  });
});

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
      console.log(colors.green("Metadata REFRESHED"), result);
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
