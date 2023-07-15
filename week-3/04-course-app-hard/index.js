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
  let token = req.headers.authenticate;
  token = token.split(' ')[1];
  jwt.verify(token,secretKey,(error,data)=>{
    if(error){
      res.status(403).json('wrong input');
    }
    else{
      req.user = data;
      next();
    }
  })
}
// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const present = await Admin.findOne(req.body);
  if(present){
    res.status(403).json('Admin exist already');
  }
  else{
    const newAdmin = new Admin(admin);
    await newAdmin.save();
    const token = generatejwt(req);
    res.status(200).json({'message':'Admin created succesfully',token:token});
  }
});

app.post('/admin/login', async (req, res) => {
  // logic to log in admin
  const admin = req.body;
  const present = await Admin.findOne(admin);
  if(present){
    res.status(200).json('Logged in succesfully');
  }
  else{
    res.status(404).json('Invalid credential');
  }
});

app.post('/admin/courses', authenticateJwt, async (req, res) => {
  // logic to create a course
  const course = req.body;
  //course.courseId = Math.floor(Math.random()*1000);
  const newcourse = new Course(course);
  await newcourse.save();
  res.status(200).json({'message':'course created','courseId':newcourse.id});
});

app.put('/admin/courses/:courseId', authenticateJwt, async (req, res) => {
  // logic to edit a course
  const courseId = req.params.courseId;
  const course = await Course.findByIdAndUpdate(courseId,req.body,{new :true});
  if(course){
    res.status(200).json('course updated succesfully');
  }
  else{
    res.status(404).json('no such courses');
  }
});

app.get('/admin/courses', authenticateJwt, async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.status(200).json(courses);
});

// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const user = req.body;
  const present = await User.findOne(user);
  if(present){
    res.status(404).json('User already exist');
  }
  else{
    const newuser = new User(user);
    newuser.save();
    const token = generatejwt(req);
    res.status(200).json({message:"user created succesfully",token:token});

  }
});

app.post('/users/login', authenticateJwt, (req, res) => {
  // logic to log in user
  res.status(200).json('Logged in succesfully');
});

app.get('/users/courses', authenticateJwt, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({});
  res.status(200).json(courses);

});

app.post('/users/courses/:courseId', authenticateJwt, async (req, res) => {
  // logic to purchase a course
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  
  if(!(course === null)){
    const user = await User.findOne({username:req.user.username,password:req.user.password});
    if(user){
    user.purchasedCourses.push(course);
    user.save();
    res.status(200).json('course purchased succesfully');
    }
    else{
      res.status(404).json('no such user available');
    }
  }
  else{
    res.status(404).json('no such course available');
  }
});

app.get('/users/purchasedCourses', authenticateJwt, async (req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({username:req.user.username,password:req.user.password});
  if(user){
    let courses = [];
    for(i = 0;i<user.purchasedCourses.length;i++){
      const course = await Course.findById(user.purchasedCourses[i]);
      courses.push(course);
    }
    res.status(200).json(courses);
  }
  else{
    res.status(404).json('no such user exist');
  }
  
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});



