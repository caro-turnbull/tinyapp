const express = require("express");
//const cookieParser = require("cookie-parser")
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const { getUserByEmail, urlsForUser } = require("./helper.js");


///////////////////////
//Is this middleware?
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ["lighthouse", "labs", "caroline"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


/////////////////////
// Object "Databses"

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  "abc123": {
    longURL: "http://www.hotmail.com",
    userID: "user2RandomID"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10), //no point in hashing this??

  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),  //no point in hashin this??
  },
};


////////////////////
//Functions

function generateRandomString() {
  const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
  let result = "";
  for (let i = 0; i < 6; i++) {  //6 character long
    result += characters.charAt(Math.floor(Math.random() * 62)); //62 characters to pick from
  }
  return result;
}

// groupped checks for errors: not logged in, url does not exist, url doesnt belong to logged in user
const getErrorStatusCodeAndMessage = (urlDatabase, userID, shortID) => {
  if (!userID) {
    return { statusCode: 400, errorMessage: "Error! You cannot view URLs unless you are logged in." };
  }
  if (!urlDatabase[shortID]) {
    return { statusCode: 400, errorMessage: "Error! This url id does not exist." };
  }
  if (userID !== urlDatabase[shortID].userID) {
    return { statusCode: 400, errorMessage: "Error! You do not have permission to view this url page." };
  }
};


///////////////////////
//Routes


app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {                     //my url list page 
  if (!req.session.user_id) {
    return res.status(400).send("Error! You cannot view URLs unless you are logged in.");
  }
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {                       
    urls: userUrls,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {             
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {                 //create new page
  if (!req.session.user_id) {
    return res.status(400).send("Error! You cannot create URLs unless you are logged in.");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {                    //login page
  if(req.session.user_id){
    return res.status(400).send("Error! You are already signed in")
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const unhashed = req.body.password;   
  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(400).send("Error! That email is not reigistered.");
  }
  if (!bcrypt.compareSync(unhashed, user.password)) {
    return res.status(400).send("Error! Incorrect password.");
  }
  req.session.user_id = user.id;   
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //clear cookie
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {                   //register page
  // if someone is already logged in
  if(req.session.user_id){
    return res.status(400).send("Error! You are already signed in")
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  // if email or password are blank
  if (!req.body.email || !req.body.password) {   
    return res.status(400).send("Error 400 : Missing email/password");
  }
  const user = getUserByEmail(req.body.email, users);

  //if the entered email is already in the users object
  if (user) {      
    return res.status(400).send("Error! Email already registered");
  }
  //create random id
  const id = generateRandomString();
  //creates a new entry in the users object "database" using the random string
  users[id] = {         
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)  //with hashed password
  };
  //creates a cookie called user_id, with the value from the random function
  req.session.user_id = id;   
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {                  //indv entry pages
   //check for errors
  const error = getErrorStatusCodeAndMessage(urlDatabase, req.session.user_id, req.params.id);
  if (error) {
    const { statusCode, errorMessage } = error;
    return res.status(statusCode).send(errorMessage);
  }
  //send info to template
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  //check for errors
  const error = getErrorStatusCodeAndMessage(urlDatabase, req.session.user_id, req.params.id);
  if (error) {
    const { statusCode, errorMessage } = error;
    return res.status(statusCode).send(errorMessage);
  }
  //update database
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls/:id/delete", (req, res) => {          //delete an entry
  //check for errors
  const error = getErrorStatusCodeAndMessage(urlDatabase, req.session.user_id, req.params.id);
  if (error) {
    const { statusCode, errorMessage } = error;
    return res.status(statusCode).send(errorMessage);
  }
  //delete entry
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {                      //redirects the short url to the actual page
  const longURL = urlDatabase[req.params.id].longURL;     
  res.redirect(longURL);
});

//////////////////////
//Listen
app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});