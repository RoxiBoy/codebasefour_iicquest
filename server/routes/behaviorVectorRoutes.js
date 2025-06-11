const express = require('express');
const router = express.Router();
const BehaviorVectorController = require('../controllers/behaviorVectorController'); // Adjust path as needed

router.post('/', BehaviorVectorController.createOrUpdateBehaviorVector);
router.get('/', BehaviorVectorController.getAllBehaviorVectors);
router.get('/analytics', BehaviorVectorController.getBehaviorAnalytics);
router.get('/user/:user_id', BehaviorVectorController.getBehaviorVectorByUserId);
router.get('/user/:user_id/similar', BehaviorVectorController.findSimilarBehaviorPatterns);
router.get('/compatibility/:user_id_1/:user_id_2', BehaviorVectorController.getCompatibilityScore);
router.delete('/user/:user_id', BehaviorVectorController.deleteBehaviorVector);

module.exports = router;
