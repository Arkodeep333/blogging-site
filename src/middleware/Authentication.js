const jwt = require("jsonwebtoken")


const autherAuth = async (req, res, next) => {
    try {
        let token = req.headers['x-api-key']
        if (!token) {
            res.status(401).send({ status: false, Message: 'Mandatory authentication token is missing.' })
        } else {
            let decodedtoken = jwt.verify(token,"mykey")
            if (decodedtoken) {
                req.userId= decodedtoken.userId
                console.log(decodedtoken.userId)
                next()
            }
        }
    }
     catch (error) {
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports.autherAuth = autherAuth

