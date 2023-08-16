const express =require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const { remove } = require('../models/user');
const {storeReturnTo} = require('../middleware');


router.get('/register', users.renderRegister);

//register user, made a new user
router.post('/register', catchAsync(users.register));

//get user login form
router.get('/login', users.renderLogin);
//login route
//local strategy
router.post('/login', storeReturnTo, 
    passport.authenticate('local', { failureFlash: true, failureRedirect:'/login' }), 
    users.login)

router.get('/logout', users.logout); 

module.exports = router;
