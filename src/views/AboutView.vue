<template>
  <div class="about">
     <vue-fabric ref="canvas" :width="width" :height="height"></vue-fabric>
  </div>
</template>

<script>
// import 'vue-fabric/dist/vue-fabric.min.css';
// import { Fabric } from 'vue-fabric';
export default {
  components:{
    // Fabric
  },
  data(){
    return {
      height:200,
      width:200
    }
  }
}
</script>