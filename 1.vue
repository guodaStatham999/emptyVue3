<template></template>

<script>
export default {
  methods: {
    createDrag() {
      let color, widget;
      const that = this;
      this.Drag = D3.drag()
        .on("start", function (e) {
          // 开始拖拽那刻触发
          color = D3.select(this).attr("fill");
          widget = D3.select(this).attr("fill", "lime");
          const dot = [+e.sourceEvent.offsetX, +e.sourceEvent.offsetY]; // 实时记录点的坐标
          const id = widget._groups[0][0].parentNode.id; // 获取父元素的id
          if (widget._groups[0][0].localName === "circle") {
            // 当拖拽对象为圆形
            // 获取矩形的一些信息， x, y, width, height
            const cxy = [
              +D3.select(`#${id}-rect`).attr("x"),
              +D3.select(`#${id}-rect`).attr("y"),
              +D3.select(`#${id}-rect`).attr("width"),
              +D3.select(`#${id}-rect`).attr("height"),
            ];
            const dot = [
              +D3.select(this).attr("cx"),
              +D3.select(this).attr("cy"),
            ];
            // 判断拖拽点对角的那个顶点
            if (dot[0] > cxy[0]) {
              if (dot[1] > cxy[1]) {
                // 右下
                that.topDot = [cxy[0], cxy[1]];
              } else {
                // 右上
                that.topDot = [cxy[0], cxy[1] + cxy[3]];
              }
            } else {
              if (dot[1] > cxy[1]) {
                // 左下
                that.topDot = [dot[0] + cxy[2], cxy[1]];
              } else {
                // 左上
                that.topDot = [cxy[0] + cxy[2], cxy[1] + cxy[3]];
              }
            }
          }
        })
        .on("drag", function (e) {
          // 拖拽过程中触发
          const dot = [+e.sourceEvent.offsetX, +e.sourceEvent.offsetY]; // 实时记录点的坐标
          if (widget._groups[0][0].localName === "circle") {
            // 拖拽对象为矩形
            // 判断新的点相对于原顶点的位置信息，获取新的顶点坐标
            let top;
            if (dot[0] >= that.topDot[0]) {
              if (dot[1] >= that.topDot[1]) {
                // 右下
                top = that.topDot;
              } else {
                // 右上
                top = [that.topDot[0], dot[1]];
              }
            } else {
              if (dot[1] >= that.topDot[1]) {
                // 左下
                top = [dot[0], that.topDot[1]];
              } else {
                // 左上
                top = dot;
              }
            }
            const id = widget.attr("parent"); // 获取父元素的id
            // 更新矩形的信息
            D3.select(`#${id}-rect`)
              .attr("x", top[0])
              .attr("y", top[1])
              .attr("width", Math.abs(that.topDot[0] - dot[0]))
              .attr("height", Math.abs(dot[1] - that.topDot[1]));

            D3.select(`#${id}`).selectAll("circle").remove(); // 删除四个球
            const rect = D3.select(`#${id}-rect`);
            const circles = [
              // 获取四个圆点的坐标
              [+rect.attr("x"), +rect.attr("y")],
              [+rect.attr("x"), +rect.attr("y") + +rect.attr("height")],
              [+rect.attr("x") + +rect.attr("width"), +rect.attr("y")],
              [
                +rect.attr("x") + +rect.attr("width"),
                +rect.attr("y") + +rect.attr("height"),
              ],
            ];
            D3.select(`#${id}`)
              .selectAll("circle")
              .data(circles)
              .enter()
              .append("circle")
              .attr("cx", (d) => d[0])
              .attr("cy", (d) => d[1])
              .attr("r", 6)
              .attr("fill", "yellow")
              .attr("parent", id)
              .on("mouseenter", function () {
                that.Drag(D3.select(this));
              });
          }
        })
        .on("end", function (e) {
          widget.attr("fill", color);
          widget = null; // 被拖拽的元素设为空
        });
    },
  },
};
</script>
