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
        context.strokeStyle = colors[i]
        DrawingUtil.drawTapRectCreator(context, x, y, scale)
    }
}