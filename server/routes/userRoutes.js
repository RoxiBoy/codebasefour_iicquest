const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController'); // Adjust path as needed

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/search', UserController.searchUsers);
router.get('/role/:role', UserController.getUsersByRole);
router.get('/id/:id', UserController.getUserById);
router.get('/email/:email', UserController.getUserByEmail);
router.put('/:id', UserController.updateUser);
router.put('/:id/profile', UserController.updateUserProfile);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
