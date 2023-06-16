const getUserByEmail = function(email, users) {  
  console.log(email, users)
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return undefined;
};

const urlsForUser =  function(id, urlDatabase) {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userUrls[url] = urlDatabase[url].longURL;  
    }
  }
  return userUrls;
};

module.exports = { getUserByEmail, urlsForUser };