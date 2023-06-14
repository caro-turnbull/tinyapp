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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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
  const templateVars = {                       //passed variables urldatabase and username
    urls: urlDatabase,  
    //userObj: users,
    user_id: res.cookie.user_id
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) =>{             //create a new entry
  let id = generateRandomString();
  //console.log(req.body, id);
  // urlDatabase[id] = req.body.longURL
  Object.assign(urlDatabase, {[id]: req.body.longURL})  //brackets mean the value in the variable
  res.redirect(`/urls/${id}`);
  //console.log(urlDatabase)  <--not all database keys are the same type??
})

app.get("/urls/new", (req, res) => {         //create new
  const templateVars = {  
    //userObj: users
    user_id: res.cookie.user_id
  };
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.name)  //creates a cookie called username, with the value from the form
  console.log(`username ${req.body.name}`)
  res.redirect("/urls")
})

app.post("/logout", (req, res) =>{
  res.clearCookie('username')  //clear cookie
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = {  
    user_id: res.cookie.user_id,
  };
  res.render("registration", templateVars);
})

app.post("/register", (req, res) => {
  let id = generateRandomString();
  //console.log(req.body, id);
  users[id] = {             //creates a new entry in the users object "database"
    id: id,
    email: req.body.email,
    password:  req.body.password
  }
  for (let userID in users) {   
    console.log(users[userID])
 //   if users[userID].email ===email)    //for later

  }
  res.cookie('user_id', id)   //creates a cookie called user_id, with the value from the random function
  //console.log(`user object: ${res.cookie.user_id}`)  //??Test that the users object is properly being appended to
  res.redirect("/urls")
  
})


app.get("/urls/:id", (req, res) => {          //indv entry pages
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user_id: res.cookie.user_id
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