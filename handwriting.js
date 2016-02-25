//画布宽度、高度调整
var canvasWidth = Math.min( 800 , $(window).width() - 20 )
var canvasHeight = $(window).height()*0.6

//初始画笔颜色
var strokeColor = "black"
//判断鼠标是否按下
var isMouseDown = false
//判断是否移动
var isMouseMove = false
//上一个坐标
var lastLoc = {x:0,y:0}
//上一个时间戳
var lastTimestamp = 0
//上一个画笔宽度:用来将线笔更平缓
var lastLineWidth = -1

//获得画布
var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
//设置画布大小
canvas.width = canvasWidth
canvas.height = canvasHeight

//设置控制面板的样式；宽度
$(".controller").css("width",canvasWidth+"px")
drawGrid()

//删除按钮事件
$("#clear_btn").click(
    function(e){
        context.clearRect( 0 , 0 , canvasWidth, canvasHeight )
        drawGrid()
    }
)
//颜色板选择事件
$(".color_btn").click(
    function(e){
        $(".color_btn").removeClass("color_btn_selected")
        $(this).addClass("color_btn_selected")
        strokeColor = $(this).css("background-color")
    }
)

/*点击下去之后*/
function beginStroke(point){

    isMouseDown = true
    //console.log("mouse down!")
    lastLoc = windowToCanvas(point.x, point.y)
    lastTimestamp = new Date().getTime();
    /*if(!isMouseMove){
    	var point=windowToCanvas(e.clientX,e.clientY)
    	context.lineWidth=2;
    	context.arc(point.x,point.y,2,0,2*Math.PI)
    	context.stroke()
    }
    isMouseMove=false*/
}
//点击结束
function endStroke(e){
    isMouseDown = false
    
}
//移动中时
function moveStroke(point){

    var curLoc = windowToCanvas( point.x , point.y );
    var curTimestamp = new Date().getTime();
    var s = calcDistance( curLoc , lastLoc )
    var t = curTimestamp - lastTimestamp

    var lineWidth = calcLineWidth( t , s );

    //draw
    context.beginPath();
    context.moveTo( lastLoc.x , lastLoc.y );
    context.lineTo( curLoc.x , curLoc.y );

    context.strokeStyle = strokeColor
    context.lineWidth = lineWidth
    context.lineCap = "round"
    context.lineJoin = "round"
    context.stroke()

    lastLoc = curLoc
    lastTimestamp = curTimestamp
    lastLineWidth = lineWidth
}


/*桌面鼠标功能*/
canvas.onmousedown = function(e){
	//屏蔽默认事件
    e.preventDefault()
    beginStroke( {x: e.clientX , y: e.clientY} )
};
canvas.onmouseup = function(e){
    e.preventDefault()
    endStroke()
    
};
canvas.onmouseout = function(e){
    e.preventDefault()
    endStroke()
};
canvas.onmousemove = function(e){
    e.preventDefault()
    if( isMouseDown ){
        moveStroke({x: e.clientX , y: e.clientY})
    }
};

/*触摸功能*/
canvas.addEventListener('touchstart',function(e){
    e.preventDefault()
    touch = e.touches[0]
    beginStroke( {x: touch.pageX , y: touch.pageY} )
});
canvas.addEventListener('touchmove',function(e){
    e.preventDefault()
    if( isMouseDown ){
        touch = e.touches[0]
        moveStroke({x: touch.pageX , y: touch.pageY})
    }
});
canvas.addEventListener('touchend',function(e){
    e.preventDefault()
    endStroke()
});


//定义画笔的宽度
var maxLineWidth = 10;
var minLineWidth = 1;
var maxStrokeV = 10;
var minStrokeV = 0.1;
/*
 * t:相邻两点的 时间间隔
 * s:相邻两点的距离间隔
 * 
  */
function calcLineWidth( t , s ){

    var v = s / t;

    var resultLineWidth;
    if( v <= minStrokeV )
        resultLineWidth = maxLineWidth;
    else if ( v >= maxStrokeV )
        resultLineWidth = minLineWidth;
    else{
        resultLineWidth = maxLineWidth - (v-minStrokeV)/(maxStrokeV-minStrokeV)*(maxLineWidth-minLineWidth);
    }

    if( lastLineWidth == -1 )
        return resultLineWidth;

    return resultLineWidth*1/3 + lastLineWidth*2/3;
}

//计算两点之间的距离，用来影响速度，进而影响画笔的宽度
function calcDistance( loc1 , loc2 ){

    return Math.sqrt( (loc1.x - loc2.x)*(loc1.x - loc2.x) + (loc1.y - loc2.y)*(loc1.y - loc2.y) )
}

//窗口坐标转换画布坐标:坐标转化
function windowToCanvas( x , y ){
	//外围对象
    var bbox = canvas.getBoundingClientRect()
    //返回json形式的数据可以方便使用
    return {x:Math.round(x-bbox.left) , y:Math.round(y-bbox.top)}
}


//绘画方格框
function drawGrid(){

    context.save()

    context.strokeStyle = "rgb(230,11,9)"

    context.beginPath()
    context.moveTo( 3 , 3 )
    context.lineTo( canvasWidth - 3 , 3 )
    context.lineTo( canvasWidth - 3 , canvasHeight - 3 )
    context.lineTo( 3 , canvasHeight - 3 )
    context.closePath()
    context.lineWidth = 6
    context.stroke()

    context.beginPath()
    context.moveTo(0,0)
    context.lineTo(canvasWidth,canvasHeight)

    context.moveTo(canvasWidth,0)
    context.lineTo(0,canvasHeight)

    context.moveTo(canvasWidth/2,0)
    context.lineTo(canvasWidth/2,canvasHeight)

    context.moveTo(0,canvasHeight/2)
    context.lineTo(canvasWidth,canvasHeight/2)

    context.lineWidth = 1
    context.stroke()

    context.restore()
}