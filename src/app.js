const superagent = require("superagent")
const cheerio = require("cheerio")

const url = "https://movie.douban.com/people/impressioncr/collect"

let query = {
	start: 1,
	sort: '',
	time: '',
	rating: 'all',
	filter: 'all',
	mode: 'grid'
}
const transQuerys = function (url, query) {
	return `${url}?${Object.keys(query).map(k => `${k}=${query[k]}`).join('&')}` 
}

const spider = {
  url
}

spider.loadPage = function(url, page = 1) {
	query.start = page
	let pageUrl = transQuerys(url, query)
	console.log(pageUrl)
	return new Promise((resolve, reject) => {
		superagent.get(pageUrl).end(function(err, res) {
			if (err) {
				reject(err)
			}
			console.log(res)
			resolve(res.text)
		})
	})
}
// 加载页面
spider.getOnePage = function(page) {
	return new Promise((resolve) => {
		spider.loadPage(url, page).then(res => {
			let $ = cheerio.load(res)
			$(".grid-view .item").each(function(i, elem) {
				console.log(
					$(elem)
						.find(".pic img")
						.attr("src")
				)
			})
			resolve('done' + page)
		})
	})
}
// 获取页数
spider.getTotalPage = function() {
	return new Promise(resolve => {
		let totalPage = 0
		spider.loadPage(url).then(res => {
			let $ = cheerio.load(res)
			totalPage = $('.thispage').attr('data-total-page')
			resolve(Number(totalPage))
		})
	})
}

spider.getTotalPage().then(res => {
	console.log(res)
	spider.getOnePage(1).then(res => {
		console.log(res)
		spider.getOnePage(15)
	})
})
