# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


# 

## 瀑布流实现
-- 仿https://www.pinterest.com/

目前实现了瀑布流的基本功能。

todo: 
    1、 能支持跨越多列的卡片组件
    2、 子组件在下拉的时候由于需要回调 有可能重叠 建议给一个基础宽度。（但是下方的文案大概率不会保留，应该还是在浮层里做查看操作，因此无所谓）
    3、 优化项： 不重排全部 而是只排版
    4、 蒙层： 左上角显示类型标签 目前暂定 角色设定、稿件、脑洞、表格、例图、故事线、世界观设定
    5、 折叠的气泡组件

库依赖： 
    

参考:
https://blog.mzh.ren/zh/posts/2022/11/pinterest-masonry-layout/
https://juejin.cn/post/7067436724309196836
https://www.zhihu.com/question/20304962
https://tobiasahlin.com/blog/masonry-with-css/


## 拖拽式布局


## 仿butterfly布局的用户主页
    TODO 
        1、 个人使用，应当即时响应，最好支持MarkDown 想要修改文章时，右侧可以看到生成的图文。
        2、 日期的为自动更新
        3、 需要时间轴类型的！！ 当然最好支持左右滚动和上下滚动
        4、 角色卡片 点击后内部排版应为左侧角色立绘，右侧分世界观、au和稿件、设定展示，左下方为评论区，其他则相同。



## TODO LIST 
    1、 可以联动专注
    2、 



## 专注
    仿forest
    1、离开页面暂停时长
    2、离开超过3分钟，自动结束。
    3、倒计时
    4、此段内容作为打工记录（可以种植一个角色（？））
    5、收获一点通用货币
    6、可以设置成年人模式：要用电脑的其他页面， 这是尊严的赌注。
    7、可以自行结束，会被炒鱿鱼，这个角色会禁用上工10分钟。
    8、备选： 做一个联动插件 用来挂在浏览器上提示时间
