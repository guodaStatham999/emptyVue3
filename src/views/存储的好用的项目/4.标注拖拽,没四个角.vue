
  <template>
  <div id="chartWrapId" class="chartWrap"></div>
</template>

<script>
// import { onMounted } from 'vue';
import { onMounted, reactive } from "vue";
import chart from "./1.js";
export default {
  setup() {
    let state = reactive({
      chartObj: null,
    });

    onMounted(() => {
      state.chartObj = new chart({
        el: document.getElementById("chartWrapId"),
      });
      setTimeout(() => {
        state.chartObj.push({
           type: 'circle', // ____________ 这里添加了一个类型 __________________
          fillStyle: "pink",
          x: 400,
          y: 300,
          r: 50,
        });
        // // ___________ 添加绘制线条 __________
        state.chartObj.push({
          type: "line",
          lineWidth: 4,
          data: [100, 90, 200, 90, 250, 200, 400, 200],
        });

        // ___________ 添加绘制矩形 __________
        state.chartObj.push({
          type: "rect",
          fillStyle: "#0f00ff",
          data: [350, 400, 100, 100],
        });
      }, 1000);
    });
    return {};
  },
};
</script>
<style>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
.chartWrap {
  height: calc(100vh - 120px);
  margin: 20px;
  box-shadow: 0 0 3px orange;
}
</style>