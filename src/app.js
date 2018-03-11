const superagent = require("superagent")
const cheerio = require("cheerio")
const fs = require('fs')
const path = require('path')
const { transQuerys } = require('./util/util')

const url = "https://movie.douban.com/people/impressioncr/collect"
// 查询字符串对象
let query = {
  start: 1,
  sort: "",
  time: "",
  rating: "all",
  filter: "all",
  mode: "grid"
}

const spider = {
  url
}
// 加载单页，返回结果
spider.loadPage = function(url, page = 1) {
  query.start = (page - 1) * 15 ? (page - 1) : 1
  let pageUrl = transQuerys(url, query)
  console.log(pageUrl)
  return new Promise((resolve, reject) => {
    superagent.get(pageUrl).end(function(err, res) {
      if (err) {
        reject(err)
      }
      resolve(res.text)
    })
  })
}
// 加载页面
spider.getOnePage = function(page) {
  return new Promise(resolve => {
    spider.loadPage(url, page).then(res => {
      let $ = cheerio.load(res)
      let data = []
      $(".grid-view .item").each(function(i, elem) {
        let movieItem = {
          movieName: $(elem).find(".info .title em").text().split(' / ')[0],
          enName: $(elem).find(".pic a").attr('title'),
          pic: $(elem).find(".pic img").attr("src"),
        }
        data.push(movieItem)
      })
      resolve(data)
    })
  })
}
// 获取页数
spider.getTotalPage = function() {
  return new Promise(resolve => {
    let totalPage = 0
    spider.loadPage(url).then(res => {
      let $ = cheerio.load(res)
      totalPage = $(".thispage").attr("data-total-page")
      resolve(Number(totalPage))
    })
  })
}
// 爬虫需要休息
spider.sleep = function(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, time)
  })
}
// 爬虫需要工作了
spider.start = async function(page) {
  for (let i = 1; i < page; i++) {   
    let aPage = await spider.getOnePage(i)
    fs.writeFile(__dirname + '/test.json', JSON.stringify(aPage), {flag: 'a'}, function (err) {
      if(err) {
         console.error(err)
         } else {
          console.log('写入成功')
       }
     })
		console.log(aPage)
		// 查询一页之间的间隔时间
    await spider.sleep(1000)
  }
}
spider.getTotalPage().then(res => {
  spider.start(res)
})
