const express = require("express");
const app = express()
const PORT = 8080

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(){
  const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890"
  let result = ""
  for ( let i = 0; i <6; i++) {  //6 character long
    result += characters.charAt(Math.floor(Math.random() * 62)) //62 characters to pick from
  }
  return result
}

app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {          //indv entry pages
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
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

app.post("/urls", (req, res) =>{             //create a new entry
  let id = generateRandomString();
  //console.log(req.body, id);
  // urlDatabase[id] = req.body.longURL
  Object.assign(urlDatabase, {[id]: req.body.longURL})  //brackets mean the value in the variable
  res.redirect(`/urls/${id}`);
  //console.log(urlDatabase)  <--not all database keys are the same type??
})

app.get ("/u/:id", (req,res) =>{        //redirects the shortest url to the actual page
  const longURL = urlDatabase[req.params.id]     //brackets means the value in the param
  res.redirect(longURL)
})

app.post("/urls/:id/delete", (req, res) => {  //delete an entry
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
} )

app.post("/login", (req, res) =>{
  res.cookie('username', req.body.name)
  //console.log("can i print a cookie", cookie)
  console.log(`username ${req.body.name}`)
  res.redirect("/urls")
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