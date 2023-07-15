const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { count } = require('console');
app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let courseId = 1;
const secretkey1 = 'secretSuperstar';
const secretkey2 = 'chhupaRustam';

const generatejwtAdmin = (admin)=>{
  const token = jwt.sign(admin,secretkey1,{expiresIn : '1h'});
  return token;
}

const generatejwtUser = (user) => {
  const token = jwt.sign(user, secretkey2, { expiresIn: "1h" });
  return token;
};

const authenticateAdmin = (req,res,next)=>{
  let data = req.headers.authentication;
  const token = data.split(' ')[1];
  jwt.verify(token,secretkey1,(error,admin)=>{
    if(error)res.json('Admin Authentication failed');
    else{
      next();
    }
    
  })
}

const authenticateUser = (req, res, next) => {
  const data = req.headers.authentication;
  const token = data.split(" ")[1];
  jwt.verify(token, secretkey2, (error, user) => {
    if (error) res.json("User Authentication failed");
    else{
    req.token = token;
    next();
    }
  });
};

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  
  let token = generatejwtAdmin(req.body);
  let obj = {
    token:token
  }
  const path = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\admin.json";
  fs.readFile(path,'utf-8', (error,data)=>{
    data = JSON.parse(data);
    data.push(obj);
    fs.writeFile(path, JSON.stringify(data), (error) => {
      res.json({message:'Admin created succesfully',token:token});
    });
  })
  
});

app.post('/admin/login', authenticateAdmin, (req, res) => {
  // logic to log in admin
  res.json({message:'logged in succesfully',token:token});
});

app.post('/admin/courses', authenticateAdmin, (req, res) => {
  // logic to create a course
  let course = req.body;
  //course.courseId = courseId;
  const path = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\course.json";
  fs.readFile(path,'utf-8',(error,data)=>{
    data = JSON.parse(data);
    let alreadyExist = false;
    for(let i=0;i<data.length;i++){
      course.courseId = data[i].courseId;
      //console.log(course);
      //console.log(data[i]);
      if(JSON.stringify(data[i]) === JSON.stringify(course)){
        alreadyExist = true;
        break;
      }
    }
    if(alreadyExist === true){
      res.json('course already exist');
    }
    else{
    course.courseId = data.length+1;
    data.push(course);
    fs.writeFile(path,JSON.stringify(data),(error)=>{
      res.json({massage:'course created succesfully',courseId:course.courseId})
    })
  }
  })
});

app.put('/admin/courses/:courseId',authenticateAdmin, (req, res) => {
  // logic to edit a course
  const path = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\course.json";
  let courseId = Number(req.params.courseId);
  fs.readFile(path,'utf-8',(error,data)=>{
    data = JSON.parse(data);
    let index = -1;
    for(let i=0;i<data.length;i++){
      console.log(data[i].courseId);
      if(data[i].courseId === courseId){
        index = i;
        break;
      }
    }
    if(index !== -1){
      data[index] = req.body;
      data[index].courseId = courseId;
      fs.writeFile(path,JSON.stringify(data),(error)=>{
        res.json("course updated succesfully");
      })
      
    }
    else{
      res.json('course not found');
    }
  })
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  const path = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\course.json";
  fs.readFile(path,'utf-8',(error,data)=>{
    data = JSON.parse(data);
    res.json(data);
  })
});


// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const token = generatejwtUser(req.body);
  req.token = token;
  let obj = {
    token:token
  }
  const path1 =
    "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\user.json";
  fs.readFile(path1,'utf-8',(error,data)=>{
    data = JSON.parse(data);
    let available = data.find(a=> a === {token:token});
    if(available){
      res.json('user already available');
    }
    else{
    data.push(obj);
    fs.writeFile(path1,JSON.stringify(data),(error)=>{
      obj.purchasedCourses = [];
      const path2 = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\purchasedcourse.json"
      fs.readFile(path2,'utf-8',(error,data1)=>{
        data1 = JSON.parse(data1);
        data1.push(obj);
        fs.writeFile(path2, JSON.stringify(data1), (error) => {
          res.json({ message: "User created succesfully", token: token });
        });
      })
    })
  }
  })
  
});

app.post('/users/login',authenticateUser, (req, res) => {
  // logic to log in user
  res.json({ message: "User loggedin succesfully", token: token });
});

app.get('/users/courses',authenticateUser, (req, res) => {
  // logic to list all courses
  const path = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\course.json";
  fs.readFile(path, "utf-8", (error, data) => {
    data = JSON.parse(data);
    res.json(data);
  });
});

app.post("/users/courses/:courseId", authenticateUser, (req, res) => {
  // logic to purchase a course
  const courseId = Number(req.params.courseId);
  const coursepath = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\course.json";
  fs.readFile(coursepath,'utf-8',(error,data)=>{
    data = JSON.parse(data);
    const index = data.findIndex(a=> a.courseId === courseId);
    if(index>=0){
      const token = req.token;
      const course = data[index];
      const purchasedcoursepath = "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\purchasedcourse.json";
      fs.readFile(purchasedcoursepath,'utf-8',(error,data)=>{
        data = JSON.parse(data);
        const index = data.findIndex(a=> a.token === token);
        //console.log(data[index]);
          data[index].purchasedCourses.push(course);
          fs.writeFile(purchasedcoursepath,JSON.stringify(data),(error)=>{
            res.json("course purchased succesfully");
          })
      })
    }
    else{
      res.json('no such course available');
    }
  })
});

app.get('/users/purchasedCourses', authenticateUser, (req, res) => {
  // logic to view purchased courses
  const token = req.token;
  const purchasedcoursepath =
    "D:\\my_codes\\all-assignments\\week-3\\03-course-app-medium\\purchasedcourse.json";
  fs.readFile(purchasedcoursepath, "utf-8", (error, data) => {
    data = JSON.parse(data);
    const index = data.findIndex((a) => a.token === token);
    if(index>=0)
    res.json(data[index].purchasedCourses);
    else{
      res.json('no such user found');
    }
    
    
  });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});



rufnUKxhG224Nxtl;