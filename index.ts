import { ContextReplacementPlugin } from "webpack"

const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 4 
const lines : number = 6 
const scGap : number = 0.02 / parts  
const strokeFactor : number = 90 
const sizeFactor : number = 1.8 
const gapFactor : number = 3.8 
const rot : number = 90 
const delay : number = 20 
const backColor : string = "#bdbdbd"
const colors : Array<string> = ["#F44336", "#4CAF50", "#3F51B5", "#009688", "#03A9F4"]

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

    static drawRotLadder(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, parts)
        const sf4 : number = ScaleUtil.divideScale(sf, 3, parts)
        const size : number = Math.min(w, h) / sizeFactor 
        const gap : number = Math.min(w, h) / gapFactor 
        const hGap : number = size / (lines + 2)
        context.save()
        context.translate(w / 2, h / 2)
        context.rotate(Math.PI / 2 * sf4)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.translate(-gap * 0.5 * sf2, -size / 2)
            DrawingUtil.drawLine(context, 0, 0, 0, size * sf1)
            context.restore()
        }
        for (var j = 0; j < 6; j++) {
            context.save()
            context.translate(0, hGap + hGap * j)
            DrawingUtil.drawLine(context, -gap * 0.5 * sf3, 0, gap * 0.5 * sf3, 0)
            context.restore()
        }
        context.restore()
    }

    static  drawRLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        DrawingUtil.drawRotLadder(context, scale)
    }
}

class Stage {

    context : CanvasRenderingContext2D 
    canvas : HTMLCanvasElement = document.createElement('canvas')

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w , h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}