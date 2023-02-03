<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">Aside</el-aside>
      <el-container>
        <el-header style="height: 50px">Header</el-header>
        <el-main class="mainClass">
          <!-- <div>1232</div> -->
          <Mark :baseOptions="baseOptions"></Mark>
        </el-main>
        <el-footer style="height: 50px">Footer</el-footer>
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
      state.baseOptions.url = 'https://tse1-mm.cn.bing.net/th/id/OIP-C.QPH1IBosDYBqaU3O6wV3YAHaEo?pid=ImgDet&rs=1'
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