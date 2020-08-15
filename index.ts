const w : number = window.innerWidth 
const h : number = window.innerHeight 
const scGap : number = 0.02 
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