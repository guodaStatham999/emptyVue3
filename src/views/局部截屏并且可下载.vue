<template>
  <div class="viewWrap">
    <!-- <h3>我是canvas图片文字合成组件</h3> -->
    <div class="editbox" ref="editboxRef">
      <div class="imgbox">
        <img style="width:100%;height:100%;" src="https://ts1.cn.mm.bing.net/th/id/R-C.03517401f6c2f5333584847c9f092bcc?rik=ip2%2b7kdcUCj2rw&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f69%2f7569.jpg&ehk=zGsnHoKDszuMwriXhMoMQIfqUluAGVki66ap3fApxVs%3d&risl=&pid=ImgRaw&r=0" alt="">
      </div>
    </div>
    <div @click="handleConposeImg">
      合成 ---
    </div>
    <!-- <br></br> -->
    <div @click="downloadPic">
      下载
    </div>
    <img :src="dataURL" alt />

  </div>
</template>

<script>
import html2canvas from 'html2canvas'
export default {
  components: {},
  data() {
    return {
      dataURL: '' // 保持截屏操作后的base64数据地址
    }
  },
  computed: {},
  methods: {
    handleConposeImg() {
      this.toImage()
    },
    toImage() {
      return new Promise((resolve, reject) => {
        html2canvas(this.$refs.editboxRef, {
          useCORS: true, //开启跨域，这个是必须的
          allowTaint: true, // 图片允许跨域
          // scale: 0.5, // //处理模糊问题
          width: 500,//被截图区域画布的宽
          height: 400 //被截图区域画布的高
        }).then(canvas => {
          const dataURL = canvas.toDataURL('image/png')
          this.dataURL = dataURL
          console.log(this.dataURL)
          resolve(dataURL)
        })
      })
    },
    downloadPic(){
      const el = document.createElement('a');
      el.href = this.dataURL
      el.download = '文件名称';
      // 创建一个点击事件并对 a 标签进行触发
      const event = new MouseEvent('click');
      el.dispatchEvent(event);
    }
  },
  mounted() { }
}
</script>

<style  scoped>
.viewWrap{
  display: flex;
}
.editbox {
  height: 500px;
  width: 800px;
  border: 1px solid #555;
}
.imgbox {
  height: 400px;
  width: 500px;
  /* background-image: url(http://p1.pstatp.com/large/435d000085555bd8de10); */
  background-size: 100% 100%;
}
</style>