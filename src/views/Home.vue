<template>
  <div class="container">
    <div class="header">
      <div class="header-text">
        <div>你好啊 </div>
        <div>我是【春哥】，一个卑微的前端。</div>
        <div>这是我的【掘金首页】，欢迎关注：<a href="https://juejin.cn/user/1714893870865303/posts" target="__blank">点我点我！</a></div>
        <div>这是我的【公众号】,欢迎关注：</div>
        <img class="wechat" src="https://cdn.jsdelivr.net/gh/zhangshichun/blog-images/imgs/2022-wechat.png"/>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  width: 1000px;
  // background-color: #eeeeee;
  margin: auto;
  background-color: #e3e3e3;
  padding: 10px;
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    &-origin-avatar {
      width: 100px;
      height: 100px;
      background-size: cover;
      background-position: 50% 50%;
      border-radius: 50px;
    }
    &-user-name {
      font-size: 20px;
      font-weight: 600;
    }
    &-text {
      text-align: left;
      font-size: 18px;
      margin-left: 20px;
    }
  }
  .wechat {
    height: 100px;
  }
}
</style>
