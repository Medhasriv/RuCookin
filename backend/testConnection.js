const mongoose = require('mongoose');
const uri = "mongodb+srv://admin001:mongoose$cooks@cluster0.u3c52.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected!'))
.catch(err => console.log('Connection Error:', err));
