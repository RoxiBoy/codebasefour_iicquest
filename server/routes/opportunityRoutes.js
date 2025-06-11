const express = require('express');
const router = express.Router();
const OpportunityController = require('../controllers/OpportunityController'); // Adjust path as needed

router.post('/', OpportunityController.createOpportunity);
router.get('/', OpportunityController.getAllOpportunities);
router.get('/search', OpportunityController.searchOpportunities);
router.get('/skills', OpportunityController.getOpportunitiesBySkills);
router.get('/role/:role_type', OpportunityController.getOpportunitiesByRoleType);
router.get('/user/:user_id/ranked', OpportunityController.getOpportunitiesRankedByCompatibility);
router.get('/:id', OpportunityController.getOpportunityById);
router.put('/:id', OpportunityController.updateOpportunity);
router.patch('/:id/compatibility', OpportunityController.updateCompatibilityScore);
router.get('/:id/compatibility/:user_id', OpportunityController.getCompatibilityScore);
router.delete('/:id', OpportunityController.deleteOpportunity);

module.exports = router;
