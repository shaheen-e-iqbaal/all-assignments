const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json());

const secretkey1 = 'secretSuperstar';
const secretkey2 = 'chhupaRustam';

const generatejwtadmin = (data)=>{
  const token = jwt.sign(data, secretkey1, {expiresIn : '1h'});
  return token;
}

const generateJwtuser = (data)=>{
  const token = jwt.sign(data, secretkey2, {expiresIn : '1h'});
  return token;
}

const decodejwtadmin = (req,res,next)=>{
  let data = req.headers.authorization;
  const token = data.split(' ')[1];
  jwt.verify(token,secretkey1,(error,user)=>{
    if(error)res.json('authorization failed');
    next();
  })
}
const decodejwtuser = (req,res,next)=>{
  let data = req.headers.authorization;
  const token = data.split(' ')[1];
  jwt.verify(token,secretkey2,(error,user)=>{
    if(error)res.json('authorization failed');
    next();
  })
}


let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
});

app.post('/admin/courses', (req, res) => {
  // logic to create a course
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
