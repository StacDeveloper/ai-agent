import express from 'express'
import { controllerForagentConversation, controllerforApproval, regenerateController } from '../controllers/agentController.js';

const agentRoutes = express.Router()



agentRoutes.get('/conversations', controllerForagentConversation)
agentRoutes.get('/conversations/:id', getParticularConversation)
agentRoutes.post('/drafts/:id/approve', controllerforApproval)
agentRoutes.post('/drafts/:id/regenerate', regenerateController)


export default agentRoutes