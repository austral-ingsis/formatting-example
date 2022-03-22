const { logger } = require('logging')

const morgan = require('morgan')
const bodyParser = require('body-parser')

const requestToCamelCase = require('../../core/middlewares/requestToCamelCase')
const { slotDiscoveryController, intervieweeSlotConfirmationController, interviewConfirmationController, interviewFeedbackController, intervieweeReminderController, hiringManagerReminderController, hiringManagerGroupReminderController, hiringManagerInterviewCancellationController, intervieweeInterviewCancellationController, intervieweeSoftRejectionController, interviewController, slotController, intervieweeFeedbackController, hiringManagerStepController, firstEngagementController, hiringManagerNPSController } = require('../controllers')
const configController = require('../controllers/configController')
const assignmentController = require('../controllers/assignmentController')
const requisitionController = require('../controllers/requisitionController')
const manualTasksController = require('../controllers/manualTasksController')
const intervieweeController = require('../controllers/intervieweeController')
const hiringManagerController = require('../controllers/hiringManagerController')
const listingCandidatesKeysController = require('../controllers/listingCandidatesKeysController')
const { initSentry } = require('../../core/utils/initSentry')

module.exports = (app) => {
  initSentry(app)

  // Log requests to the console.
  app.use(morgan('dev', {
    stream: {
      write: function (message, encoding) {
        logger.info(message)
      }
    }
  }))

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  /* Act as proxy to interview for config endpoints */
  app.get('/config', configController.getConfig)
  app.get('/step/config/:stepId', configController.getConfig)
  app.post('/step/config/:stepId', configController.updateConfig)

  // Format all the calls from snake_case to camelCase
  app.use(requestToCamelCase)

  app.use(function (req, res, next) {
    logger.info(`Request received with body: ${JSON.stringify(req.body)}`)
    next()
  })

  app.get('/health', (req, res) => {
    return res.status(200).send('api health is ok')
  })
  app.get('/', (req, res) => {
    return res.status(200).send('api is running')
  })

  /** Hiring Manager Interview slot availability **/
  app.get('/slot-discovery-conversations/:id/params', slotDiscoveryController.getParams)

  app.post('/interview-slot-availabilities', slotDiscoveryController.newAvailability)

  app.post('/slot-discovery-conversations/finish', slotDiscoveryController.finish)

  /** Interviwee slot Confirmation**/
  app.get('/slot-confirmation-conversations/:id/params', intervieweeSlotConfirmationController.getParams)

  app.post('/slot-confirmation-conversations/finish', intervieweeSlotConfirmationController.finish)

  app.post('/interviewee-slot-confirmations', intervieweeSlotConfirmationController.confirmation)

  app.post('/interviewee-slot-interests', intervieweeSlotConfirmationController.setInterest)

  /** Interview Confirmation **/
  app.get('/interview-confirmation-conversations/:id/params', interviewConfirmationController.getParams)

  app.post('/interview-confirmation-conversations/finish', interviewConfirmationController.finish)

  app.post('/interview-confirmation-responses/', interviewConfirmationController.newResponse)

  /** Interview feedback **/
  app.post('/interview-feedbacks', interviewFeedbackController.receiveFeedback)

  app.post('/interview-feedback-comments', interviewFeedbackController.receiveFeedbackComment)

  app.get('/interview-feedback-conversations/:id/params', interviewFeedbackController.getParams)

  app.post('/interview-feedback-conversations/finish', interviewFeedbackController.finish)

  /** Interviewee Reminder **/
  app.get('/interviewee-reminder-conversations/:id/params', intervieweeReminderController.getParams)

  app.post('/interviewee-reminder-responses', intervieweeReminderController.newResponse)

  app.post('/interviewee-reminder-conversations/finish', intervieweeReminderController.finish)

  /** HiringManager Reminder **/
  app.get('/hiring-manager-reminder-conversations/:id/params', hiringManagerReminderController.getParams)

  app.post('/hiring-manager-reminder-responses', hiringManagerReminderController.newResponse)

  app.post('/hiring-manager-reminder-conversations/finish', hiringManagerReminderController.finish)

  /** HiringManager Reminder **/
  app.get('/hiring-manager-group-reminder-conversations/:id/params', hiringManagerGroupReminderController.getParams)

  app.post('/hiring-manager-group-reminder-conversations/finish', hiringManagerGroupReminderController.finish)

  app.get('/hiring-manager-group-reminder-conversations/:id/file-link', hiringManagerGroupReminderController.getFileLink)

  /** Hiring Manager NPS Conversation **/
  app.get('/hiring-manager-nps-conversations/:id/params', hiringManagerNPSController.getParams)

  app.post('/hiring-manager-nps-conversations/finish', hiringManagerNPSController.finish)

  app.post('/hiring-manager-nps-responses', hiringManagerNPSController.newResponse)

  /** Hiring Manager Interview Cancellation Notification **/
  app.get('/hiring-manager-interview-cancellation-conversations/:id/params', hiringManagerInterviewCancellationController.getParams)

  /** Hiring Manager Interview Cancellation Notification **/
  app.get('/interviewee-interview-cancellation-conversations/:id/params', intervieweeInterviewCancellationController.getParams)

  /** Interviewee Soft Rejection Notification **/
  app.get('/interviewee-soft-rejection-conversations/:id/params', intervieweeSoftRejectionController.getParams)

  /** Interviewee Interview Feedback **/
  app.get('/interviewee-feedback-conversations/:id/params', intervieweeFeedbackController.getParams)

  app.post('/interviewee-feedback-responses', intervieweeFeedbackController.newResponse)

  app.post('/interviewee-feedback-conversations/finish', intervieweeFeedbackController.finish)

  /** First Engagement Conversations **/
  app.post('/interview-first-engagement-conversations/finish', firstEngagementController.finish)

  /** Hiring Manager Step **/
  app.get('/hiring-manager-step-conversations/:id/params', hiringManagerStepController.getParams)
  app.post('/hiring-manager-step-conversations/finish', hiringManagerStepController.finish)
  app.post('/hiring-manager-step-veredicts', hiringManagerStepController.newVeredict)
  app.post('/hiring-manager-step/manual-approve-candidate', hiringManagerStepController.manualApproveCandidate)

  /** Interviews **/
  app.get('/interviews', interviewController.search)
  app.get('/interview-candidates', interviewController.searchCandidates)
  app.get('/interviewee-logs', intervieweeController.getLogs)
  app.get('/ranked_requisitions', requisitionController.getSuggestedRequisitions)

  /** Hiring Managers **/
  app.get('/hiring-managers/next-interviews', hiringManagerController.getHiringManagerNextInterviews)
  app.get('/hiring-managers/vacancies', hiringManagerController.getHiringManagerVacancies)
  app.get('/hiring-managers/approved-interviewees', hiringManagerController.getApprovedInterviewees)
  app.get('/hiring-managers/assigned-candidates', hiringManagerController.getAssignedCandidates)

  /** Manual Tasks **/
  app.post('/assign-candidate-to-requisition', manualTasksController.assignCandidateToRequisition)
  app.post('/manual-approve-interviewee', manualTasksController.manualApproveInterviewee)
  app.post('/assign-location', manualTasksController.assignLocation)
  app.post('/manual-create-assignment', manualTasksController.manualCreateAssignment)
  app.post('/rescue-candidate', manualTasksController.rescueCandidate)
  app.post('/reject-candidate', manualTasksController.rejectCandidate)

  /** Slots endpoints to be compatible with interview **/

  app.post('/slots', slotController.createSlot)
  app.post('/assignments', slotController.assignToNewOrMatchingRequisition)
  app.post('/assignments/:assignmentId/reschedule', slotController.rescheduleSlotForCandidate)
  app.get('/slots', slotController.getSlots)
  app.get('/slots/:slotId', slotController.getSlot)
  app.delete('/slots', slotController.cancelSlot)
  app.post('/slots/close', slotController.closeSlot)
  app.delete('/assignments/:assignmentId', slotController.cancelAssignment)
  app.post('/assignments/:assignmentId/cancel', slotController.cancelAssignment)
  app.post('/slots/availability', slotController.getSlotAvailability)
  app.put('/invitations', slotController.createFeedback)
  app.get('/invitations', slotController.getInvitations)
  app.get('/integrations/google/:userId', slotController.getIntegrations)
  app.get('/integrations/google/:userId/url', slotController.calendarAuthUrl)
  app.post('/integrations/google/:userId/authorized', slotController.calendarAuthorized)

  /** Endpoints to create fake entities **/
  app.post('/slots/:slotId/invitation', slotController.createFakeInvitation)
  app.put('/invitations/:invitationId', slotController.confirmFakeInvitation)
  app.post('/invitations/reset', slotController.resetInvitations)
  app.put('/slots/:slotId', slotController.updateFakeSlot)
  app.delete('/fake-slots', slotController.nukeListing)

  /** For testing use only **/
  app.post('/create-assignments', assignmentController.createAssignments)

  /** For demo creation **/
  app.post('/requisitions/demo', requisitionController.createDemoRequisition)

  app.post('/requisitions/reset', requisitionController.resetRequisition)

  app.get('/pending-feedback-requisitions', interviewController.pendingFeedback)

  app.post('/demo-send-reminder', requisitionController.demoSendReminders)

  app.post('/demo-send-feedback', requisitionController.demoSendFeedback)

  /** Invoked when nuking candidates **/
  app.delete('/candidates', intervieweeController.deleteCandidate)

  app.get('/hiring-managers', hiringManagerController.getForSubsidiary)

  app.post('/hiring-managers', hiringManagerController.createHiringManager)

  app.put('/hiring-managers/:id', hiringManagerController.updateHiringManager)

  app.get('/listings/available-candidates', intervieweeController.getAvailableInterviewees)

  app.get('/assignments/latest', assignmentController.getLatestAssignment)

  app.get('/listing-candidates-keys', listingCandidatesKeysController.getListingCandidateKeys)

  //* * Requisitions **/

  app.post('/requisitions', requisitionController.updateOrCreateRequisition)
}
