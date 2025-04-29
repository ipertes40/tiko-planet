import Mock from 'mockjs'

// 持久化变量记录最后ID
let lastId = 0
let index = 0

const routes = [
  {
    url: '/articles',
    method: 'get',
    response: () => {
      const startId = lastId + 1
      console.log('mock')

      const newData = Mock.mock({
        'list|20': [
          {
            id: function () {
              return startId + index++
            },
            title: '@ctitle(8, 20)',
            content: '@cparagraph(3, 8)',
            width: function () {
              return Mock.mock('@integer(300, 800)')
            },
            height: function () {
              return Mock.mock('@integer(600, 900)')
            },
            image: function () {
              return `https://picsum.photos/${this.width}/${this.height}?random=${this.id}`
            }
          }
        ]
      })

      lastId += 20
      index = 0
      console.log('mock===>', {
        code: 200,
        data: newData.list
      })
      return {
        code: 200,
        data: {list : newData.list}
      }
    }
  }
] as const

export default routes