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
        if (x1 == x2 && y1 == y2) {
            return 
        }
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawRotLadder(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts + 1)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts + 1)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, parts + 1)
        const sf4 : number = ScaleUtil.divideScale(sf, 3, parts + 1)
        const size : number = Math.min(w, h) / sizeFactor 
        const gap : number = Math.min(w, h) / gapFactor 
        const hGap : number = size / (lines + 1)
        context.save()
        context.translate(w / 2, h / 2)
        context.rotate(Math.PI / 2 * sf4)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.translate((1 - 2 * j) * gap * 0.5 * sf2, -size / 2)
            DrawingUtil.drawLine(context, 0, 0, 0, size * sf1)
            context.restore()
        }
        for (var j = 0; j < 6; j++) {
            context.save()
            context.translate(0, -size / 2+ hGap + hGap * j)
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
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w , h)
        this.renderer.render(this.context)
        
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
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
        console.log(this.scale)
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

class RLNode {

    state : State = new State()
    prev : RLNode 
    next : RLNode 

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new RLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawRLNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RLNode {
        var curr : RLNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class RotatingLadder {

    curr : RLNode = new RLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    rl : RotatingLadder = new RotatingLadder()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.rl.draw(context)
    }

    handleTap(cb : Function) {
        this.rl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.rl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}