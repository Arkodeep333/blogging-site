const authorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0

}
const validObject = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}
const validTitle = function (value) {
    return ["Mr", "Mrs", "Miss"].indexOf(value) !== -1
}

const createAuthor = async function (req, res) {
    try {
       let authorBody = req.body
       if(!isValidrequestBody(authorBody)){
           return res.status(400).send({status: false, message: "Provide a valid request body"})
       }
       const {fname, lname, title, email, password} = authorBody
       if(!isValid(fname)){
           return res.status(400).send({status: false, msg: "provide fname"})
       }
       if(!isValid(lname)){
        return res.status(400).send({status: false, msg: "provide lname"})
    }
    if(!isValid(title)){
        return res.status(400).send({status: false, msg: "provide title"})
    }
    if(!validTitle(title)){
        return res.status(400).send({status: false, msg: "provide a valid title"})
    }

    if(!isValid(email)){
        return res.status(400).send({status: false, msg: "provide email"})
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
        return res.status(400).send({ status: false, message: "Enter a valid email id" })
        
    }

    if(!isValid(password)){
        return res.status(400).send({status: false, msg: "provide password"})
    }
    let findEmail = await authorModel.findOne({email: email})
    if(findEmail){
        return res.status(400).send({status: false, msg: "email already exist"})
    }

    let createAuthor = await authorModel.create(authorBody)
    if(createAuthor){
        return res.status(201).send({status: true, msg: "Succesull", data: createAuthor})
    }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.createAuthor = createAuthor

const authorLogin = async function(req,res){
    try{
        const requestBody = req.body
        if (!isValidrequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }

        let email = req.body.email
        let password = req.body.password

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }
        //  email = email.trim();

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: 'password must be present' })
            return
        }

        if (email && password) {
            let User = await authorModel.findOne({ email: email, password: password })

            if (User) {
                const Token = jwt.sign({
                    userId: User._id,
                    iat: Math.floor(Date.now() / 1000), //issue date
                    exp: Math.floor(Date.now() / 1000) + 30 * 60
                }, "mykey") //exp date 30*60=30min
                res.header('x-api-key', Token)

                res.status(200).send({ status: true, msg: "success", data: Token })
            } else {
                res.status(400).send({ status: false, Msg: "Invalid Credentials" })
            }
        } else {
            res.status(400).send({ status: false, msg: "request body must contain  email as well as password" })
        }
    }

    catch(err){
        res.status(500).send({status: false, message: err.message})
    }
}
module.exports.authorLogin = authorLogin




