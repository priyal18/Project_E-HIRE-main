import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import Join from "./components/Join";
import Create from "./components/Create";
import Editor from "./components/Editor";
import Video from "./components/Video";

function App() {
  return (
    <div className='App'>
      <h1>Hello</h1>
      <Router>
        <Switch>
          <Route path='/' exact>
            <Home />
          </Route>
          <Route path='/join' exact>
            <Join />
          </Route>
          <Route path='/create' exact>
            <Create />
          </Route>
          <Route path='/:id'>
            <Video />
            <Editor/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
