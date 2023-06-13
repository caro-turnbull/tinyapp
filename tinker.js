function generateRandomString(length){
  const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890"
  let result = " "
  for ( let i = 0; i <length; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62))
  }
  return result
}
console.log(generateRandomString(6))