export default {
  routes: [
    { method: 'GET', path: '/internal/integrations/overview', handler: 'integration-console.overview', config: { auth: false } },
    { method: 'GET', path: '/internal/integrations/inbound-events', handler: 'integration-console.inboundEvents', config: { auth: false } },
    { method: 'GET', path: '/internal/integrations/outbound-deliveries', handler: 'integration-console.outboundDeliveries', config: { auth: false } },
    { method: 'GET', path: '/internal/integrations/dead-letters', handler: 'integration-console.deadLetters', config: { auth: false } },
    { method: 'GET', path: '/internal/integrations/replay-requests', handler: 'integration-console.replayRequests', config: { auth: false } },
    { method: 'POST', path: '/internal/integrations/replay', handler: 'integration-console.requestReplay', config: { auth: false } },
    { method: 'POST', path: '/internal/integrations/reconciliation/run', handler: 'integration-console.runReconciliation', config: { auth: false } },
  ],
}
