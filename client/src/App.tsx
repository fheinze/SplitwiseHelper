import React from "react";
import { Route, BrowserRouter as Router, Switch, Link } from "react-router-dom";
import { Layout, Select } from "antd";
import { groups } from "./metadata";

import IndexPage from "./Containers/IndexPage";
import GroupPage from "./Containers/GroupPage";

import "antd/dist/antd.css";

function App() {
  return (
    <Router>
      <Layout>
        <Layout.Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
          <Select
            style={{ width: 200 }}
          >
            {groups.map((group) => {
              return (
                <Select.Option key={group.name} value={group.id}>
                  <Link to={`/group/${group.id}`}>{group.name}</Link>
                </Select.Option>
              );
            })}
          </Select>
        </Layout.Header>
        <Layout.Content
          className="site-layout"
          style={{
            padding: "0 50px",
            marginTop: 64,
            paddingTop: 40,
            background: "white",
          }}
        >
          <Switch>
            <Route path="/" exact strict component={IndexPage} />
            <Route path="/group/:id" component={GroupPage} />
            <Route render={() => <h1>NOT FOUND</h1>} />
          </Switch>
        </Layout.Content>
      </Layout>
    </Router>
  );
}

export default App;
