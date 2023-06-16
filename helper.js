function getUserByEmail(email, users) {  
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return undefined;
}

function urlsForUser(id, urlDatabase) {
  //itterate through all urls
  //if url.user = param id
  // add that url object to an object
  const userUrls = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userUrls[url] = urlDatabase[url].longURL;  // {asdfg: www.google.com, asdf: www.youtube.com}
    }
  }
  return userUrls;
}

module.exports = { getUserByEmail, urlsForUser }