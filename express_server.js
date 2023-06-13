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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) =>{
  let id = generateRandomString();
  console.log(req.body, id);
  Object.assign(urlDatabase, {[id]: req.body.longURL})
  //or this ->  urlDatabase[id] = longURL 
  res.redirect(`/urls/${id}`);
  console.log(urlDatabase)
})

app.get ("/u/:id", (req,res) =>{        //view an indv entry in the database
  const longURL = urlDatabase[req.params.id]
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