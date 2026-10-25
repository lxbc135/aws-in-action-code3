listAMIs = require('./lib/listAMIs');
listAMIs((error, data) => {
  console.log(error, data);
});
