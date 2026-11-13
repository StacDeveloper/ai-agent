import express from 'express'
import { controllerForagentConversation, controllerforApproval, getParticularConversation, regenerateController } from '../controllers/agentController.js';
import { requireAgent } from '../configs/auth.js';

const agentRoutes = express.Router()



agentRoutes.get('/conversations', controllerForagentConversation)
agentRoutes.get('/conversations/:id', getParticularConversation)
agentRoutes.post('/drafts/:id/approve',requireAgent ,controllerforApproval)
agentRoutes.post('/drafts/:id/regenerate', regenerateController)


export default agentRoutes