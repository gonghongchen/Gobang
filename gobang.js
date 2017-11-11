window.onload = function() {
	gobang.start();
};

var gobang = {
	piecesArray : null,		//用二维数组来记录某个点是否存在棋子，如果存在记录下是第几手棋
	allPieces : [], 	//存储当前所有的棋子
	stepNum : 0, 	//记录当前的步数
	isOver : false,		//记录当前棋局是否已经结束了
	isStop : false,		//标记当前是否可以下子
	init : function() {		//初始化棋盘
		var div = document.createElement("div");
		div.id = "gobang-box";
		
		var div2 = document.createElement("div");
		div2.id = "horizontal-lines";
		div.appendChild(div2);
		new DrawLines(0, div2);
		
		var div3 = document.createElement("div");
		div3.id = "vertical-lines";
		div.appendChild(div3);
		new DrawLines(1, div3);
		
		var div4 = document.createElement("div");
		div4.id = "black-dots";
		div.appendChild(div4);
		this.createDots(div4);
		
		var div5 = document.createElement("div");
		div5.id = "pieces";
		div.appendChild(div5);
		
		document.getElementsByTagName("body")[0].insertBefore(div, document.getElementsByTagName("script")[0]);
		
		this.playerA(div, div5);
	},
	createDots : function(parentEle) {	//创建棋盘中的五个小黑圆点
		var initPosi = 90;		//最左上角的第一个小黑圆点距离左上角的初始距离
		var initSpace = 30;		//线条间的初始间距
		for (var i = 1; i < 6; i++) {
			var span = document.createElement("span");
			
			switch (i){
				case 1:
					span.style.top = initPosi + "px";
					span.style.left = initPosi + "px";
					break;
				case 2:
					span.style.top = initPosi + "px";
					span.style.left = (initPosi + initSpace * 8) + "px";
					break;
				case 3:
					span.style.top = (initPosi + initSpace * 4) + "px";
					span.style.left = (initPosi + initSpace * 4) + "px";
					break;
				case 4:
					span.style.top = (initPosi + initSpace * 8) + "px";
					span.style.left = initPosi + "px";
					break;
				case 5:
					span.style.top = (initPosi + initSpace * 8) + "px";
					span.style.left = (initPosi + initSpace * 8) + "px";
					break;
				default:
					break;
			}
			
			parentEle.appendChild(span);
		}
	},
	playerA : function(chessboard, piecesParent) {	//处理玩家A（人）点击下棋的事件
		var that = this;
		chessboard.onclick = function(event) {
			if (that.isStop) {
				return false;
			}
			
			if (that.isOver) {
				that.reStart(piecesParent);
				return true;
			}
			var initX = this.offsetLeft, initY = this.offsetTop;	//棋盘距离当前窗口的左边，右边的距离
			var x = event.pageX - initX, y = event.pageY - initY;	//点击点所在棋盘区域的位置
			
			x = formatPosi(x);
			y = formatPosi(y);
			
			if (that.piecesArray[x][y]) {
				alert("该处不可落子");
				return false;
			}
			
			var result = that.drawPiece(piecesParent, x, y, "#FFF");
			if (result === "success") {
				alert("你赢了");
				that.isOver = true;
			} else {
				that.isStop = true;
				setTimeout(function() {
					that.playerB(piecesParent, result);
					that.isStop = false;
				}, 700);
			}
		};
		
		function formatPosi (p) {	//格式化棋子的xy坐标，即保证落子在交叉点上面
			p = (p - 5) / 30;
			if (p < 0) {
				p = 0;
			} else if (p > 14) {
				p = 14;
			}
			p = Math.floor(p);
			
			return p;
		}
	},
	playerB : function (piecesParent, result) {		//处理玩家B（电脑）下棋的事件，result 表示上一步棋的结果
		var that = this;
		var arr = [];	//存放上一步棋四种情况判断后各连子个数
		result.map(function(each) {
			arr.push(each.num);
		});
		var maxNum = Math.max.apply(null, arr);		//找到最大连子个数
		var index = arr.indexOf(maxNum);			//找到最大连子个数所在的方向的索引
		var xy = this.getXY(result, arr, maxNum);	//默认为防守模式
		if (xy) {
			console.log("1");
			var result2 = this.getBestXY("black");
			var result4 = this.getBestXY("white");	//还需要判断下除了上一步白棋落子之外的其它所有白棋是否存在需要防守的棋子
			if (result4.maxNum > result2.maxNum && (result4.maxNum === 4 || (result4.maxNum > 2 && result4.emptyPointNum > 1))) {
				console.log("2");
				xy = result4.maxXY;
			} else {	//如果不存在则试着进入进攻模式
				console.log("3");
				if (this.stepNum > 5 && result2 && (maxNum <= result2.maxNum || (maxNum < 4 && result[index].emptyPointNum < 2))) {	//当当前总的步数大于8步，且玩家B有合适落子的位置，并且在玩家A相对没有更多连子或者没有三个及以上连子的情况下进入进攻模式
					console.log("4");
					xy = result2.maxXY;
				}
			}
		} else {	//若没有合适的防守点则直接进入进攻模式
			console.log("5");
			xy = this.getBestXY("black").maxXY;
		}
		
		var result3 = this.drawPiece(piecesParent, xy[0], xy[1], "#000");
		if (result3 === "success") {
			alert("你输了");
			that.isOver = true;
		}
	},
	getXY : function(result, arr, maxNum) {		//获取当前可以落子的位置（包括两端）
		var index = arr.indexOf(maxNum);
		var emptyPoint;
		if (emptyPoint = result[index].emptyPoint1) {			//在最大连子个数的那个情况下落子（一端）
			var x = emptyPoint[0];
			var y = emptyPoint[1];
			return [x, y];
		} else if (emptyPoint = result[index].emptyPoint2) {			//在最大连子个数的那个情况下落子（另一端）
			var x = emptyPoint[0];
			var y = emptyPoint[1];
			return [x, y];
		} else {	//如果此处没有落子的位置则递归查找其它方向上可以落子的方向。
			arr[index] = 0;
			var res = arr.every(function(item) {
				return item === 0;
			});
			if (res) {		//当前情况下没有可以落子的位置
				return false;
			}
			maxNum = Math.max.apply(null, arr);
			this.getXY(result, arr, maxNum);
		}
	},
	getBestXY : function(pieceCate) {	//获取一个合适的落子点
		var maxArr = [], m = 0;
		var piecesArray = this.piecesArray;
		for (var i = 0; i < 15; i++) {
			for (var j = 0; j < 15; j++) {
				if (piecesArray[i][j] && piecesArray[i][j].pieceCate === pieceCate) {
					var result = this.judgeNum(i, j, pieceCate);
					var arr = [];
					result.map(function(each) {
						arr.push(each.num);
					});
					var maxNum = Math.max.apply(null, arr);		//找到最大连子个数
					var index = arr.indexOf(maxNum);
					var xy = this.getXY(result, arr, maxNum);
					if (xy) {
						maxArr[m++] = {
							maxNum : maxNum,
							maxXY : xy,
							emptyPointNum : result[index].emptyPointNum
						};
					}
				}
			}
		}
		
		if (maxArr.length === 0) {		//没有合适的位置落子
			return false;
		}
		
		var maxVal = maxArr[0];
		for (i = 1, len = maxArr.length; i < len; i++) {
			if ((maxArr[i].maxNum === 4 && maxArr[i].emptyPointNum > 0) || (maxArr[i].maxNum > maxVal.maxNum && maxArr[i].emptyPointNum > maxVal.emptyPointNum)) {
				maxVal = null;
				maxVal = maxArr[i];
			}
		}
		
		return maxVal;
	},
	drawPiece : function(piecesParent, x, y, bgColor) {	//绘制棋子
		var span = document.createElement("span");
		var nowPieceCate = "black";
		span.style.backgroundColor = bgColor;
		span.style.left = x * 30 + "px";
		span.style.top = y * 30 + "px";
		this.allPieces.push(span);
		piecesParent.appendChild(span);
		
		this.piecesArray[x][y] = {};
		this.piecesArray[x][y].stepNum = ++this.stepNum;
		if (bgColor === "#000") {
			this.piecesArray[x][y].pieceCate = "black";
		} else {
			this.piecesArray[x][y].pieceCate = "white";
			nowPieceCate = "white";
		}
		
		return this.judgeNum(x, y, nowPieceCate);
	},
	judgeNum : function (x, y, nowPieceCate) {		//判断当前位置横向、纵向、斜向（两种）相连同色棋子的个数。
		var piecesArray = this.piecesArray;
		var result = [];	//记录下四种判断结果
		
		function transverse() {		//横向
			var result1 = {		//当前情况下判断完后记录下此项结果。下同
				num : 0,	//连子数量
				emptyPoint1 : null,	//两端可以下子中其一的坐标
				emptyPoint2 : null,
				emptyPoint3 : null,	//中间可以落子的坐标
				emptyPointNum : 0		//表示当前方向上可以落子的点的个数
			};
			
			for (var i = x, j = x - 4; i >= j; i--) {	//向左判断五个点（包括x本身），并避免判断超出棋盘最左侧的情况
				if (i >= 0) {
					var val = piecesArray[i][y];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint1 = [i, y];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			for (i = x + 1, j = x + 4; i <= j; i++) {	//向右判断五个点（不包括x本身），并避免判断超出棋盘最右侧的情况
				if (i <= 14) {
					val = piecesArray[i][y];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint2 = [i, y];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			if (result1.num === 5) {
				return "success";
			} else {
				result.push(result1);
				return portrait();
			}
		}
		
		function portrait() {		//纵向
			var result1 = {		//当前情况下判断完后记录下此项结果。下同
				num : 0,	//连子数量
				emptyPoint1 : null,	//两端可以下子中其一的坐标
				emptyPoint2 : null,
				emptyPoint3 : null,	//中间可以落子的坐标
				emptyPointNum : 0		//表示当前方向上可以落子的点的个数
			};
			
			for (var i = y, j = y - 4; i >= j; i--) {	//向上判断五个点（包括y本身），并避免判断超出棋盘最上方的情况
				if (i >= 0) {
					var val = piecesArray[x][i];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint1 = [x, i];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			for (i = y + 1, j = y + 4; i <= j; i++) {	//向下判断五个点（不包括y本身），并避免判断超出棋盘最下侧的情况
				if (i <= 14) {
					val = piecesArray[x][i];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint2 = [x, i];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			if (result1.num === 5) {
				return "success";
			} else {
				result.push(result1);
				return slant1();
			}
		}
		
		function slant1() {		//斜向(左上角到右下角)
			var result1 = {		//当前情况下判断完后记录下此项结果。下同
				num : 0,	//连子数量
				emptyPoint1 : null,	//两端可以下子中其一的坐标
				emptyPoint2 : null,
				emptyPoint3 : null,	//中间可以落子的坐标
				emptyPointNum : 0		//表示当前方向上可以落子的点的个数
			};
			
			for (var i = x, j = y, m = x - 4, n = y - 4; i >= m && j >= n; i--, j--) {	//向左上角判断五个点（包括xy本身），并避免判断超出棋盘最左上角的情况
				if (i >= 0) {
					var val = piecesArray[i][j];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint1 = [i, j];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			for (var i = x + 1, j = y + 1, m = x + 4, n = y + 4; i <= m && j <= n; i++, j++) {	//向右下角判断五个点（不包括xy本身），并避免判断超出棋盘最右下角的情况
				if (i <= 14) {
					val = piecesArray[i][j];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint2 = [i, j];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			if (result1.num === 5) {
				return "success";
			} else {
				result.push(result1);
				return slant2();
			}
		}
		
		function slant2() {		//斜向(左下角到右上角)
			var result1 = {		//当前情况下判断完后记录下此项结果。下同
				num : 0,	//连子数量
				emptyPoint1 : null,	//两端可以下子中其一的坐标
				emptyPoint2 : null,
				emptyPoint3 : null,	//中间可以落子的坐标
				emptyPointNum : 0		//表示当前方向上可以落子的点的个数
			};
			
			for (var i = x, j = y, m = x - 4, n = y + 4; i >= m && j <= n; i--, j++) {	//向左下角判断五个点（包括xy本身），并避免判断超出棋盘最左下角的情况
				if (i >= 0) {
					var val = piecesArray[i][j];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint1 = [i, j];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			for (var i = x + 1, j = y - 1, m = x + 4, n = y - 4; i <= m && j >= n; i++, j--) {	//向右上角判断五个点（不包括xy本身），并避免判断超出棋盘最右上角的情况
				if (i <= 14) {
					val = piecesArray[i][j];
					if (val) {
						if (val.pieceCate === nowPieceCate) {
							result1.num++;
						} else {
							break;
						}
					} else {
						result1.emptyPoint2 = [i, j];
						result1.emptyPointNum++;
						break;
					}
				} else {
					break;
				}
			}
			
			if (result1.num === 5) {
				return "success";
			} else {
				result.push(result1);
				return result;
			}
		}
		
		return transverse();
	},
	setPiecesArray : function() {
		var arr = new Array(15);
		var len = arr.length;
		for (var i = 0; i < len; i++) {
			arr[i] = new Array(15);
			for (var j = 0; j < 15; j++) {
				arr[i][j] = null;
			}
		}
		this.piecesArray = arr;
	},
	start : function() {
		this.setPiecesArray();
		this.init();
	},
	reStart : function(piecesParent) {		//重新开始棋局
		piecesParent.innerHTML = "";
		with (this){
			piecesArray = null;
			allPieces = [];
			stepNum = 0;
			isOver = false;
			setPiecesArray();
		}
	}
};

//绘制棋盘线条
function DrawLines(cate, parentEle) {
	this.cate = cate;
	this.parentEle = parentEle;
	this.doDraw();
}

DrawLines.prototype = {
	doDraw : function() {	//绘制
		var cate = this.cate,
			parentEle = this.parentEle,
			fragment = document.createDocumentFragment();
		for (var i = 1; i < 14; i++) {
			var iEle = document.createElement("i");
			if (cate === 0) {	//绘制横线
				iEle.style.top = i * 30 + "px";
			} else {	//绘制竖线
				iEle.style.left = i * 30 + "px";
			}
			fragment.appendChild(iEle);
		}
		parentEle.appendChild(fragment);
	}
};