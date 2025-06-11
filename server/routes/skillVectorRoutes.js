const express = require('express');
const router = express.Router();
const SkillVectorController = require('../controllers/skillVectorController'); // Adjust path as needed

router.post('/', SkillVectorController.createSkillVector);
router.get('/', SkillVectorController.getAllSkillVectors);
router.get('/:user_id', SkillVectorController.getSkillVectorByUserId);
router.put('/:user_id', SkillVectorController.updateSkillVector);
router.delete('/:user_id', SkillVectorController.deleteSkillVector);

module.exports = router;
