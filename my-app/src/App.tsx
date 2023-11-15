import React from 'react';
import logo from './logo.svg';
import './App.css';
(global as any).__basedir = __dirname;
// imports
import express, { Request, Response } from 'express';
import path from 'path'; // Add this line to import the 'path' module
//local imports
import util from "./helpers/util"

//get config
import config from './config'
const { PORT: port } = config;

//connect to database
import database from './helpers/mongoose'


// start express application
console.log(`starting application on port ${port}`)
// preparing express app

// preparing express app
const app = express()

// Parse incoming json
app.use(express.json({ limit: '50mb' }))
// CORS
const cors = require('cors')
app.use(cors())
// Serve React app as static files
app.use(express.static(path.join(__dirname, 'client/build')));

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload wo.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React 
        </a>
      </header>
    </div>
  );
}
*/

app.get('/', async (req:Request, res:Response) => {
  let pageNum: number = Number(req.query.pageNum) || 1;
  console.log(__dirname);
  res.send('Hello World');
});

// Handle 404 Page 
app.get('*', (req: Request, res: Response) => {
  res.status(404).send({
    err:'Not found!',
  });
});


// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send({
    err: 'Something broke!',
  });
});


// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.tsx'));
});

app.listen(port, () => {
  console.log(`\nServer is up:\n\n\thttp://localhost:${port}\n\n`);
});
