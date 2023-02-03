
  <template>
  <div id="chartWrapId" class="chartWrap">
    <video v-show="baseOptions.type === 'video'" ref="videoRef" id="videoId"  height="420" controls></video>
  </div>
  <button @click="create">创建</button>
  <button @click="move">移动</button>
</template>

<script>
import * as D3 from "d3";
// 先测试是否可以直接迁移到某个位置, 直接在b端处理.
// 点击移动以后,再次点击创建. 没法再已标注上面继续标注了.
// 而且移动后,应该删除两个点 或者让他俩隐藏..
export default {
  props: ["baseOptions"],
  data() {
    return {
      width: '',
      height: '',
      url: this.baseOptions.url,
      dataType: this.baseOptions.type,
      isDrag: false,
      rectData: [],
      start: false,
      startDom: "",
      Drag: null,
    };
  },

  watch: {
    'baseOptions.url': {
      handler(newVal, oldVal) {
        console.log(this.baseOptions.type)
        console.log(newVal)
        //todo
        if(this.baseOptions.type === 'image'){
            this.dataType = 'image'
            let img = new Image();
            img.onload = ()=>{
                console.log(img)
                console.log(img.width)
                console.log(img.height)
                this.width = img.width + ''
                this.height = img.height +''
                this.url = newVal
                this.init()
            }
            img.src = newVal

        }else if(this.baseOptions.type === 'video'){
            console.log(this.$refs.videoRef)
            console.log(videoId)
            videoId.addEventListener('loadeddata',  (a,b,c)=>{

                  //视频的总长度    console.log(video.duration);  
                  console.log(a,b,c)
                  console.log(videoId)
                // console.log(this.$refs.videoRef.width)
                // console.log(this.$refs.videoRef.height)
                // console.log(this.$refs.videoRef.duration)
                // console.log(this.$refs.videoRef.readyState)
            })
            this.$refs.videoRef.src = newVal
        }
      },
      deep: true, // 可以深度检测到 person 对象的属性值的变化
    },
  },
  mounted() {
    // console.log(111)
    //   this.init();
  },
  methods: {
    create() {
      this.isDrag = false;
    },
    move() {
      this.isDrag = true;
      //  this.Drag(that)
    },
    init() {
      // 创建svg画布、定义宽（700）高（700）
      //   这个地方给svg增加一个 z-index:100, position:relative; 这样就可以这招在任何视频上了
        console.log(this.width)
        console.log(typeof this.width)
      const svg = D3.select("#chartWrapId")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("z-index", 100)
        .style("position", "relative");

      this.createDrag();

      // 插入图片 / 视频
      if (this.dataType === "image") {
        console.log(this.height)
        console.log(this.width)
        console.log(this.url)
        svg
          .append("image")
          .attr("class", "control-img")
          .attr("height", this.height)
          .attr("width", this.width)
          .attr("href", this.url);
      } else if (this.dataType === "video") {
        // D3.select("#chartWrapId")
        //   .append("video")
        //   // .append("image")
        //   // .attr("class", "control-img")
        //   .attr("position", "absolute")
        //   .attr("height", this.height)
        //   .attr("width", this.width)
        //   .attr("controls", true)
        //   .attr("src", this.url);
        // .attr(
        //   "href",
        //   "https://tse1-mm.cn.bing.net/th/id/OIP-C.QPH1IBosDYBqaU3O6wV3YAHaEo?pid=ImgDet&rs=1"
        // );
      }

      svg.on("mousemove", this.mouseMove); // 鼠标在svg上移动触发
      svg.on("mouseleave", this.mouseLeave); // 鼠标离开svg触发
      svg.on("mousedown", this.mouseDown); // 鼠标按下触发
      svg.on("mouseup", this.mouseUp); // 鼠标抬起时触发

      // 创建十字坐标
      const positionXY = svg.append("g").attr("class", "line-g");
      svg.append("g").attr("id", "rect-g"); //用于存放矩形的容器
      positionXY
        .append("line")
        .attr("id", "line-x")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 700)
        .attr("y2", 0)
        .attr("stroke", "white")
        .attr("stroke-width", 0);
      positionXY
        .append("line")
        .attr("id", "line-y")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 700)
        .attr("stroke", "white")
        .attr("stroke-width", 0);
      positionXY
        .append("circle")
        .attr("id", "line-circle")
        .attr("cx", -10)
        .attr("cy", -10)
        .attr("r", 5)
        .attr("fill", "red");
    },
    mouseDown(e) {
      const that = this;
      if (!this.isDrag) {
        // 不是在拖拽模式
        let id = new Date().getTime() + ""; // 获取一个不重复的id,给矩形分配一个id
        let xy = [+e.offsetX, +e.offsetY]; // 获取鼠标按下的坐标
        D3.select("#rect-g")
          .append("g")
          .attr("id", `rect-g-${id}`)
          .append("rect")
          .attr("id", `rect-g-${id}-rect`)
          .attr("x", xy[0])
          .attr("y", xy[1])
          .attr("stroke", "yellow")
          .attr("fill", "yellow")
          .attr("fill-opacity", 0.1)
          .on("mouseenter", function () {
            if (that.isDrag) {
              D3.select(this).attr("cursor", "pointer"); // 改变鼠标指针样式
              const xy = [
                +D3.select(this).attr("x"),
                +D3.select(this).attr("y"),
              ]; // 顶点坐标
              const wh = [
                +D3.select(this).attr("width"),
                +D3.select(this).attr("height"),
              ]; // 矩形宽高
              const dots = [
                xy,
                [xy[0] + wh[0], xy[1]],
                [xy[0] + wh[0], xy[1] + wh[1]],
                [xy[0], xy[1] + wh[1]],
              ]; // 得到四个圆点
              const id = D3.select(this)._groups[0][0].parentNode.id; // 矩形父容器的id
              D3.select(`#${id}`)
                .selectAll("circle")
                .data(dots)
                .enter()
                .append("circle")
                .attr("cx", (d) => d[0])
                .attr("cy", (d) => d[1])
                .attr("r", 6)
                .attr("fill", "rgb(102, 181, 245)")
                .attr("parent", id)
                .on("mouseenter", function () {
                  that.Drag(D3.select(this)); // 将圆添加到拖拽方法中
                });
              that.Drag(D3.select(this)); // 将矩形添加到拖拽方法中
            }
          });

        this.rectData = xy; // 记录下鼠标按下的坐标
        this.start = true; // 添加矩形开始了（为了在moseover监控另一个点）
        this.startDom = `rect-g-${id}-rect`; // 记录当前添加矩形的id(有了id可以快速定位矩形）
      } else {
      }
    },

    mouseMove(e) {
      let that = this;
      if (!this.isDrag) {
        //判断不是在拖拽状态下
        const xy = [+e.offsetX, +e.offsetY]; // 获取移动的鼠标的坐标点
        // 先处理十字坐标，圆点和两条线
        D3.select("#line-x")
          .attr("x1", 0)
          .attr("y1", xy[1])
          .attr("x2", 700)
          .attr("y2", xy[1])
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        D3.select("#line-y")
          .attr("x1", xy[0])
          .attr("y1", 0)
          .attr("x2", xy[0])
          .attr("y2", 700)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        D3.select("#line-circle")
          .attr("cx", xy[0])
          .attr("r", 6)
          .attr("cy", xy[1])
          .attr("fill", "red");
        if (this.start) {
          // 正在添加矩形（mousedown把start设为true）
          let top; // 判断当前矩形的顶点坐标（矩形是由顶点，宽高定义的）
          if (xy[0] >= this.rectData[0]) {
            if (xy[1] >= this.rectData[1]) {
              // 右下
              top = this.rectData;
            } else {
              // 右上
              top = [this.rectData[0], xy[1]];
            }
          } else {
            if (xy[1] >= this.rectData[1]) {
              // 左下
              top = [xy[0], this.rectData[1]];
            } else {
              // 左上
              top = xy;
            }
          }
          // 动态修改矩形的属性值startDom是在mousedown中记录的矩形的id
          D3.select(`#${this.startDom}`)
            .attr("x", top[0])
            .attr("y", top[1])
            .attr("width", Math.abs(this.rectData[0] - xy[0]))
            .attr("height", Math.abs(xy[1] - this.rectData[1]));
          // .on('mouseenter',function (){
          //   console.log(234234)
          // })
        } else {
        }
      } else {
        // console.log(e)
        // console.log(this.Drag)
        // this.Drag()
      }
    },
    mouseUp(e) {
      if (!this.isDrag) {
        // 判断不是在拖拽状态
        this.start = false; // 添加矩形动作取消
        this.startDom = ""; //
        this.rectData = []; // 参考mousedown
      }
    },
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
          // 当拖拽对象为圆形
          if (widget._groups[0][0].localName === "circle") {
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
<style>
/* html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
} */
.chartWrap {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>