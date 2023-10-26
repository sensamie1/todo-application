const UserModel = require('../models/user-model');
const jwt = require('jsonwebtoken');
const logger = require('../logger');


const CreateUser = async (user) => {
  try {
    logger.info('[CreateUser] => Create process started.')
    const userFromRequest = user;

    const newUser = new UserModel();

    newUser.username = userFromRequest.username;
    newUser.email = userFromRequest.email;
    newUser.password = userFromRequest.password;

    const existingUser = await UserModel.findOne({
      email: userFromRequest.email,
      username: userFromRequest.username
    });

    if (existingUser) {
      return {
        message: 'User already exists.',
        code: 409
      }
    }

    const savedUser = await newUser.save();

    logger.info('[CreateUser] => Create process done.')
    return {
      code: 200,
      success: true,
      message: 'User created successfully',
      data: {
        user: savedUser
      }
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Server Error',
      code: 500,
      data: null
    }}
}   

const Login = async ({ username, password }) => {
  try {
    logger.info('[LoginUser] => Login process started')
    const userFromRequest = { username, password }

    const user = await UserModel.findOne({
      username: userFromRequest.username,
    });

    if (!user) { 
      return {
        message: 'User not found',
        code: 404
      }
    }

    const validPassword = await user.isValidPassword(userFromRequest.password)

    if (!validPassword) {
      return {
        message: 'Username or password incorrect',
        code: 422,
      }
    }
    
    const token = await jwt.sign({ 
      username: user.username, 
      _id: user._id,}, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' })
    logger.info('[LoginUser] => Login process done')
    return {
      message: 'Login successful',
      code: 200,
      data: {
        user,
        token
      }
    }
  } catch (error) {
    logger.error(error.message);
      return{
        message: 'Server Error',
        data: null
      }
  }
  
}

const isAuthenticatedForUpdate = (req, res, next) => {
  logger.info('[AuthenticationForUpdate] => Authentication for update process started...');
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send('Forbidden');
      } else {
        req.user = decoded;
      logger.info('[AuthenticationForUpdate] => Authentication for update process done.');
        next();
      }
    });
  } else {
    return res.status(401).send('Unauthorized');
  }
};

module.exports = {
  CreateUser,
  Login,
  isAuthenticatedForUpdate
}