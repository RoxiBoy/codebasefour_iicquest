const express = require('express');
const router = express.Router();
const ChallengeAttemptController = require('../controllers/challengeAttemptController'); // Adjust path as needed

router.post('/', ChallengeAttemptController.createChallengeAttempt);
router.get('/', ChallengeAttemptController.getAllChallengeAttempts);
router.get('/search', ChallengeAttemptController.searchChallengeAttempts);
router.get('/user/:user_id', ChallengeAttemptController.getChallengeAttemptsByUser);
router.get('/challenge/:challenge_id', ChallengeAttemptController.getChallengeAttemptsByChallenge);
router.get('/:id', ChallengeAttemptController.getChallengeAttemptById);
router.put('/:id', ChallengeAttemptController.updateChallengeAttempt);
router.delete('/:id', ChallengeAttemptController.deleteChallengeAttempt);

module.exports = router;
