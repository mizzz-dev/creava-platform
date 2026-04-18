export default {
  routes: [
    {
      method: 'GET',
      path: '/discovery/search',
      handler: 'discovery.search',
      config: { auth: false },
    },
  ],
}
