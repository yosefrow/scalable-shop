import MongoDBClient from "./mongodb-client.js"

const insertPurchase = async(msg) => {
    try {
        const mongoDBConfig = new MongoDBClient()
        const {customer} = msg
        const {message} = msg
        const document = {
            customer: customer,
            message: message
        }
        console.log(message)
        await mongoDBConfig.insert('purchases', document)

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
        const customer = path[2]
        const query = {
            customer: customer
        }
        console.log(customer)
        const purchases = await mongoDBConfig.find('purchases', query)
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
