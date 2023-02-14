
  <template>
  <div
    ref="chartWrapRef"
    id="chartWrapId"
    class="chartWrap"
    :dimension="dimension"
  >
    <svg id="svgId" :width="dimension.svg.width" :height="dimension.svg.height">
      <image
        :width="dimension.svg.width"
        :height="dimension.svg.height"
        :href="url"
        class="control-img"
      />
    </svg>
  </div>
  <!-- <button @click="create">创建</button>
  <button @click="move">移动</button> -->
</template>


<script>
// https://gitee.com/fuwenwei501/ailabel-me#http://fuwenwei501.gitee.io/ailabel-me
// 感觉写的不错
import * as D3 from "d3";

export default {
  props: ["baseOptions"],
  data() {
    return {
      // 图片宽高,是否加载完成,地址
      loaded: false,
      width: 0,
      height: 0,
      url: this.baseOptions.url,
      bounding: null,
      isDrag: false,
      rectData: [],
      start: false,
      startDom: "",
      Drag: null,

      list: [
        {
          endX: 50,
          endY: 50,
          height: 50,
          name: "rect-g-1675329600098",
          preId: "1675329600098",
          startX: 0,
          startY: 0,
          width: 50,
        },
        {
          endX: 334,
          endY: 156,
          height: 54,
          name: "rect-g-1675329600099",
          preId: "1675329600099",
          startX: 138,
          startY: 102,
          width: 196,
        },
      ],
    };
  },
  // 等比例缩放
  // 根据图片大小重新计算 svg 位置信息
  computed: {
    dimension() {
      const defaultDimension = {
        svg: {},
        img: {},
        wrapper: {},
        margin: {},
        scale: 1,
      };
      // 这里需要继续计算边框距离和图片大小后计算一个缩放值;
      // 当 dom 元素加载完毕来计算 svg 尺寸
      if (
        !this.isNil(this.bounding) &&
        !!this.loaded &&
        this.$refs.chartWrapRef
      ) {
        let imgInfo = {
          width: this.width,
          height: this.height,
        };
        // 容器的最大宽度、高度
        const { width: cw, height: ch, left, top } = this.bounding;
        // 图片的宽度，高度
        const iw = imgInfo.width;
        const ih = imgInfo.height;

        const wrapperDimension = {
          // 容器宽高,距离左边的值
          width: cw,
          height: ch,
          left,
          top,
        };

        // 当图片尺寸超过容器尺寸，进行缩放
        const imgScale = Math.min(
          wrapperDimension.width / imgInfo.width,
          wrapperDimension.height / imgInfo.height,
          1
        );

        // 如果图片有缩放，直接取容器尺寸即可
        const svgDimension = {
          width: imgScale < 1 ? cw : Math.min(iw, cw),
          height: imgScale < 1 ? ch : Math.min(ih, ch),
        };

        // 标注相关元素的容器
        const annotationGroupStyle = {
          // 所有壳子偏移一半,这样就是对称的.
          left: imgScale === 1 ? `${(cw - iw) / 2}px` : 0,
          top: imgScale === 1 ? `${(ch - ih) / 2}px` : 0,
          // width:`${iw}px`,
          // height:`${ih}px`,

          // 这个是个之前的标注逻辑,发现线上代码总是偏移.整体巡查后,发现此处使用的屏幕宽高,
          //     临时改成图片的宽高. 这样就和图片的位置相同了(先试试)
          width: imgScale === 1 ? `${iw}px` : `${cw}px`,
          height: imgScale === 1 ? `${ih}px` : `${ch}px`,
        };

        // 上面已经通过margin: 0 auto 做过宽度处理
        const ml = Math.max(wrapperDimension.width - iw * imgScale, 0) / 2; // margin-left
        const mt = Math.max(wrapperDimension.height - ih * imgScale, 0) / 2; // margin-top

        const marginStyle = {};
        if (ml > 0) {
          marginStyle["padding-left"] = `${ml}px`;
          marginStyle["padding-right"] = `${ml}px`;
        }
        if (mt > 0) {
          marginStyle["padding-top"] = `${mt}px`;
          marginStyle["padding-bottom"] = `${mt}px`;
        }
        const margin = {
          left: ml, // margin-left 的结果, 是计算除以2以后的
          top: mt, // margin-top 的结果, 是计算除以2 以后的
        };

        const imgDimension = {
          // 图片的宽高,是加载以后的
          width: iw,
          height: ih,
        };

        const imgScaleStyle =
          imgScale < 1
            ? {
                width: `${imgInfo.width * imgScale}px`,
                height: `${imgInfo.height * imgScale}px`,
                transition: "opacity 0.4s",
                opacity: 1,
              }
            : {};
        // 居中
        let res = {
          svg: svgDimension, // 单纯svg的尺寸 11
          marginStyle, // 偏移结果,带单位的. 11
          scale: imgScale, // 缩放比例 1111
          imgScaleStyle, // 图片缩放后的宽高 11
          annotationGroupStyle, // svg外层的壳子,偏移数量.11

          img: imgDimension, // 图片信息的尺寸 22
          wrapper: wrapperDimension, // 暂时没找到用户
          margin, // 就是偏移结果,只不过是不带单位的
        };
        return res;
      }
      return defaultDimension;
    },
  },

  watch: {
    "baseOptions.url": {
      handler(newVal, oldVal) {
        let img = new Image();
        img.onload = () => {
          this.loaded = true;
          this.width = img.width + "";
          this.height = img.height + "";
          this.url = newVal;
          this.init();
        };
        img.src = newVal;
      },
      deep: true, // 可以深度检测到 person 对象的属性值的变化
    },
    list: {
      handler(newVal, oldVal) {
        this.init();
      },
      deep: true,
    },
  },
  mounted() {
    this.bounding = this.getBounding(document.getElementById("chartWrapId"));
  },
  methods: {
    init() {
      D3.select("#rect-g").remove();
      // return
      const svg = D3.select("#svgId");

      svg.on("mouseleave", this.mouseLeaveInit); // 鼠标离开svg触发
      svg.on("mouseenter", () => {
        this.createCrossPoint(svg);
      }); // 鼠标离开svg触发
      svg.on("mousemove", this.mouseMove); // 鼠标在svg上移动触发
      svg.on("mousedown", this.mouseDown); // 鼠标按下触发
      svg.on("mouseup", this.mouseUp); // 鼠标抬起时触发

      this.createContainer(svg);

      this.list.forEach((item) => this.mountedList(item));
      this.createDrag();
    },
    createContainer(svg) {
      svg.append("g").attr("id", "rect-g"); //用于存放矩形的容器
    },
    // 创建十字坐标, 改成鼠标划入
    createCrossPoint(svg, del) {
      svg.attr("cursor", "crosshair");
      /*        const positionXY = svg.append("g").attr("class", "line-g").attr('id','line-g');

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
        .attr("fill", "red"); */
    },
    // 把删除逻辑拆出来,梳理下每次添加/修改位置的时候,如何增加 偏移值
    mountedList(item) {
      let that = this;
      D3.select("#rect-g")
        .append("g")
        .attr("id", `rect-g-${item.preId}`)
        .append("rect")
        .attr("id", `rect-g-${item.preId}-rect`)
        .attr(
          "x",
          this.dimension.scale == 1
            ? item.startX
            : item.startX + this.dimension.margin.left
        )
        .attr(
          "y",
          this.dimension.scale == 1
            ? item.startY
            : item.startY + this.dimension.margin.top
        )
        .attr("width", Math.abs(item.width))
        .attr("height", Math.abs(item.height))
        .attr("stroke", "yellow")
        .attr("fill", "yellow") // 矩形黄色
        .attr("fill-opacity", 0.1)
        .attr("cursor", "move")
        .on("mouseenter", function (e) {
          let picRelationLeft = e.offsetX;
          let picRelationTop = e.offsetY;
          let isIn = that.isInMarkList(picRelationLeft, picRelationTop);
          that.isDrag = isIn;

          if (that.isDrag) {
            D3.select(this).attr("cursor", "pointer"); // 改变鼠标指针样式
            const xy = [+D3.select(this).attr("x"), +D3.select(this).attr("y")]; // 顶点坐标
            const wh = [
              +D3.select(this).attr("width"),
              +D3.select(this).attr("height"),
            ]; // 矩形宽高
            const fourYelloDots = [
              xy,
              [xy[0] + wh[0], xy[1]],
              [xy[0] + wh[0], xy[1] + wh[1]],
              [xy[0], xy[1] + wh[1]],
            ]; // 得到四个圆点

            //   挂载的元素,划入4个点
            const id = D3.select(this)._groups[0][0].parentNode.id; // 矩形父容器的id
            D3.select(`#${id}`)
              .selectAll("circle")
              .data(fourYelloDots)
              .enter()
              .append("circle")
              .attr("cx", (d) => d[0])
              .attr("cy", (d) => d[1])
              .attr("r", 6)
              .attr("fill", "yellow") // 矩形外的四个点的黄色
              .attr("cursor", "move")
              .attr("parent", id)
              .on("mouseenter", function () {
                that.Drag(D3.select(this)); // 将圆添加到拖拽方法中
              });
            that.Drag(D3.select(this)); // 将矩形添加到拖拽方法中
          } else {
            // 不是拖拽情况下,也要添加4个圆
          }
        })
        .on("mouseout", function (e) {
          // 没啥大用,但是就感觉开通以后4个点正常了
          e.stopPropagation();
          let picRelationLeft = e.offsetX;
          let picRelationTop = e.offsetY;
          let isIn = that.isInMarkList(picRelationLeft, picRelationTop);
          that.isDrag = isIn;

          if (!that.isDrag) {
            D3.select(this).attr("cursor", "auto"); // 改变鼠标指针样式
            // D3.select(this).attr("cursor", "context-menu"); // 改变鼠标指针样式
            let widget = D3.select(this).attr("fill", "lime");
            let color = D3.select(this).attr("fill");
            widget.attr("fill", color);
            widget = null; // 被拖拽的元素设为空
          }
        })
        .on("mouseleave", function (e) {
          let picRelationLeft = e.offsetX;
          let picRelationTop = e.offsetY;
          let isIn = that.isInMarkList(picRelationLeft, picRelationTop);
          that.isDrag = isIn;

          if (!that.isDrag) {
            D3.select(this).attr("cursor", "auto"); // 改变鼠标指针样式
            // D3.select(this).attr("cursor", "context-menu"); // 改变鼠标指针样式
            let widget = D3.select(this).attr("fill", "lime");
            let color = D3.select(this).attr("fill");
            widget.attr("fill", color);
            widget = null; // 被拖拽的元素设为空

            D3.select(`#rect-g-${item.preId}`).selectAll("circle").remove(); // 删除四个球
          }
        });

      const xy = [
        +D3.select(`#rect-g-${item.preId}-rect`).attr("x"),
        +D3.select(`#rect-g-${item.preId}-rect`).attr("y"),
      ]; // 顶点坐标
      const wh = [
        +D3.select(`#rect-g-${item.preId}-rect`).attr("width"),
        +D3.select(`#rect-g-${item.preId}-rect`).attr("height"),
      ]; // 矩形宽高
      const { startX, endX, startY, endY, startX2, endX2, startY2, endY2 } = {
        startX: xy[0] + wh[0] - 20,
        startY: xy[1] + 10,
        endX: xy[0] + wh[0] - 10,
        endY: xy[1] + 20,

        startX2: xy[0] + wh[0] - 10,
        startY2: xy[1] + 10,
        endX2: xy[0] + wh[0] - 20,
        endY2: xy[1] + 20,
      };

      let delCon = D3.select(`#rect-g-${item.preId}`)
        .append("g")

        .attr("id", `#rect-g-${item.preId}-delCon`)
        .attr("idParent", `${item.preId}`)
        .attr("cursor", "context-menu")
        .attr("fill", "transparent");

      // .attr('width',`${wh[0]}`)
      // .attr('height',`${wh[1]}`)

      delCon
        .append("line")
        .attr("id", 111)
        .attr("x1", `${startX}`)
        .attr("y1", `${startY}`)
        .attr("x2", `${endX}`)
        .attr("y2", `${endY}`)
        .attr("stroke", `steelblue`)
        .attr("fill", `transparent`)
        .attr("stroke-width", `2`)
        .attr("cursor", `context-menu`);

      delCon
        .append("line")
        .attr("id", 222)
        .attr("x1", `${startX2}`)
        .attr("y1", `${startY2}`)
        .attr("x2", `${endX2}`)
        .attr("y2", `${endY2}`)
        .attr("stroke", `steelblue`)
        .attr("stroke-width", `2`)
        .attr("cursor", `context-menu`);
      //    .attr('width',`${wh[0]}`)
      // .attr('height',`${wh[1]}`)

      delCon.on("click", function (e) {
        e.stopPropagation();

        const xy = [
          +D3.select(`#rect-g-${item.preId}-rect`).attr("x"),
          +D3.select(`#rect-g-${item.preId}-rect`).attr("y"),
        ];
        alert(
          `发送请求,组件往出派发事件即可,xy点位点: ${xy},宽高: ${wh},id: ${item.preId}`
        );
        that.list =  that.list.filter((l) => {
          return l.preId !== item.preId;
        });
      });
    },

    GetCross(p1, p2, p) {
      return (p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y);
    },
    IsPointInMatrix(p1, p2, p3, p4, p) {
      let isPointIn =
        this.GetCross(p1, p2, p) * this.GetCross(p3, p4, p) >= 0 &&
        this.GetCross(p2, p3, p) * this.GetCross(p4, p1, p) >= 0;
      return isPointIn;
    },

    isInMarkList(x, y) {
      // 已经加上了左侧和上侧的偏移量
      let res = this.list.filter((item) => {
        if (this.dimension.scale == 1) {
          return this.IsPointInMatrix(
            { x: item.startX, y: item.startY },
            { x: item.endX, y: item.startY },
            { x: item.endX, y: item.endY },
            { x: item.startX, y: item.endY },
            {
              x,
              y,
            }
          );
        } else {
          return this.IsPointInMatrix(
            {
              x: item.startX + this.dimension.margin.left,
              y: item.startY + this.dimension.margin.top,
            },
            {
              x: item.endX + this.dimension.margin.left,
              y: item.startY + this.dimension.margin.top,
            },
            {
              x: item.endX + this.dimension.margin.left,
              y: item.endY + this.dimension.margin.top,
            },
            {
              x: item.startX + this.dimension.margin.left,
              y: item.endY + this.dimension.margin.top,
            },
            {
              x,
              y,
            }
          );
        }
      });
      // console.log(x, y, "xy");
      // console.log(!!(res && res.length));
      return !!(res && res.length);
    },

    mouseDown(e) {

      let picRelationLeft = e.offsetX;
      let picRelationTop = e.offsetY;
      let isIn = this.isInMarkList(picRelationLeft, picRelationTop);
      this.isDrag = isIn;

      const that = this;
      // 想下是不是所有修改点的位置都要根据缩放值来计算
      // 点下,移动,抬起.
      // 整块拖拽,四个点拖拽,删除按钮位置
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
          .attr("stroke", "yellow") //  点下鼠标, 再次创建矩形
          .attr("fill", "yellow")
          .attr("fill-opacity", 0.1)
          .attr("cursor", "move")
          .on("mouseenter", function () {
            let picRelationLeft = e.offsetX;
            let picRelationTop = e.offsetY;
            let isIn = that.isInMarkList(picRelationLeft, picRelationTop);
            that.isDrag = isIn;

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
              const fourYelloDots = [
                xy,
                [xy[0] + wh[0], xy[1]],
                [xy[0] + wh[0], xy[1] + wh[1]],
                [xy[0], xy[1] + wh[1]],
              ]; // 得到四个圆点
              const id = D3.select(this)._groups[0][0].parentNode.id; // 矩形父容器的id
              D3.select(`#${id}`)
                .selectAll("circle")
                .data(fourYelloDots)
                .enter()
                .append("circle")
                .attr("cx", (d) => d[0])
                .attr("cy", (d) => d[1])
                .attr("r", 6)
                .attr("fill", "yellow")
                .attr("cursor", "move")
                .attr("parent", id)
                .on("mouseenter", function () {
                  that.Drag(D3.select(this)); // 将圆添加到拖拽方法中
                });
              that.Drag(D3.select(this)); // 将矩形添加到拖拽方法中
            }
          })
          .on("mouseout", function (e) {
            let picRelationLeft = e.offsetX;
            let picRelationTop = e.offsetY;
            let isIn = that.isInMarkList(picRelationLeft, picRelationTop);
            that.isDrag = isIn;

            if (!that.isDrag) {
              D3.select(this).attr("cursor", "auto"); // 改变鼠标指针样式
              // D3.select(this).attr("cursor", "context-menu"); // 改变鼠标指针样式
              let widget = D3.select(this).attr("fill", "lime");
              let color = D3.select(this).attr("fill");
              widget.attr("fill", color);
              widget = null; // 被拖拽的元素设为空
            }
          })
          .on("mouseleave", function (e) {
            let picRelationLeft = e.offsetX;
            let picRelationTop = e.offsetY;
            let isIn = that.isInMarkList(picRelationLeft, picRelationTop);
            that.isDrag = isIn;

            if (!that.isDrag) {
              D3.select(this).attr("cursor", "auto"); // 改变鼠标指针样式
              // D3.select(this).attr("cursor", "context-menu"); // 改变鼠标指针样式
              let widget = D3.select(this).attr("fill", "lime");
              let color = D3.select(this).attr("fill");
              widget.attr("fill", color);
              widget = null; // 被拖拽的元素设为空
            }
          });

        this.rectData = xy; // 记录下鼠标按下的坐标
        this.start = true; // 添加矩形开始了（为了在moseover监控另一个点）
        this.startDom = `rect-g-${id}-rect`; // 记录当前添加矩形的id(有了id可以快速定位矩形）
      } else {
      }
    },

    mouseMove(e) {
      let picRelationLeft = e.offsetX;
      let picRelationTop = e.offsetY;
      let isIn = this.isInMarkList(picRelationLeft, picRelationTop);
      this.isDrag = isIn;

      //   初始化触发移动事件的部分逻辑,直接把线画出来. 或者在初始化的时候把这些逻辑写出来
      if (!this.isDrag) {
        //判断不是在拖拽状态下
        const xy = [+e.offsetX, +e.offsetY]; // 获取移动的鼠标的坐标点

        /* 
      // 先处理十字坐标，圆点和两条线 -- 已经关闭   
        D3.select("#line-x")
          .attr("x1", 0)
          .attr("y1", xy[1])
          .attr("x2", this.width)
          .attr("y2", xy[1])
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        D3.select("#line-y")
          .attr("x1", xy[0])
          .attr("y1", 0)
          .attr("x2", xy[0])
          .attr("y2", this.height)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        D3.select("#line-circle")
          .attr("cx", xy[0])
          .attr("r", 6)
          .attr("cy", xy[1])
          .attr("fill", "red"); 
          */
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
        }
      }
    },
    mouseLeaveInit(e) {
      // D3.select("#line-g").remove();
      this.mouseUp(e); // 离开触发一次抬起事件
    },
    mouseUp(e) {
      let picRelationLeft = e.offsetX;
      let picRelationTop = e.offsetY;
      let isIn = this.isInMarkList(picRelationLeft, picRelationTop);
      this.isDrag = isIn;
      if (!this.isDrag) {
        // 不是拖拽,那么就是新的数据
      console.log(this.startDom);

        if (this.startDom) {
          let width = +D3.select(`#${this.startDom}`)
            .style("width")
            .split("px")[0];
          let height = +D3.select(`#${this.startDom}`)
            .style("height")
            .split("px")[0];
            console.log(width);
            console.log(height);
            console.log(this.list);
            let PreId = this.startDom.replace(/\D/g, "").replace("-", "")
            if(this.dimension.scale == 1){
            this.list.push({
                // 新增
                name: `rect-g-${PreId}`,
                preId: PreId,
                startX: this.rectData[0] ,
                startY: this.rectData[1] ,
                endX: this.rectData[0] + width ,
                endY: this.rectData[1] + height ,
                width: width,
                height: height,
              });
            }else{
                 this.list.push({
              // 新增
              name: `rect-g-${PreId}`,
              preId: PreId,
              startX: this.rectData[0] - this.dimension.margin.left,
              startY: this.rectData[1] - this.dimension.margin.top,
              endX: this.rectData[0] + width - this.dimension.margin.left,
              endY: this.rectData[1] + height - this.dimension.margin.top,
              width: width,
              height: height,
          });
            }
       
            console.log(this.list);

        }

        // 判断不是在拖拽状态
        this.start = false; // 添加矩形动作取消
        this.startDom = ""; //
        this.rectData = []; // 参考mousedown
      }
    },
    updateDelPoint(xy, wh, that) {
      const { startX, endX, startY, endY, startX2, endX2, startY2, endY2 } = {
        startX: xy[0] + wh[0] - 20,
        startY: xy[1] + 10,
        endX: xy[0] + wh[0] - 10,
        endY: xy[1] + 20,

        startX2: xy[0] + wh[0] - 10,
        startY2: xy[1] + 10,
        endX2: xy[0] + wh[0] - 20,
        endY2: xy[1] + 20,
      };
      if (that.id === "111") {
        D3.select(that)
          .attr("x1", `${startX}`)
          .attr("y1", `${startY}`)
          .attr("x2", `${endX}`)
          .attr("y2", `${endY}`);
      } else if (that.id === "222") {
        D3.select(that)
          .attr("x1", `${startX2}`)
          .attr("y1", `${startY2}`)
          .attr("x2", `${endX2}`)
          .attr("y2", `${endY2}`);
      }
    },
    createDrag() {
      let color, widget;
      const that = this;
      let isRectOrcircle = {}
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
              .attr("o-x", dot[0] - +widget.attr("x")) // 存储点击点到真正的x/y的间距.
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
          const dot = [+e.sourceEvent.offsetX, +e.sourceEvent.offsetY]; // 实时记录鼠标点的坐标
          if (widget._groups[0][0].localName === "rect") {
            // 拖拽对象为矩形
            const id = widget._groups[0][0].parentNode.id; // 获取父元素的id
            isRectOrcircle = {
              isRect :true
            }
            // o-x 只有这里和拖拽点用到了,还是用来更新4个黄色点的
            widget
              .attr("x", dot[0] - +widget.attr("o-x")) // 减去前面存储的间距,就是左上角
              .attr("y", dot[1] - +widget.attr("o-y")); // 更新矩形的顶点信息
            D3.select(`#${id}`)
              .selectAll("circle")
              .each(function () {
                D3.select(this)
                  .attr("cx", dot[0] - +D3.select(this).attr("o-x"))
                  .attr("cy", dot[1] - +D3.select(this).attr("o-y"));
              });

            const xy = [Number(widget.attr("x")), Number(widget.attr("y"))]; // 顶点坐标
            const wh = [
              Number(D3.select(this).attr("width")),
              Number(D3.select(this).attr("height")),
            ];
            D3.select(`#${id}`)
              .selectAll("line")
              .each(function () {
                let line = D3.select(this)["_groups"][0][0];
                if (line.id === "111") {
                  that.updateDelPoint(xy, wh, this);
                } else if (line.id === "222") {
                  that.updateDelPoint(xy, wh, this);
                }
              });
          }

          if (widget._groups[0][0].localName === "circle") {
            
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
            isRectOrcircle = {
              isRect: false,
              top,
              width:Math.abs(that.topDot[0] - dot[0]),
              height:Math.abs(dot[1] - that.topDot[1])
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
              .attr("fill", "yellow") // 拖拽过程中,对4个点位置进行修改
              .attr("cursor", "move")
              .attr("parent", id)
              .on("mouseenter", function () {
                that.Drag(D3.select(this));
              });

            // 圆拖拽部分,处理x
            const xy = [+top[0], +top[1]]; // 顶点坐标
            const wh = [
              Math.abs(that.topDot[0] - dot[0]), // width
              Math.abs(dot[1] - that.topDot[1]), // height
              // Number(D3.select(this).attr("width")),
              // Number(D3.select(this).attr("height")),
            ];
            D3.select(`#${id}`)
              .selectAll("line")
              .each(function () {
                let line = D3.select(this)["_groups"][0][0];
                if (line.id === "111") {
                  that.updateDelPoint(xy, wh, this);
                } else if (line.id === "222") {
                  that.updateDelPoint(xy, wh, this);
                }
              });
          }
        })
        .on("end", function (e) {
          let changeNode = null
          // 目前最后一个bug, 就是四个点拖拽结束,只是到最后一个点. 然后回想是 忘记重新计算大小了... 在计算位置的时候直接使用原来值的宽高
         if(isRectOrcircle.isRect){
           const dot = that.dimension.scale == 1?[+e.sourceEvent.offsetX, +e.sourceEvent.offsetY]:[+e.sourceEvent.offsetX - that.dimension.margin.left, +e.sourceEvent.offsetY - that.dimension.margin.top]
          const id = (widget._groups[0][0]?.parentNode?.id || ( widget._groups[0][0]?.getAttribute('parent')))?.replace(/\D/g, "").replace("-", "")
          for (let i = 0; i < that.list.length; i++) {
            let l = that.list[i];
            if (l.preId == id) {
              changeNode = l
              that.list[i].startX = dot[0] - +widget.attr("o-x");
              that.list[i].startY = dot[1] - +widget.attr("o-y");
              that.list[i].endX =
                dot[0] - +widget.attr("o-x") + that.list[i].width;
              that.list[i].endY =
                dot[1] - +widget.attr("o-y") + that.list[i].height;

              break;
            }
          }
         }else if(isRectOrcircle.isRect === false){
            // 拖拽4个点,看下如何计算. 感觉就是width需要开始和结束点计算.
            // 在drag的circle里留下这些信息
            const dot = that.dimension.scale == 1?[isRectOrcircle.top[0], isRectOrcircle.top[1]]:[isRectOrcircle.top[0] - that.dimension.margin.left, isRectOrcircle.top[1] - that.dimension.margin.top]
            // const dot = isRectOrcircle.top;
            const id = (widget._groups[0][0]?.parentNode?.id || ( widget._groups[0][0]?.getAttribute('parent')))?.replace(/\D/g, "").replace("-", "")
            for (let i = 0; i < that.list.length; i++) {
              let l = that.list[i];
              if (l.preId == id) {
                changeNode = l
                that.list[i].startX = dot[0] ;
                that.list[i].startY = dot[1] ;
                // that.list[i].startX = dot[0] - +widget.attr("o-x");
                // that.list[i].startY = dot[1] - +widget.attr("o-y");
                that.list[i].endX =
                  dot[0]  + isRectOrcircle.width;
                that.list[i].endY =
                  dot[1]  + isRectOrcircle.height;
                  that.list[i].width = isRectOrcircle.width;
                  that.list[i].height = isRectOrcircle.height;

                break;
              }
            }

         }
         Promise.resolve().then(()=>isRectOrcircle = {})

          widget.attr("fill", color);
          widget = null; // 被拖拽的元素设为空
          // that.init();
          that.$emit('emitList',that.list)
          that.$emit('emitNode',changeNode)
        });
    },
    isNil(val) {
      return val === null || val === undefined;
    },
    getBounding(element) {
      // 获取dom元素的只读边界
      if (element instanceof HTMLElement) {
        return element.getBoundingClientRect();
      }
      return {};
    },
    create() {
      this.isDrag = false;
    },
    move() {
      this.isDrag = true;
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
  min-height: 100%;
  width: 100%;
  position: relative;
}
</style>