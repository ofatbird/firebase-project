const superagent = require('superagent')
const cheerio = require('cheerio')

require('superagent-charset')(superagent)

// superagent
// 	.get('http://www.bd-film.com/rss.jspx')
// 	.end((err, res) => {
// 		if (err) return console.log(err)
// 		const $ = cheerio.load(res.text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>(?=\s*<)/gi, "$1"))
// 		console.log($('item description').text())
// 	})

// 第一步搜索RSS来获取单体地址

function getMovieUrl (looplimit, failed) {
  if (!looplimit) return failed(new Error(`Failed to load`))
  return new Promise((resolve, reject) => {
    superagent
      .get('http://www.bd-film.com/rss.jspx')
      .end((err, res) => {
        if (err && err.timeout) return getMovieUrl(--looplimit, reject)
        const $ = cheerio.load(res.text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>(?=\s*<)/gi, '$1'))
        const data = []
        $('item').each((index, item) => {
					const $item = $(item)
					const text = $item.find('title').text()
          const regtitle = /《([\s\S]*?)》/g.exec(text)
          const description = $item.find('description').text()
					const pubdate = $item.find('pubDate').text()
					const title = regtitle ? regtitle[0] : text
          data.push({
            title,
            pubdate,
          description})
				})
				resolve(data)
      })
  })
}

getMovieUrl(10)
	.then(data => console.log(data))
	.catch(err => console.log(err))
