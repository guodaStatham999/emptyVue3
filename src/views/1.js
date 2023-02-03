// https://juejin.cn/post/6913835124681342989
export default class chart {
    // 初始构造器
    constructor(params) {

        // 缩放逻辑
        this.data = []; // 因为canvas是基于状态绘制的，也就是设置了缩放值，再绘制的元素才会根据缩放倍数绘制，因此需要把每个绘制的对象保存起来。
        this.scale = 1; // 默认缩放值是 1
        // 缩放具体实现会用到的数据
        this.maxScale = 3; // 最大缩放值
        this.minScale = 1; // 最小缩放值
        this.step = 0.1; // 缩放率
        this.offsetX = 0; // 画布X轴偏移值
        this.offsetY = 0; // 画布Y轴偏移值






        var wrapDomStyle = getComputedStyle(params.el);
        this.width = parseInt(wrapDomStyle.width, 10);
        this.height = parseInt(wrapDomStyle.height, 10);


        // 基础部分
        // 创建canvas画布
        this.El = document.createElement('canvas');
        this.El.height = this.height;
        this.El.width = this.width;
        this.ctx = this.El.getContext('2d');

        params.el.appendChild(this.El);
        // 添加滚轮判断事件
        this.addScaleFunc();


        // 拖拽逻辑
        this.wrapDom = params.el;
        this.addDragFunc();
    }
    // 添加拖拽功能，判断时机注册移除 拖拽 功能
    addDragFunc() {
        this.El.addEventListener('mousedown', this.addMouseMove);
        document.addEventListener('mouseup', this.removeMouseMove);
    }
    // 添加鼠标移动 功能，获取保存当前点击坐标
    addMouseMove = (e) => {

        this.targetX = e.offsetX
        this.targetY = e.offsetY

        this.mousedownOriginX = this.offsetX;
        this.mousedownOriginY = this.offsetY;

        var x = (this.targetX - this.offsetX) / this.scale;
        var y = (this.targetY - this.offsetY) / this.scale;

        this.activeShape = null

        this.data.forEach(item => {
            switch (item.type) {
                case 'rect':
                    this.isInnerRect(...item.data, x, y) && (this.activeShape = item)
                    break;
                case 'circle':
                    this.isInnerCircle(item.x, item.y, item.r, x, y) && (this.activeShape = item)
                    break;
                case 'line':
                    var lineNumber = item.data.length / 2 - 1
                    var flag = false
                    for (let i = 0; i < lineNumber; i++) {
                        let index = i * 2;
                        flag = this.isInnerPath(item.data[index], item.data[index + 1], item.data[index + 2], item.data[index + 3], x, y, item.lineWidth || 1)
                        if (flag) {
                            this.activeShape = item
                            break;
                        }
                    }
            }
        })

        if (!this.activeShape) {
            this.wrapDom.style.cursor = 'grabbing'
            this.El.addEventListener('mousemove', this.moveCanvasFunc, false)
        } else {
            this.wrapDom.style.cursor = 'all-scroll'
            this.shapedOldX = null
            this.shapedOldY = null
            this.El.addEventListener('mousemove', this.moveShapeFunc, false)
        }
    }
    // 移动形状
    moveShapeFunc = (e) => {
        var moveX = e.offsetX - (this.shapedOldX || this.targetX);
        var moveY = e.offsetY - (this.shapedOldY || this.targetY);

        moveX /= this.scale
        moveY /= this.scale

        switch (this.activeShape.type) {
            case 'rect':
                let x = this.activeShape.data[0]
                let y = this.activeShape.data[1]
                let width = this.activeShape.data[2]
                let height = this.activeShape.data[3]
                this.activeShape.data = [x + moveX, y + moveY, width, height]
                break;
            case 'circle':
                this.activeShape.x += moveX
                this.activeShape.y += moveY
                break;
            case 'line':
                var item = this.activeShape;
                var lineNumber = item.data.length / 2
                for (let i = 0; i < lineNumber; i++) {
                    let index = i * 2;
                    item.data[index] += moveX
                    item.data[index + 1] += moveY
                }
        }
        this.shapedOldX = e.offsetX
        this.shapedOldY = e.offsetY

        this.render()
    }

    // 判断是否在矩形框内
    isInnerRect(x0, y0, width, height, x, y) {
        return x0 <= x && y0 <= y && (x0 + width) >= x && (y0 + height) >= y
    }

    // 判断是否在圆形内
    isInnerCircle(x0, y0, r, x, y) {
        return Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2) <= Math.pow(r, 2)
    }

    // 判断是否在路径上
    isInnerPath(x0, y0, x1, y1, x, y, lineWidth) {
        var a1pow = Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2);
        var a1 = Math.sqrt(a1pow, 2)
        var a2pow = Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2)
        var a2 = Math.sqrt(a2pow, 2)

        var a3pow = Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)
        var a3 = Math.sqrt(a3pow, 2)

        var r = lineWidth / 2
        var ab = (a1pow - a2pow + a3pow) / (2 * a3);
        var h = Math.sqrt(a1pow - Math.pow(ab, 2), 2)

        var ad = Math.sqrt(Math.pow(a3, 2) + Math.pow(r, 2))

        return h <= r && a1 <= ad && a2 <= ad
    }




    // 移除鼠标移动事件
    removeMouseMove = () => {
        this.wrapDom.style.cursor = ''
        this.El.removeEventListener('mousemove', this.moveCanvasFunc, false)
        this.El.removeEventListener('mousemove', this.moveShapeFunc, false)
    }
    // 移动画布
    moveCanvasFunc = (e) => {
        var offsetX = this.mousedownOriginX + (e.offsetX - this.targetX);
        var offsetY = this.mousedownOriginY + (e.offsetY - this.targetY);

        this.render()
    }








    // 添加缩放功能，判断时机注册移除MouseWhell事件
    addScaleFunc() {
        this.El.addEventListener('mouseenter', this.addMouseWhell);
        this.El.addEventListener('mouseleave', this.removeMouseWhell);
    }

    // 缩放 具体计算
    scrollFunc = (e) => {
        // 阻止默认事件 （缩放时外部容器禁止滚动）
        e.preventDefault();

        if (e.wheelDelta) {
            var x = e.offsetX - this.offsetX
            var y = e.offsetY - this.offsetY

            var offsetX = (x / this.scale) * this.step
            var offsetY = (y / this.scale) * this.step

            if (e.wheelDelta > 0) {
                this.offsetX -= this.scale >= this.maxScale ? 0 : offsetX
                this.offsetY -= this.scale >= this.maxScale ? 0 : offsetY

                this.scale += this.step
            } else {
                this.offsetX += this.scale <= this.minScale ? 0 : offsetX
                this.offsetY += this.scale <= this.minScale ? 0 : offsetY

                this.scale -= this.step
            }

            this.scale = Math.min(this.maxScale, Math.max(this.scale, this.minScale))

            this.render()
        }
    }



    // 添加 mousewhell 事件
    addMouseWhell = () => {
        document.addEventListener('mousewheel', this.scrollFunc, {
            passive: false
        });
    }

    // 移除mousewhell 事件
    removeMouseWhell = () => {
        document.removeEventListener('mousewheel', this.scrollFunc, {
            passive: false
        });
    }



    // 绘制圆形
    drawCircle(data) {
        this.ctx.beginPath();
        this.ctx.fillStyle = data.fillStyle;
        this.ctx.arc(data.x, data.y, data.r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    // _____________ 添加绘制线条方法 ____________
    drawLine(data) {
        var arr = data.data.concat()
        var ctx = ctx || this.ctx;

        ctx.beginPath()
        ctx.moveTo(arr.shift(), arr.shift())
        ctx.lineWidth = data.lineWidth || 1
        do {
            ctx.lineTo(arr.shift(), arr.shift());
        } while (arr.length)

        ctx.stroke();
    }

    // ___________ 添加绘制矩形方法 ______________
    drawRect(data) {
        this.ctx.beginPath();
        this.ctx.fillStyle = data.fillStyle;
        this.ctx.fillRect(...data.data);
    }

    // ___________ 添加一个判断类型绘制的方法 _____________
    draw(item) {
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
        switch (item.type) {
            case 'line':
                this.drawLine(item)
                break;
            case 'rect':
                this.drawRect(item)
                break;
            case 'circle':
                this.drawCircle(item)
                break;
        }
    }



    // 添加形状
    push(data) {
        // push 方法中添加保存数据操作
        this.data.push(data);

        this.draw(data); // ____________ 修改调用绘制方法 ____________
    }
    // 渲染整个 图形画布
    render() {
        this.El.width = this.width

        this.data.forEach(item => {
            this.draw(item)
        })
    }
}