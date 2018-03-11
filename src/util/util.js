const transQuerys = function(url, query) {
  return `${url}?${Object.keys(query)
    .map(k => `${k}=${query[k]}`)
    .join("&")}`
}

module.exports = { transQuerys }