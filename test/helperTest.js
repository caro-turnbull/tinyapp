const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // console.log("user from function:", user.id)
    // console.log("expected: ", expectedUserID)
    assert.equal(user.id, expectedUserID)
  });
  it('should return undefined if the email isnt in the database', function(){
    const user = getUserByEmail("caroline@example.com", testUsers)
    console.log(user)
    const expectedUserID = undefined;
    // console.log("user from function:", user.id)
    // console.log("expected: ", expectedUserID)
    assert.isUndefined(user)
  })
});