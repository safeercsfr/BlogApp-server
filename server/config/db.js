const mongoose = require('mongoose')
const url = process.env.MONGO_URL

exports.connectdb = async () => {

    try {
        await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewurlParser: true
        });
        console.log("database connected");
    } catch (err) {
        console.log(err);
        console.log("error while connecting");
    }

}