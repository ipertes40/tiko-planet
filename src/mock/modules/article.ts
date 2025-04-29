import Mock from 'mockjs'

// 持久化变量记录最后ID
let lastId = 0
let index = 0

const routes = [
  {
    url: '/article',
    method: 'get',
    response: () => {
      // 每次生成30个，ID从 lastId+1 开始
      const startId = lastId + 1
      const height2 =  Mock.mock('@integer(200, 600)')
      const width2 = Mock.mock('@integer(300, 800)')

      const newData = Mock.mock({
        'list|5': [
          {
            // 动态计算ID
            id: function() {
              return startId + index++
            },
            title: '@ctitle(8, 20)',
            content: '@cparagraph(3, 8)',
            image: function() {
              const width = width2
              const height = height2
              return `https://picsum.photos/${width}/${height}?random=${this.id}`
            },
            height: height2,
            width: width2
          }
        ]
      })
      
      // 更新最后ID（30是固定数量）
      lastId += 5
      index= 0
      
      return {
        code: 200,
        data: newData
      }
    }
  }
] as const

export default routes