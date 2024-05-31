const getAllUserBuys = async(req, res) => {
    try {
        const path = req.path.split('/')
        if (path.length < 3) {
            return false
        }
        console.log(path)
        const user = path[2]
        console.log(user)
        const purchases = [1,2,3,4,5]
        console.log("Purchases", purchases)
        res.status(200).json({
            user: user,
            purchases: purchases
        })
    } catch (error) {
        console.log(error)
    }
}

const controllers = { getAllUserBuys }

export default controllers
