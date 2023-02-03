<template></template>

<script>
export default {
  methods: {
    createDrag() {
      let color, widget;
      const that = this;
      this.Drag = D3.drag() // 创建D3内置函数
        .on("start", function (e) {
          // 开始拖拽那刻触发
          color = D3.select(this).attr("fill");
          widget = D3.select(this).attr("fill", "lime");
          const dot = [+e.sourceEvent.offsetX, +e.sourceEvent.offsetY]; // 实时记录点的坐标
          const id = widget._groups[0][0].parentNode.id; // 获取父元素的id
          if (widget._groups[0][0].localName === "rect") {
            // 当拖拽对象为矩形
            widget
              .attr("o-x", dot[0] - +widget.attr("x"))
              .attr("o-y", dot[1] - +widget.attr("y"));
            D3.select(`#${id}`)
              .selectAll("circle")
              .each(function () {
                const origin = [
                  dot[0] - +D3.select(this).attr("cx"),
                  dot[1] - +D3.select(this).attr("cy"),
                ];
                D3.select(this).attr("o-x", origin[0]).attr("o-y", origin[1]);
              });
          }
        })
        .on("drag", function (e) {
          // 拖拽过程中触发
          const dot = [+e.sourceEvent.offsetX, +e.sourceEvent.offsetY]; // 实时记录点的坐标
          if (widget._groups[0][0].localName === "rect") {
            // 拖拽对象为矩形
            const id = widget._groups[0][0].parentNode.id; // 获取父元素的id
            widget
              .attr("x", dot[0] - +widget.attr("o-x"))
              .attr("y", dot[1] - +widget.attr("o-y")); // 更新矩形的顶点信息
            D3.select(`#${id}`)
              .selectAll("circle")
              .each(function () {
                D3.select(this)
                  .attr("cx", dot[0] - +D3.select(this).attr("o-x"))
                  .attr("cy", dot[1] - +D3.select(this).attr("o-y"));
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
