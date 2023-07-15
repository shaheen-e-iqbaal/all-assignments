const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
app.use(express.json());

const secretKey = 'secretSuperstar';

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

// Define mongoose models
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);

mongoose.connect(
  "mongodb+srv://shaheeneallamaiqbal:rufnUKxhG224Nxtl@cluster0.uyeyspi.mongodb.net/courses",
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" },
);



const generatejwt = (req)=>{
  const {username,password} = req.body;
  const obj = {
    username:username,
    password:password,
  }
  const token = jwt.sign(obj,secretKey);
  return token;
}

const authenticateJwt = (req,res,next)=>{
  const token = req.headers.authenticate;
  jwt.verify(token,secretKey,(error,data)=>{
    if(error){
      res.status(403).json('wrong input');
    }
    else{
      next();
    }
  })
}
// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  console.log(admin);
  // const present = await Admin.findOne(req.body);
  // console.log('reached after await');
  // if(present){
  //   res.status(403).json('Admin exist already');
  // }
  // else{
  //   const newAdmin = new Admin(admin);
  //   await newAdmin.save();
  //   const token = generatejwt(req);
  //   res.status(200).json({'message':'Admin created succesfully',token:token});
  // }
  Admin.findOne(req.body).maxTimeMS(20000).exec((err, result)=>{
      if(result){
        res.status(404).json('admin exist already');
      }
      else{
          const newAdmin = new Admin(admin);
          newAdmin.save().then(()=>{
            const token = generatejwt(req);
            res.status(200).json({ message: "Admin created succesfully", token: token });
          });
          
      }
  })
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
