const express = require('express');
const router = express.Router();
const ChallengeController = require('../controllers/challangeController'); // Adjust path as needed

router.post('/', ChallengeController.createChallenge);
router.get('/', ChallengeController.getAllChallenges);
router.get('/search', ChallengeController.searchChallenges);
router.get('/type/:type', ChallengeController.getChallengesByType);
router.get('/:id', ChallengeController.getChallengeById);
router.put('/:id', ChallengeController.updateChallenge);
router.delete('/:id', ChallengeController.deleteChallenge);

module.exports = router;
