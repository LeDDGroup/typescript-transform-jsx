const routes = {
  home: () => "/",
  user: {
    index: () => "/users",
    byId: (id: string) => `/users/${id}`
  }
};

export default routes;
