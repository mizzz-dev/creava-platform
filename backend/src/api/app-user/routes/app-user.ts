export default {
  routes: [
    {
      method: 'POST',
      path: '/user-sync/provision',
      handler: 'app-user.provision',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/user-sync/me',
      handler: 'app-user.me',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/user-sync/support/lookup',
      handler: 'app-user.supportLookup',
      config: { auth: false },
    },
  ],
}
