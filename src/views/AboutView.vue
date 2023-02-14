<template>
  <Waterfall :list="list">
    <template #item="{ item, url, index }">
      <div class="card">
        <LazyImg :url="url" />
        <p class="text">这是内容</p>
      </div>
    </template>
  </Waterfall>
</template>

<script>
import { reactive, toRefs } from "vue-demi";
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";
import "vue-waterfall-plugin-next/style.css";

export default {
  components: {
    LazyImg,
    Waterfall,
  },
  setup() {
    let state = reactive({
      list: [{
			"id": null,
			"src": "http://source.wengegroup.com/mam2/607ed32de4b040afb6c0a357.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/bucketsprint/6156aca2e4b0726539a44076.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f42fe4b081abcb7436d4.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f400e4b081abcb7436b4.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f410e4b081abcb7436c0.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f407e4b081abcb7436ba.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/615adbb6e4b0726539a440ac.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/bucketsprint/61722519e4b0726539a4489c.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f413e4b081abcb7436c2.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f428e4b081abcb7436d0.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e2fbbfe4b0062dfb2928c9.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f433e4b081abcb7436d6.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f42ce4b081abcb7436d2.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f417e4b081abcb7436c6.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f414e4b081abcb7436c4.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f41ee4b081abcb7436ca.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f409e4b081abcb7436bc.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60efea70e4b081abcb7437c4.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/bucketsprint/61791d4ee4b0726539a44b0d.jpeg",
			"score": null,
			"content": null,
			"type": "img"
		}, {
			"id": null,
			"src": "http://source.wengegroup.com/mam2/60e6f400e4b081abcb7436b5.jpg",
			"score": null,
			"content": null,
			"type": "img"
		}],
    });
    return {
      ...toRefs(state)
    };
  },
};
</script>