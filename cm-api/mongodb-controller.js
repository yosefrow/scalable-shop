import MongoDBClient from "./mongodb-client.js"

const insertPurchase = async(req, res) => {
    try {
        const mongoDBConfig = new MongoDBClient()
        const {customer} = req.body
        const {message} = req.body
        const document = {
            customer: customer,
            message: message
        }
        console.log(message)
        await mongoDBConfig.insert('purchases', document)

        res.status(200).json({
            status: "Ok!",
            message: "Message successfully sent to MongoDB!"
        })
    } catch (error) {
        console.log(error)
    }
}

const findPurchases = async(req, res) => {
    try {
        const mongoDBConfig = new MongoDBClient()
        const {customer} = req.body
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
