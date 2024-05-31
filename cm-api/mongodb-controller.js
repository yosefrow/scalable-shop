import MongoDBClient from "./mongodb-client.js"

const insertPurchase = async(msg) => {
    try {
        const mongoDBConfig = new MongoDBClient()
        const {username} = msg
        const {userid} = msg
        const {price} = msg
        const {timestamp} = msg

        const purchase = {
            username: username,
            userid: userid,
            price: price,
            timestamp: timestamp
        }

        console.log(purchase)
        await mongoDBConfig.insert(purchase)

        console.log({
            status: "Ok!",
            message: "Message successfully sent to MongoDB!"
        })
    } catch (error) {
        console.log(error)
    }
}

const findPurchases = async(req, res) => {
    try {
        const path = req.path.split('/')
        if (path.length < 3) {
            return false
        }
        console.log(path)
        const mongoDBConfig = new MongoDBClient()
        const username = path[2]
        const query = {
            username: username
        }
        console.log(username)
        const purchases = await mongoDBConfig.find(query)
        console.log("Purchases", purchases)
        res.status(200).json({
            status: "Ok!",
            purchases: purchases
        })
    } catch (error) {
        console.log(error)
    }
}

const controllers = { insertPurchase, findPurchases }

export default controllers

