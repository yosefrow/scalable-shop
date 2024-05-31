import http from 'http'
import { env } from 'process'

const getAllUserBuys = async(req, res) => {
    try {
        const path = req.path.split('/')
        if (path.length < 3) {
            return false
        }
        
        console.log(path)
        const username = path[2]
        console.log("username", username)

        const options = { 
            hostname: process.env.CM_API_HOSTNAME,
            port: process.env.CM_API_PORT,
            path: '/buyList/' + username, 
            method: 'GET' 
        }

        console.log(options)
           
        fetch('http://' + process.env.CM_API_HOST + '/buyList/' + username)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Data received:', data);
          const purchases = data
          console.log("Purchases", purchases)
          res.status(200).json({
              username: username,
              purchases: purchases
          })
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
        

    } catch (error) {
        console.log(error)
    }
}

const controllers = { getAllUserBuys }

export default controllers
