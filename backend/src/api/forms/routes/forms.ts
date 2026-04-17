export default {
  routes: [
    {
      method: 'POST',
      path: '/forms/upload',
      handler: 'forms.upload',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/forms/confirm',
      handler: 'forms.confirm',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/forms/submit',
      handler: 'forms.submit',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/forms/submissions',
      handler: 'forms.list',
    },
    {
      method: 'GET',
      path: '/forms/submissions/:id',
      handler: 'forms.detail',
    },
    {
      method: 'PATCH',
      path: '/forms/submissions/:id',
      handler: 'forms.patch',
    },
  ],
}
