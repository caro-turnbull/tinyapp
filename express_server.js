const express = require("express");
const cookieParser = require("cookie-parser")
const app = express()
const PORT = 8080

//Is this middleware?
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// Object "Databses"
const urlDatabase = {
  "b2xVn2": {
    shortId: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    user: "userRandomID"
  }, 
  "9sm5xK": {
    shortId: "9sm5xK",
    longURL: "http://www.google.com",
    user: "user2RandomID"
  },
  "abc123": {
    shortId: "abc123",
    longURL: "http://www.hotmail.com",
    user: "user2RandomID"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1a2b3C",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "xyz123",
  },
};


//Functions

function generateRandomString(){
  const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890"
  let result = ""
  for ( let i = 0; i <6; i++) {  //6 character long
    result += characters.charAt(Math.floor(Math.random() * 62)) //62 characters to pick from
  }
  return result
}

function userLookUpByID (userID) {
  let userObj
  for (let user in users) {
    if (user === userID){
      return users[userID]
    }
  }
  return null
}

function userLookUpByEmail (email) {
  for ( let userID in users){
    if (users[userID].email === email){
      return users[userID]
    }
  }
  return null
}

function urlsForUser(id) {
  //itterate through all urls
  //if url.user = param id
  // add that url object to an object
  let userUrls = {}
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].user){

      userUrls[url] = urlDatabase[url]
      console.log(userUrls[url]);
    }
  }
    return userUrls
  }



//Routes

app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {               //url list page 
  if (!req.cookies.user_id) {
    // setTimeout(res.redirect("/login"), 3000)
    res.status(400).send("Error! You cannot view URLs unless you are logged in.")
  }
  const userUrls = urlsForUser(req.cookies.user_id)
  const templateVars = {                       //passed variables urldatabase and username
    urls: userUrls,                             //created by urlsForUser function
    users,
    user_id: req.cookies.user_id
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) =>{             //create a new entry
  // if (!req.cookies.user_id) {
  //   res.send("Error! You are not logged in.")
  //   setTimeout(res.redirect("/login"), 3000)
  // }
  let id = generateRandomString();
  //console.log(req.body, id);
  // urlDatabase[id] = req.body.longURL
  Object.assign(urlDatabase, {[id]: req.body.longURL})  //brackets mean the value in the variable
  res.redirect(`/urls/${id}`);
  //console.log(urlDatabase)  <--not all database keys are the same type??
})

app.get("/urls/new", (req, res) => {         //create new
  const templateVars = {  
    users,
    user_id: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {  
    users,
    user_id: req.cookies.user_id
  };
  res.render("login", templateVars);
})

app.post("/login", (req, res) => {
  // res.cookie('username', req.body.name)  //creates a cookie called username, with the value from the form
  // console.log(`username ${req.body.name}`)
  let email = req.body.email
  let password = req.body.password
  // if(req.cookies.user_id){              ??????why doesnt this work?
  //   res.send (`Error! You are already logged in as: ${users[user_id].email}`)
  // }
  if (!userLookUpByEmail(email)){
    res.status(400).send("Error! That email is not reigistered.")
  }
  if (userLookUpByEmail(email).password !== password){
    res.status(400).send("Error! Incorrect password.")
  }
  res.cookie('user_id', userLookUpByEmail(email).id)
  res.redirect("/urls")
})

app.post("/logout", (req, res) =>{
  res.clearCookie('user_id')  //clear cookie
  res.redirect("/login")
})

app.get("/register", (req, res) => {
  const templateVars = {  
    users,
    user_id: req.cookies.user_id,
  };
  res.render("registration", templateVars);
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password){   // if email or password are blank
    res.status(400).send ("Error 400 : Missing email/password")
  } 
  if(userLookUpByEmail(req.body.email)){      //if the entered email is already in the users object
    res.status(400).send ("Error! Email already registered")
  }
  if(!userLookUpByEmail(req.body.email)){
    id = generateRandomString();
    //console.log(req.body, id);
    users[id] = {                 //creates a new entry in the users object "database"
      id: id,
      email: req.body.email,
      password:  req.body.password
    }
    res.cookie('user_id', id)   //creates a cookie called user_id, with the value from the random function

    res.redirect("/urls")
  } 
  for (let userID in users) {   
    console.log(users[userID])
 //   if users[userID].email ===email)    //for later
  }
  
  
})


app.get("/urls/:id", (req, res) => {          //indv entry pages
  if (!req.cookies.user_id) {
    // setTimeout(res.redirect("/login"), 3000)
    res.status(400).send("Error! You cannot view URLs unless you are logged in.")
  }
  if(req.cookies.user_id !== urlDatabase[req.params.id].user){
    res.status(400).send("Error! You do not have permission to view this url page.")
  }
  const userUrls = urlsForUser(req.cookies.user_id)
  const templateVars = { 
    id: req.params.id, 
    urls: userUrls, 
    //longURL: urlDatabase[req.params.id],
    user_id: req.cookies.user_id,
    users
  }
  res.render("urls_show", templateVars)
});

app.post("/urls/:id", (req, res) => {
  //req.body is what is sent from the form, req.body.longURL is the new value
  console.log("req.body", req.body); 
  // what is the existing key? req.params.id
  console.log("req.params.id", req.params.id)
  // edit urlDatabase object to update the existing key with the new value
  urlDatabase[req.params.id] = req.body.longURL
  // redirect back to index page
  res.redirect(`/urls/${req.params.id}`)
})

app.post("/urls/:id/delete", (req, res) => {  //delete an entry
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
} )

app.get ("/u/:id", (req,res) =>{        //redirects the shortest url to the actual page
  const longURL = urlDatabase[req.params.id]     //brackets means the value in the param
  res.redirect(longURL)
})


// app.get("/set", (req, res) => {
//   const a = 1
//   res.send(`a = ${a}`);
// })

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// })

app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
})