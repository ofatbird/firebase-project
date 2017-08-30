const superagent = require('superagent')
const cheerio = require('cheerio')

require('superagent-charset')(superagent)
// 过滤出最近7天的信息, 返回true or false
function filterRecentSevendays(pubDate) {
  const time = new Date(pubDate.split(' ')[0]).getTime()
  return Date.now() - time < 7 * 24 * 36 * 1E5 ? true : false
}

// 第一步搜索RSS来获取单体地址
function getMovieUrl(looplimit, failed) {
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
          const pubdate = $item.find('pubDate').text()
          if (filterRecentSevendays(pubdate)) {
            data.push({
              pubdate,
              link: $item.find('guid').text(),
              title: regtitle ? regtitle[0] : text,
              description: $item.find('description').text(),
            })
          }
        })
        resolve(data)
      })
  })
}

getMovieUrl(10)
  .then(data => console.log(data))
  .catch(err => console.log(err))
