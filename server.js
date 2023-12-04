const express = require("express");
const bcrypt = require("bcryptjs")
const app = express();
const port = 3000;
const mongoose = require("mongoose");
//connect to mongoose
mongoose
  .connect(
    "mongodb+srv://Prashraya:oversweet-essential@cluster0.cblu1tu.mongodb.net/registerdbretryWrites=true&w=majority"
  )
  .then(() => console.log("Db connected"))
  .catch(err => console.log(err.message));

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  password: String,
});
//model

const User = mongoose.model("User", userSchema);
//view engine setup ejs
app.set("view engine", "ejs");

//static files
app.use(express.static("public"));

//pass json data
app.use(express.json());

//pass form data
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/", (req, res) => {
  res.render("index");
});

//login form
app.get("/login", (req, res) => {
  res.render("login");
});

//Protected
app.get("/protected", (req, res) => {
  res.render("protected");
});

//login logic
app.post("/login", async (req, res) => {
  // res.render("login");
  //get the username and password
const {username, password} = req.body;

  try{
  // const userFound = await User.findOne({username: username})
  const userDocument = await User.findOne({username})

  if(!userDocument){
    return res.json({
      msg:"Invalid login credentials",

    })
  }
  //2. check if password is valid
  const isPasswordValid = await bcrypt.compare(password, userDocument.password);
  if(!isPasswordValid){
    return res.json({
      msg:"Invalid login credentials",

    });
  }
   console.log(" Login sucess");
  //API 
    // res.json({
    //   msg:"Login Success",
    //   userDocument,

    // });
  res.redirect(`/profile/${userDocument.id}`);
}catch(error){
  console.log(error);

}
  
});

//get Register form
app.get("/register", (req, res) => {
  res.render("register");
});

//Register user
app.post("/register",  async (req, res) => {
  const {fullName, username, password} = req.body; 
  
  //1. create salt
   const salt = await bcrypt.genSalt(10);

   //2. hash userPassword

   const hashedPassword = await bcrypt.hash(password, salt);
  
  try{ User.create({
      fullName,
      username,
      password: hashedPassword,
    }).then(user =>{res.redirect("/login")}).catch((err) =>{console.log(err)});
  }catch(error){
    console.log(error)

  }
 


});


//profile
app.get("/profile/:id", async (req, res) => {
 //find the user by id
 try{
  const user = await User.findById(req.params.id);
  res.render("profile", { user });
 

}catch(error){

  console.log(error);
 }
});
//listen
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
