const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 2 
const scGap : number = 0.02 
const sizeFactor : number = 8.9 
const strokeFactor : number = 90
const backColor : string = "#BDBDBD" 
const colors : Array<string> = [
    "#F44336",
    "#3F51B5",
    "#4CAF50", 
    "#795548",
    "#009688"
]
const delay : number = 20 

class ScaleUtil {


    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    } 

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawTapRectCreator(context : CanvasRenderingContext2D, x : number, y : number, scale : number) {
        const size : number = Math.min(w, h) / sizeFactor
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const ux : number = size * 0.5 * sf1 
        const uy : number = -(h - y) * sf2 
        context.save()
        context.translate(x, h)
        DrawingUtil.drawLine(context, -ux, uy, ux, uy)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.translate(-size / 2 + size * j, 0)
            DrawingUtil.drawLine(context, 0, 0, 0, uy)
            context.restore()
        }
        context.restore()
    }

    static drawTRCNode(context : CanvasRenderingContext2D, i : number, scale : number, x : number, y : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i % colors.length]
        DrawingUtil.drawTapRectCreator(context, x, y, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = (event) => {
            const {offsetX, offsetY} = event
            this.renderer.handleTap(offsetX, offsetY, () => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class TRCNode {


    state : State = new State()

    constructor(private i : number, private x : number, private y : number) {
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawTRCNode(context, this.i, this.state.scale, this.x, this.y)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }
}

class TapRectCreator {

    nodes : Array<TRCNode> = []
    i : number = 0 

    draw(context : CanvasRenderingContext2D) {
        this.nodes.forEach((node) => {
            node.draw(context)
        })
    }

    update(cb : Function) {
        this.nodes.forEach((node) => {
            node.update(() => {
                this.nodes.splice(0, 1)
                if (this.nodes.length == 0) {
                    cb()
                }
            })
        })
    }

    startUpdating(x : number, y : number, cb : Function) {
        const node = new TRCNode(this.i, x, y)
        this.i++ 
        this.nodes.push(node)
        node.startUpdating(() => {
            if (this.nodes.length == 1) {
                cb()
            }
        })
    }
}

class Renderer {

    tsc : TapRectCreator = new TapRectCreator()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.tsc.draw(context)
    }

    handleTap(x : number, y : number, cb : Function) {
        this.tsc.startUpdating(x, y, () => {
            this.animator.start(() => {
                cb()
                this.tsc.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}