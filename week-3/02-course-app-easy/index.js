const express = require('express');
const app = express();
app.use(express.json());
let ADMINS = [];
let USERS = [];
let COURSES = [];
let PURCHASED_COURSE = [];
let courseId = 1;

const AdminAuthentication = (req,res,next)=>{
  let {username,password} = req.headers;
  for(let i=0;i<ADMINS.length;i++){
    if(ADMINS[i].username == username && ADMINS[i].password === password){
      next();
    }
  }
  res.json('Admin Authentication failed');
}

const UserAuthentication = (req, res, next) => {
  let { username, password } = req.headers;
  for (let i = 0; i < USERS.length; i++) {
    if (USERS[i].username == username && USERS[i].password === password) {
      next();
    }
  }
  res.json("User Authentication failed");
};


// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  let username = req.body.username;
  let password = req.body.password;
  let obj = {
    'username' : username,
    'password' : password,
  }
  for(let i=0;i<ADMINS.length;i++){
    if(ADMINS[i].username === username && ADMINS[i].password === password){
      res.json('Admin exist already');
    }
  }
  ADMINS.push(obj);
  res.json('Admin created succesfully');
});

app.post('/admin/login',AdminAuthentication, (req, res) => {
  // logic to log in admin
  res.json('logged in successfully');
});

app.post('/admin/courses',AdminAuthentication, (req, res) => {
  //
  let obj = req.body;
  obj.courseId=courseId;
  COURSES.push(obj);
  res.json({
    message:"course created succesfully",
    courseId : courseId++,
  })
});

app.put('/admin/courses/:courseId',AdminAuthentication, (req, res) => {
  // logic to edit a course
  let courseId = Number(req.params.courseId);
  

  for(let i=0;i<COURSES.length;i++){
    if (COURSES[i].courseId === courseId) {
      COURSES[i] = req.body;
      COURSES[i].courseId = courseId;
      res.json('course updated succesfully');
    }
  }
  res.json('course not found');
  
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  // for (let i = 0; i < ADMINS.length; i++) {
  //   if (
  //     ADMINS[i].username === req.headers.username &&
  //     ADMINS[i].password === req.headers.password
  //   ) {
  //     res.json(ADMINS[i].courses);
  //   }
  // }
  let courses = COURSES.find(a=> a.published===true);
  res.json(courses);
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let username = req.body.username;
  let password = req.body.password;
  let obj = {
    username: username,
    password: password,
    courses: [],
  };
  for (let i = 0; i < USERS.length; i++) {
    if (USERS[i].username === username && USERS[i].password === password) {
      res.json("User exist already");
    }
  }
  USERS.push(obj);
  res.json("User created succesfully");
});

app.post('/users/login',UserAuthentication, (req, res) => {
  // logic to log in user
  res.json('logged in succesfully');
});

app.get('/users/courses',UserAuthentication, (req, res) => {
  // logic to list all courses
  res.json(COURSES);
});

app.post('/users/courses/:courseId',UserAuthentication, (req, res) => {
  // logic to purchase a course
  let courseId = Number(req.params.courseId);

  for (let i = 0; i < USERS.length; i++) {
    if (
      USERS[i].username === req.headers.username &&
      USERS[i].password === req.headers.password
    ) {
      for (let j = 0; j < USERS[i].courses.length; j++) {
        if (ADMINS[i].courses[j].courseId === courseId) {
          res.json("course already purchased");
        }
      }
      for(let j=0;j<COURSES.length;j++){
        if(COURSES[j].courseId === courseId){
          USERS[i].courses.push(COURSES[j]);
          res.json('course purchased succesfully');
        }
      }
    }
  }
  res.json("course not found");
});

app.get('/users/purchasedCourses',UserAuthentication, (req, res) => {
  // logic to view purchased courses
  for(let i=0;i<USERS.length;i++){
    if(USERS[i].username === req.headers.username &&
      USERS[i].password === req.headers.password){
        if (USERS[i].courses.length) res.json('no purchase yet');
        res.json(USERS[i].courses);
      }
  }
  
});

app.listen(3000, () => {
  console.log('Server is listening on port 30001');
});
