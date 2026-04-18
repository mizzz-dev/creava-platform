export default {
  routes: [
    {
      method: 'GET',
      path: '/form-definitions/public',
      handler: 'form-definition.publicList',
      config: {
        auth: false,
      },
    },
  ],
}
