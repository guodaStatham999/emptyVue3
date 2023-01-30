<template>
  <div>接口</div>
</template>

<script>

import { ref, reactive, toRefs, onMounted } from "vue";
import { getslink } from "@/api/mockProxy.js";
export default {
  components: {},
  setup() {
    let state = reactive({
      dataURL: "",
    });
    onMounted(() => {
      getslink('',{
        user:"你好",
        
      }).then(
        (res) => {
          console.log(res);
        },
        (reason) => {
          console.log(reason);
        }
      );
    });
    return {
      // ...toRefs(state),
      // downloadPic,
      // toImage,
      // handleConposeImg,
      // editboxRef,
    };
  },
};
</script>

<style  scoped>
.viewWrap {
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