const store = new Map();

function saveProxy(phone, proxy) {
  store.set(phone, proxy);
}

function getProxy(phone) {
  return store.get(phone);
}

function deleteProxy(phone) {
  store.delete(phone);
}

module.exports = {
  saveProxy,
  getProxy,
  deleteProxy,
};
