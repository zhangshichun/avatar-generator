<template>
  <div class="container">
    <div class="header">
      <div class="header-origin-avatar" :style="{ backgroundImage: `url(${avatarPath})` }"></div>
      <div class="header-text">
        <div>你好啊，<span class="header-user-name">{{ userName }}</span> </div>
        <div>我是【春哥】，一个卑微的前端。</div>
        <div>这是我的【掘金首页】，欢迎关注：<a href="https://juejin.cn/user/1714893870865303" target="__blank">点我点我！</a></div>
        <div>这是我的【公众号】,欢迎关注：</div>
        <div class="wechat"></div>
      </div>
    </div>
    <div class="main">
      <div class="main-content-line">
        <div>一、想以何种方式输入称号：</div>
        <el-radio-group v-model="nameType" @update:model-value="chosenTitle = null">
          <template v-for="key of nameTypes" :key="key">
            <el-radio :label="key"> {{ nameTypesCN[key] }} </el-radio>
          </template>
        </el-radio-group>
      </div>
      <div class="main-content-line" v-if="nameType == nameTypes.INNER">
        <div>二、请选择你想获得的称号：</div>
        <el-select v-model="chosenTitle">
          <template v-for="item in titleOptions" :key="item.id">
            <el-option :value="item.id" :label="item.name"></el-option>
          </template>
        </el-select>
      </div>
      <div class="main-content-line" v-if="nameType == nameTypes.CUSTOM">
        <div>二、请输入你想获得的称号：</div>
        <el-input v-model="chosenTitleCN" style="width: 200px;" placeholder="请输入3-4字的称号"></el-input>
      </div>
      <div class="main-content-line">
        三、<el-button type="primary" class="main-submit-btn" @click="generateMyTitle">生成我的称号</el-button>
      </div>
      <div class="main-content-line">
        <div>四、右键将生成的图片保存，并作为掘金头像使用</div>
      </div>
      <div class="main-content-line">
        <canvas ref="canvasRef" class="my-canvas" :style="{ border: '1px solid black' }" :width="canvasWidth" :height="canvasHeight"></canvas>
      </div>
    </div>
  </div>
</template>
<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus';

/**
 * 获取并解析用户基本信息
 */
const route = useRoute()
const uid = ref(null)
const avatarPath = ref(null)
const userName = ref(null)
uid.value = route.query.uid
const queryProfileInfo = async (uid) => {
  return request({
    url: `/user/${uid}`,
    method: 'get'
  })
}

const getAvatarPath = (str) => {
  const arr = str?.match(/<img src="(.*)" data-src="(.*)" alt="(.*)的个人资料头像" class="lazy avatar"/)
  return arr?.[1]
}

const getUserName = (str) => {
  const arr = str?.match(/>(.*) 的个人主页 - 动态 - 掘金</)
  return arr?.[1]
}

onMounted(async () => {
  if (!uid.value) {
    ElMessageBox.alert('请在路由里，通过 ?uid=xxx 的方式拼上你的掘金id')
  }
  const profileHtmlRes = await queryProfileInfo(uid.value)
  avatarPath.value = getAvatarPath(profileHtmlRes?.data)
  userName.value = getUserName(profileHtmlRes?.data)
})

/**
 * 选择称号
 */
import { titleOptions } from './constant'
const nameTypes = {
  INNER: 1,
  CUSTOM: 2
}
const nameTypesCN = {
  [nameTypes.INNER]: '使用内置称号',
  [nameTypes.CUSTOM]: '手动输入称号'
}
const nameType = ref(nameTypes.INNER)
// 下拉选择的称号id
const chosenTitle = ref(null)
// 手动输入的称号名称
const chosenTitleCN = ref(null)

/**
 * 生成称号
 */
// 画布宽度
const canvasWidth = 256
// 画布高度
const canvasHeight = 256
// 半径的占比（严格来说是直径）
const COEFFICIENT_OF_R = 0.7
// 头像半径
const RADIUS = COEFFICIENT_OF_R * Math.min(canvasHeight, canvasWidth) /2
// 头像距离顶部的距离
const COEFFICIENT_OF_TOP = 0.02
// 头像边框的宽度
const AVATAR_CYCLE_BORDER_WIDTH = 10
// 文本头部的Y坐标
const TEXT_Y = canvasHeight*(COEFFICIENT_OF_R) + AVATAR_CYCLE_BORDER_WIDTH
// 一些可能会伴随标题字数长度变化而变化的配置
const text_config_map = {
  3: {
    textPrefixSpaceCount: 3, // 文本居中，前面要前置的空格数量
    iconToCenterPx: 70 // icon距离中间的距离
  },
  4: {
    textPrefixSpaceCount: 3,
    iconToCenterPx: 80
  }
}

const canvasRef = ref(null)

const generateMyTitle = async () => {
  if (nameType.value == nameTypes.INNER &&  chosenTitle.value == null) {
    ElMessage.warning('不选称号，我生成个寂寞~~')
    return
  }
  if (nameType.value == nameTypes.CUSTOM && !nameTypesCN) {
    ElMessage.warning('老哥，称号不能为空')
    return
  }

  const option = nameType.value == nameTypes.INNER ? titleOptions.find(t => t.id == chosenTitle.value) : { name: chosenTitleCN.value, icon: titleOptions[0].icon }
  if (option.name.length > 4 || option.name.length < 3) {
    ElMessage.warning('不行啊老哥，我只兼容了 3-4 个字的称号')
    return
  }
  const img = await loadImage(avatarPath.value)
  const width = img.width
  const height = img.height
  await nextTick()
  const ctx = initCtx(canvasRef.value)
  fillBackground({ ctx })
  
  clipCycle({ ctx , width, height, img })
  drawAvatarCycle({ ctx })
  drawLine1({ ctx , width, height, ...option })
}

const loadImage = (path) => {
  return new Promise((resolve) => {
    let img = new window.Image();
    img.src = path;
    img.onload = () => {
      resolve(img)
    }
  })
}

const initCtx = (el) => {
  const ctx = el.getContext('2d')
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  return ctx;
}

const fillBackground = ( { ctx} ) => {
  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  ctx.restore()
}

/**
 * 剪切为圆形
 */
const clipCycle = ({ ctx, width, height, img }) => { 
  ctx.save() 
  let sInfo;// 剪切信息
  if (width >= height) {
    sInfo = [ (width - height)/2, 0, height, height ]
  } else {
    sInfo = [ 0, (width-height)/2, width, width ]
  }
  let pInfo = [canvasWidth*((1-COEFFICIENT_OF_R)/2), COEFFICIENT_OF_TOP*canvasHeight, 2*RADIUS, 2*RADIUS]
  ctx.beginPath();
  ctx.arc(canvasWidth/2, COEFFICIENT_OF_TOP*canvasHeight + RADIUS, RADIUS, 0, Math.PI*2 );
  ctx.fill();
  ctx.clip();
  ctx.drawImage(img, ...sInfo,  ...pInfo)
  ctx.restore()
}

const drawAvatarCycle = ({ ctx }) => {
  ctx.save() 
  ctx.beginPath();
  ctx.lineWidth = AVATAR_CYCLE_BORDER_WIDTH;
  ctx.strokeStyle = '#FFD700'
  ctx.arc(canvasWidth/2, COEFFICIENT_OF_TOP*canvasHeight + RADIUS, RADIUS, 0, Math.PI*2 );
  ctx.stroke();
  ctx.restore()
}

const drawLine1 = async ({ ctx, name, icon }) => {
  ctx.save()
  const iconImage = await loadImage(icon)
  const iconToCenterPx = text_config_map[name.length].iconToCenterPx
  ctx.drawImage(iconImage, 0, 0, iconImage.width, iconImage.height, canvasWidth/2 - iconToCenterPx, TEXT_Y, 36, 36)
  ctx.font = `bold 32px 宋体`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#7bb8f9'
  const textPrefixSpaceCount = text_config_map[name.length].textPrefixSpaceCount
  const prefixSpace = [...Array(textPrefixSpaceCount)].reduce((pre) => pre + ' ', '')
  ctx.fillText(prefixSpace + name, canvasWidth/2 ,TEXT_Y)
  ctx.restore()
}

</script>
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
  .main {
    &-content-line {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      margin: 10px 0;
    }
    &-submit-btn {
      margin-left: 10px;
    }
  }
  .my-canvas {
    border-radius: 50%;
  }
  .wechat {
    height: 100px;
    width: 300px;
    background-image: url('https://cdn.jsdelivr.net/gh/zhangshichun/blog-images/imgs/2022-wechat.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}
</style>
