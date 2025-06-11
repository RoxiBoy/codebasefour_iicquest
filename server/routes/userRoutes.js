const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController'); // Adjust path as needed

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.post('/signup', UserController.signup)
router.get('/login', UserController.login)
router.get('/search', UserController.searchUsers);
router.get('/role/:role', UserController.getUsersByRole);
router.get('/id/:id', UserController.getUserById);
router.get('/email/:email', UserController.getUserByEmail);
router.put('/:id', UserController.updateUser);
router.patch('/:id/profile', UserController.updateUserProfile);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
