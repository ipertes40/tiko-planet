// 获取文章
const fetchArticles = async (page: number, pageSize: number) => {
    try {
      const response = await request.get(
        `/articles?page=${page}&pageSize=${pageSize}`
      );
      console.log(response)
      const { data } = response;
      return { data: data.data.list };
    } catch (error) {
      console.error('请求失败:', error);
      return { data: [] };
    }
  };

// 获取当前用户文章


// 获取当前角色文章


// 获取当前世界观文章


// 推荐算法文章（不做，先放着）


export{
    fetchArticles
}
