let express = require('express');
const path = require('path');
const resize= require('../utils/resize');
let router = express.Router();
const {isUser,isUserOrAdmin} = require('../utils/middlewares');
const userAuthController = require('../controllers/userAuthController');
const userController = require('../controllers/userController');
const debug = require('debug')('User Route:');


router.get('/checkNewVersion/:version', userController.checkNewVersion);
router.get('/getAuthCode/:phone',userAuthController.getAuthCode);
router.get('/auth/:phone/:token', userAuthController.auth);
router.get('/checkUniqueUsername/:username',userAuthController.checkUniqueUsername);
router.post('/signup', userAuthController.signup);

router.get('/',isUserOrAdmin,userController.getUsers);
router
    .route('/:id', isUser)
    .get(userController.getUser)
    .put(userController.updateUser);



router.get('/resizedImage',isUser,(req,res)=>{
    const image = req.query.imagePath;
    const widthString = req.query.width;
    const heightString = req.query.height;
    const format = req.query.format;

    // Parse to integer if possible
    let width, height;
    if (widthString) {
        width = parseInt(widthString)
    }
    if (heightString) {
        height = parseInt(heightString)
    }
    // Set the content-type of the response
    res.type(`image/${format || 'png'}`);

    // Get the resized image
    resize(path.join(__dirname,'../',image), format, width, height).pipe(res)
});


module.exports = router;
