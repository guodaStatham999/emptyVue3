<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px" style="border:1px solid red;">Aside</el-aside>
      <el-container>
        <el-header style="border:1px solid blue;height: 50px" >Header</el-header>
        <el-main class="mainClass">
          <!-- <div>1232</div> -->
          <Mark :baseOptions="baseOptions"></Mark>
        </el-main>
        <el-footer style="height: 50px;border:1px solid yellow;">Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Mark from "./mark.vue";
import { toRefs, reactive } from "vue";
export default {
  components: {
    Mark,
  },
  setup() {
    let state = reactive({
      baseOptions: {
        url:'',
      },
    });
    setTimeout(()=>{
      // 视频
      // state.baseOptions.url = 'https://tilake.wenge.com/wos/data-center-a3f5de5e3/5ed6f010c8ab7606274901c13d4a6ec0.mp4'
      // 图片
      state.baseOptions.url = 'https://tse1-mm.cn.bing.net/th/id/OIP-C.QPH1IBosDYBqaU3O6wV3YAHaEo?pid=ImgDet&rs=1' // 小图片
      // state.baseOptions.url = 'https://pic3.zhimg.com/v2-c6ae9c3aff36b9b221258f6a90577902_r.jpg' // 大图片
    },1000)
    return {
      ...toRefs(state),
    };
  },
};
</script>
<style>
.mainClass {
  height: 100%;
  height: calc(100vh - 78px - 100px);
}
</style>