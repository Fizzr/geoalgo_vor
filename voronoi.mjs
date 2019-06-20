//Grabbing the "negative" X value will always give the appropriate sided X. Since the sites have a specified ordered in the tuple and the equation flipped upside down if sites are flipped.
const myIntersect = 0; // Vor

const dotSize = 3;

function clearCanvas(context) //Over vor lin
{
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
}
export function Vertex(x, y) //Vor Overworld
{
	this.x = x;
	this.y = y;
	this.edge = null;
}

export function Edge (origin, twin) //Vor Overworld
{
	this.origin = origin;
	this.twin = twin;
	this.next = null;
	this.prev = null;
}

export function Site(x, y) //Vor
{
	this.x = x;
	this.y = y;
	this.siteID = 0
}

function CircleEvent(x,y, eventY, arch) //Vor
{
	this.x = x;
	this.y = y;
	this.eventY = eventY;
	this.falseAlarm = false;
	this.dissapearingArch = arch;
}

function Line(offset, slope) //Vor
{
	this.offset = offset;
	this.slope = slope;
}

function compareEvents(a, b) //Vor Lin
{
	if(a.y === b.y ) return a.x - b.x
	return a.y - b.y;
}

//From internet
function floatToBits(f) //Vor
{
	var buf = new ArrayBuffer(4);
	(new Float32Array(buf))[0] = f;
	return (new Uint32Array(buf))[0];
}
function bitsToFloat(b) //Vor
{
	var buf = new ArrayBuffer(4);
	(new Uint32Array(buf))[0] = b;
	return (new Float32Array(buf))[0];
}
function nextFloat(f)  //Vor
{
	// Note that this moves away from 0.0
	// It will fail at +/- infinity and result in an NaN
	var bitRepr = floatToBits(f);
	bitRepr++;
	return bitsToFloat(bitRepr);
}
function prevFloat(f)//Vor
{
	// Note that this moves towards 0.0
	// This will fail at 0.0 and result in an NaN
	var bitRepr = floatToBits(f);
	bitRepr--;
	return bitsToFloat(bitRepr);
}

function BeachTree(queue) //Vor
{
	this.root = null;
	this.edges = [];
	this.vertices = [];
	this.queue = queue;
	this.archID = 1;
	this.bpID = 1;
}

function BeachNode(){} //Vor

function Breakpoint(leftArch, rightArch, leftChild, rightChild, isRightSide, edge, tree) //Vor
{
	this.edge = edge;
	this.tuple = [leftArch, rightArch];
	this.leftChild = leftChild;
	this.rightChild = rightChild;
	this.isRightSide = isRightSide;
	this.tree = tree;
	this.bpID = tree.bpID++;
	this.leftHeight = 1;
	this.rightHeight = 1;
}

function Arch(site, tree) // Vor
{
	this.site = site;
	this.circleEvent = null;
	this.before = null;
	this.after = null;
	this.archID = tree.archID;
}
Breakpoint.prototype = Object.create(BeachNode.prototype); //Vor
Arch.prototype = Object.create(BeachNode.prototype); //Vor
function decFunc(node, rightSide) //Vor
{
	return function()
	{
		if(rightSide)
		node.rightHeight--;
		else
		node.leftHeight--;
	}
}
BeachTree.prototype.addSite = function(site) //Vor
{
	if(!site instanceof Site)
	{
		throw "Invalid Argument, not of instance Site"
	}
	if(this.root == null)
	{
		let arch = new Arch(site, this);
		this.root = arch;
	}
	else {
		if(this.root instanceof Arch)
		{
			this.root = splitArch(this.root, site, null, this);
		}
		else
		{
			this.root.addSite(site, null);
		}
	}
}
BeachTree.prototype.processCircle = function(circleEvent) //Vor
{
	if(!this.root instanceof Breakpoint)
	{
		throw "Attempted to remove arch from BeachTree without breakpoints";
		return;
	}
	if(circleEvent.falseAlarm == true)
	return;

	let tryLog = function() {if(log) console.log.apply(console, arguments)}
	let log = false;

	// if(circleEvent.dissapearingArch.archID == 647)
	// 	log = true;

	let lastNode = null;
	let currentNode = this.root;
	let firstBP = null;
	let sndBP = null;
	let firstRight = false;

	let arch = circleEvent.dissapearingArch;
	let leftArch = arch.before;
	let rightArch = arch.after;

	tryLog("Circle tripplet %d %d %d", leftArch.archID, arch.archID, rightArch.archID);

	let lastRight = false;
	let funcList = [];
	//Find both involved breakpoints
	while(sndBP == null)
	{
		if(!(currentNode instanceof Breakpoint))
		{
			console.error("Circle tripplet %d %d %d", leftArch.archID, arch.archID, rightArch.archID);
			throw "Diddn't find breakpoints for circleEvent"
			return;
		}
		tryLog("Searching through ", currentNode.bpID);
		if(currentNode.tuple[0] == leftArch && currentNode.tuple[1] == arch)
		{
			if(firstBP == null)
			{
				firstBP = currentNode;
				lastNode = currentNode;
				if(currentNode.leftHeight >= currentNode.rightHeight)
				funcList = [];
				funcList.push(decFunc(currentNode, true));
				currentNode = currentNode.rightChild;
				lastRight = true;
				firstRight = false;

			}
			else
			{
				sndBP = currentNode;
			}
		}
		else if(currentNode.tuple[0] == arch && currentNode.tuple[1] == rightArch)
		{
			if(firstBP == null)
			{
				tryLog("Found first")
				firstBP = currentNode;
				lastNode = currentNode;
				if(currentNode.rightHeight >= currentNode.leftHeight)
				funcList = [];
				funcList.push(decFunc(currentNode, false));0
				currentNode = currentNode.leftChild;
				lastRight = false;
				firstRight = true;
			}
			else
			{
				tryLog("Found second");
				sndBP = currentNode;
			}
		}
		else
		{
			lastNode = currentNode;
			let breakX = currentNode.breakX(circleEvent.y, log);
			tryLog("BreakX %f EventX %f", breakX, circleEvent.x);
			if(circleEvent.x == breakX)
			{
				throw "Event on top of breakpoint, undefined behaviour!"
			}
			else if(circleEvent.x > breakX)
			{
				if(currentNode.leftHeight >= currentNode.rightHeight)
				funcList = [];
				funcList.push(decFunc(currentNode, true));
				currentNode = currentNode.rightChild;
				lastRight = true;
			}
			else
			{
				if(currentNode.rightHeight >= currentNode.leftHeight)
				funcList = [];
				funcList.push(decFunc(currentNode, false));
				currentNode = currentNode.leftChild;
				lastRight = false;
			}
		}
	}
	//Found both!
	let sndOtherNode = (sndBP.rightChild == arch? sndBP.leftChild : sndBP.rightChild);
	if(lastRight)
	{
		if(lastNode.leftHeight < lastNode.rightHeight)
		{
			for (let func of funcList)
				func();
		}
		else
		{
			lastNode.rightHeight--;
		}
		lastNode.rightChild = sndOtherNode;
	}
	else
	{
		if(lastNode.rightHeight < lastNode.leftHeight)
		{
			for (let func of funcList)
				func();
		}
		else
		{
			lastNode.leftHeight--;
		}
		lastNode.leftChild = sndOtherNode;
	}

	if(this.root.getHeight()-1 != (this.root.leftHeight>this.root.rightHeight? this.root.leftHeight: this.root.rightHeight))
	{
		console.error("Height error! Got %d, have %d and %d", this.root.getHeight()-1, this.root.leftHeight, this.root.rightHeight)
		console.error("While processing tripple %d %d %d", leftArch.archID, arch.archID, rightArch.archID);
	}
	leftArch.after = rightArch;
	rightArch.before = leftArch;

	let firstEdge = firstBP.edge;
	let sndEdge = sndBP.edge;

	let vert = new Vertex(circleEvent.x, circleEvent.eventY);
	let twinEdge = new Edge(vert, null);
	let newEdge = new Edge(null, twinEdge);
	twinEdge.twin = newEdge;

	sndEdge.origin = vert;
	firstEdge.origin = vert;
	vert.edge = twinEdge;

	let leftEdge;
	let rightEdge;

	if(firstRight)
	{
		rightEdge = firstEdge;
		leftEdge = sndEdge;
	}
	else
	{
		leftEdge = firstEdge;
		rightEdge = sndEdge;
	}

	leftEdge.twin.next = rightEdge;
	rightEdge.twin.next = twinEdge;
	newEdge.next = leftEdge;
	leftEdge.prev = newEdge;
	twinEdge.prev = rightEdge.twin;
	rightEdge.prev = leftEdge.twin;


	if(sndEdge.twin.origin != null)
	{
		this.edges.push(sndEdge);
	}
	if(firstEdge.twin.origin != null)
	{
		this.edges.push(firstEdge);
	}
	this.vertices.push(vert);


	firstBP.tuple = [leftArch, rightArch];
	firstBP.edge = newEdge;

	if(leftArch.circleEvent != null)
	{
		leftArch.circleEvent.falseAlarm = true;
		leftArch.circleEvent = null;
	}
	if(rightArch.circleEvent != null)
	{
		rightArch.circleEvent.falseAlarm = true;
		rightArch.circleEvent = null;
	}

	if(leftArch.before != null)
	{
		let event = detectCircleEvent(leftArch.before, leftArch, rightArch);
		if(event != null)
		{
			leftArch.circleEvent = event;
			this.queue.queue(event);
		}
	}
	if(rightArch.after != null)
	{
		let event = detectCircleEvent(leftArch, rightArch, rightArch.after);
		if(event != null)
		{
			rightArch.circleEvent = event;
			this.queue.queue(event);
		}
	}
}
BeachTree.prototype.closeEdges = function() //Vor
{
	if(this.root && (this.root instanceof Breakpoint))
		this.root.closeEdges();
}
BeachTree.prototype.draw = function(line, xCorr, yCorr, arches, canvas) //Vor
{
	if(this.root != null)
	{
		this.root.draw(line, xCorr, yCorr, arches, canvas);
		canvas.strokeStyle = "#ff0000"
		for (let edge of this.edges)
		{
			if(edge.twin.origin != null)
			{
				canvas.beginPath();
				canvas.moveTo(xCorr(edge.origin.x), yCorr(edge.origin.y));
				canvas.lineTo(xCorr(edge.twin.origin.x), yCorr(edge.twin.origin.y));
				canvas.stroke();
			}
		}
		// for(vert of this.vertices)
		// {
		// 	canvas.fillStyle = "#FF0000";
		//
		// 	canvas.beginPath();
		// 	canvas.arc(xCorr(vert.x), yCorr(vert.y), dotSize*3/4, 0, 2 * Math.PI, false);
		// 	canvas.fill();
		// }
	}
}
BeachTree.prototype.print = function(canvas) //Vor
{
	if(this.root != null)
	{
//		console.log(canvas);
		clearCanvas(canvas);

		this.root.print(0, canvas.canvas.clientWidth, 40, canvas);
	}
}

Breakpoint.prototype.closeEdges = function() //Vor
{
	if(this.edge.twin.origin)
	{
		let a = this.edge.twin.prev;
		let b = this.edge.next;
		a.next = b;
		b.prev = a;
		this.edge.twin.origin.edge = b;
	}
	if(this.leftChild instanceof Breakpoint)
		this.leftChild.closeEdges();
	if(this.rightChild instanceof Breakpoint)
		this.rightChild.closeEdges();
}
Breakpoint.prototype.getHeight = function() //Vor
{
	let left;
	let right;
	if(this.leftChild instanceof Arch)
		left = 1;
	else left = this.leftChild.getHeight();
	if(this.rightChild instanceof Arch)
		right = 1;
	else right = this.rightChild.getHeight();
	return (left > right? left:right)+1;
}
Breakpoint.prototype.breakX = function(line, log = false) //Vor
{
	return findArchIntersect(this.tuple[0].site, this.tuple[1].site, line, log)[myIntersect];
}
Breakpoint.prototype.addSite = function(site, rightBP) //Vor
{
	let breakpointX = this.breakX(site.y); //Grabbing the "negative" X value will always give the appropriate sided X. Since the sites have a specified ordered in the tuple the positive X will be on the left side in left side breakpoints, and vice versa for right.
	let goingRight = site.x > breakpointX;
	let child = (goingRight? this.rightChild: this.leftChild);
	if(child instanceof Arch)
	{
		if(goingRight){
			let newBreak = splitArch(child, site, rightBP, this.tree);
			this.rightChild = newBreak;
			this.rightHeight = 3;
		}
		else
		{
			let newBreak = splitArch(child, site, this, this.tree);
			this.leftChild = newBreak;
			this.leftHeight = 3;
		}
	}
	else
	{
		let height = child.addSite(site, (goingRight? rightBP: this)) + 1;
		if (goingRight) this.rightHeight = height;
		else this.leftHeight = height;
	}
	return (this.rightHeight > this.leftHeight? this.rightHeight: this.leftHeight);
}
Breakpoint.prototype.draw = function(line, xCorr, yCorr, arches, canvas) //Vor
{
	let intersect = this.breakX(line);
	let index = (this.isRightSide? 1: 0);
	let invIndex = (this.isRightSide? 0: 1);
	let startB;

	if(this.edge.twin.origin != null)
	{
		startB = [this.edge.twin.origin.x, this.edge.twin.origin.y];
	}
	else
	{
		startB = [this.tuple[invIndex].site.x, this.tuple[index].site.getY(this.tuple[invIndex].site.y, this.tuple[invIndex].site.x)];
	}

	let b = [intersect, this.tuple[0].site.getY(line, intersect)];

	canvas.fillStyle = "#FF0000";

	canvas.beginPath();
	canvas.arc(xCorr(b[0]), yCorr(b[1]), dotSize, 0, 2 * Math.PI, false);
	canvas.fill();

	canvas.strokeStyle = "#ff0000";
	canvas.beginPath();
	canvas.moveTo(xCorr(b[0]), yCorr(b[1]));
	canvas.lineTo(xCorr(startB[0]), yCorr(startB[1]));
	canvas.stroke();

	this.leftChild.draw(line, xCorr, yCorr, arches, canvas);
	this.rightChild.draw(line, xCorr, yCorr, arches, canvas);
}
Breakpoint.prototype.print = function(start, end, height, canvas) //Vor
{
	let stdHeightDiff = 50;
	let topToBotArr = 35;
	let ArToTxt = 20;
	canvas.fillStyle = "#FF0000";
	canvas.font = "12px Arial";
	canvas.textAlign = "center"
	let mid = start + (end-start)/2;
	canvas.fillText(this.bpID, mid, height);
	canvas.fillStyle = "#0000FF";
	canvas.fillText(this.tuple[0].archID+","+this.tuple[1].archID, mid, height+15)
	canvas.fillText(this.leftHeight + " h " + this.rightHeight, mid, height + 30)

	let ratio = this.leftHeight/(this.leftHeight+this.rightHeight);
	let leftPartition = (end-start) * ratio;

	canvas.strokeStyle = "#000000";
	canvas.beginPath();
	canvas.moveTo(mid, height+topToBotArr);
	canvas.lineTo(start + (leftPartition)/2, height+stdHeightDiff);
	canvas.stroke();

	canvas.beginPath();
	canvas.moveTo(mid, height+topToBotArr);
	canvas.lineTo(start+leftPartition + (end-(start+leftPartition))/2, height+stdHeightDiff);
	canvas.stroke();

	this.leftChild.print(start, start+leftPartition, height+stdHeightDiff+ArToTxt, canvas);
	this.rightChild.print(start+leftPartition, end, height+stdHeightDiff+ArToTxt, canvas);
}

Arch.prototype.print = function(start, end, height, canvas) //Vor
{
	canvas.fillStyle = "#0000FF";
	canvas.font = "12px Arial";
	canvas.textAlign = "center"
	let mid = start + (end-start)/2;
	canvas.fillText(this.archID, mid, height);
	canvas.fillStyle = "#00BB00";
	canvas.fillText(this.site.siteID, mid, height+15);
	canvas.fillStyle = "#FF0000";
}
Arch.prototype.draw = function(line, xCorr, yCorr, arches, canvas) //Vor
{
	if(!arches) return;
	if(this.site.y == line)
		line = nextFloat(line);

	let tupX = this.site.getZeroX(line);
	let midY = this.site.getMidY(line);

	let cpx = 2 * this.site.x - tupX[0]/2 - tupX[1]/2;
	let cpy = 2 * midY;

	canvas.strokeStyle = "rgba(0,0,0,0.3)";

	canvas.beginPath();
	canvas.moveTo(xCorr(tupX[0]), yCorr(0));
	canvas.quadraticCurveTo(xCorr(cpx), yCorr(cpy), xCorr(tupX[1]), yCorr(0));
	canvas.stroke();

}

//TODO: Merge concepts of lines and edges.
Line.prototype.getX = function (y) //Vor
{
	return (y-this.offset)/this.slope;
}
Line.prototype.getY = function (x) //Vor
{
	return this.offset+this.slope*x;
}

Site.prototype.getZeroX = function(line) //Vor
{
	if(this.y == line)
	line = nextFloat(line);
	a = this.x;
	b = this.y;
	l = line;
	squarePart = Math.sqrt((4*Math.pow(a,2))/Math.pow(2*b - 2*l,2) - (4*(Math.pow(a,2)/(2*b - 2*l) + Math.pow(b,2)/(2*b - 2*l) -Math.pow(l,2)/(2*b - 2*l)))/(2*b - 2*l));
	posX = (1/2)*(2*b - 2*l)*((2*a)/(2*b - 2*l) + squarePart);
	negX = (1/2)*(2*b - 2*l)*((2*a)/(2*b - 2*l) - squarePart);

	return [negX, posX];
}
Site.prototype.getMidY = function (line) //Vor
{
	if(this.y == line)
	line = nextFloat(line);
	a = this.x;
	b = this.y;
	x = a;
	l = line;

	return (1/(2*(b-l)))*(Math.pow(x,2)-2*a*x+Math.pow(a,2)+Math.pow(b,2)-Math.pow(l,2));
}
Site.prototype.getY = function (line, x) //Vor
{
	if(this.y == line)
	line = nextFloat(line);
	let a = this.x;
	let b = this.y;
	let l = line;

	return (1/(2*(b-l)))*(Math.pow(x,2)-2*a*x+Math.pow(a,2)+Math.pow(b,2)-Math.pow(l,2));
}

function findArchIntersect(leftSite, rightSite, line, log) //Vor
{
	if(log) console.log("arch intersecet param ", leftSite, rightSite, line)
	if(leftSite.y == line || rightSite.y == line)
	{
		if(log) console.log("line on site. Increment");
		line = nextFloat(line);
	}
	if(line < leftSite.y || line < rightSite.y)
	{
		console.error("Line is smaller than both sites!");
		line = nextFloat((rightSite.y>leftSite.y? rightSite.y:leftSite.y));
	}
	let a = leftSite.x;
	let b = leftSite.y;
	let c = rightSite.x;
	let d = rightSite.y;
	let l = line;

	if(b == d)
	{
		console.log("B and D same.")
		d = nextFloat(d);
	}

	if(log) console.log(a,b,c,d,l);
	let squarePart = Math.sqrt(Math.pow((2*c)/(2*d - 2*l) - (2*a)/(2*b - 2*l), 2) - 4*(1/(2*b - 2*l) - 1/(2*d - 2*l)) * (Math.pow(a,2)/(2*b - 2*l) + Math.pow(b,2)/(2*b - 2*l) - Math.pow(l, 2)/(2*b - 2*l) - Math.pow(c, 2)/(2*d - 2*l) - Math.pow(d, 2)/(2*d - 2*l) + Math.pow(l, 2)/(2*d - 2*l)));
	let posX = (squarePart + (2*a)/(2*b - 2*l) - (2*c)/(2*d - 2*l))/(2*(1/(2*b - 2*l) - 1/(2*d - 2*l)));
	let negX = (-squarePart + (2*a)/(2*b - 2*l) - (2*c)/(2*d - 2*l))/(2*(1/(2*b - 2*l) - 1/(2*d - 2*l)));
	if(log) console.log(squarePart, posX, negX);
	return[negX, posX];
	// Wolfram code
	// Solve[(a^2 + b^2 - l^2 - 2 a x + x^2)/(2 b - 2 l) == (c^2 + d^2 - l^2 - 2 c x + x^2)/(2 d - 2 l), x]

}

function findLine(leftSite, rightSite) //Vor
{
	let bigY = (leftSite.y > rightSite.y? leftSite.y : rightSite.y);
	let p1X = findArchIntersect(leftSite, rightSite, bigY+1)[myIntersect];
	let p2X = findArchIntersect(leftSite, rightSite, bigY+2)[myIntersect];

	let p1Y = leftSite.getY(bigY+1, p1X);
	let p2Y = leftSite.getY(bigY+2, p2X);

	if(p2X == p1X)
	{
		throw "Vertical line. Undefined!"
	}

	let slope = (p2Y-p1Y)/(p2X-p1X);
	let offset = p1Y - slope*p1X;

	return new Line(offset, slope);
}

function findLineIntersect(leftSite, midSite, rightSite, log = false) //Vor
{
	let tryLog = function() {if(log) console.log.apply(console, arguments)}
	tryLog("ID's %d %d %d", leftSite.siteID, midSite.siteID, rightSite.siteID);
	tryLog("(%f, %f) (%f, %f) (%f, %f)", leftSite.x, leftSite.y, midSite.x, midSite.y, rightSite.x, rightSite.y)

	let v1 = [midSite.x - leftSite.x, midSite.y - leftSite.y];
	let v2 = [rightSite.x - midSite.x, rightSite.y - midSite.y];

	if((rightSite.x == midSite.x) && rightSite.y == midSite.y)
	console.log("the same!");
	else tryLog("not same");

	tryLog("v1 (%f, %f) v2 (%f, %f)", v1[0], v1[1], v2[0], v2[1]);

	let det = v1[0]*v2[1] - v1[1]*v2[0];

	if(det <= 0)
	{
		tryLog("Cross is zero or less. Points are on a line or diverging")
		return null; //Not right turn, not converging
	}

	let leftLine = findLine(leftSite, midSite);
	let rightLine = findLine(midSite, rightSite);

	let meetingX = (rightLine.offset - leftLine.offset)/(leftLine.slope - rightLine.slope);
	let meetingY = leftLine.getY(meetingX);

	return [meetingX, meetingY];
}

function detectCircleEvent(leftArch, midArch, rightArch, log = false) //Vor
{
	let meeting = findLineIntersect(leftArch.site, midArch.site, rightArch.site, log);
	if (meeting != null)
	{
		let pointToEvent = [meeting[0]-midArch.site.x, meeting[1]-midArch.site.y];
		let pteMag = Math.sqrt(Math.pow(pointToEvent[0],2)+Math.pow(pointToEvent[1],2));
		let event = new CircleEvent(meeting[0], meeting[1]+pteMag, meeting[1], midArch);
		return event;
	}
	else return null;
}

function splitArch(oldArch, newSite, farRightBP, tree) //Vor
{
	let log = false;
	let tryLog = function(text)
	{
		if(log)
		console.log(text);
	}

	if(oldArch.circleEvent != null)
	{
		oldArch.circleEvent.falseAlarm = true;
		oldArch.circleEvent = null;
	}
	let e1 = new Edge(null, null);
	let e2 = new Edge(null, e1);
	e1.twin = e2;

	let leftArch = oldArch;
	let midArch = new Arch(newSite, tree);
	let rightArch = new Arch(oldArch.site, tree);
	if(farRightBP)
	farRightBP.tuple[0] = rightArch;

	rightArch.before = midArch;
	rightArch.after = leftArch.after;
	if(rightArch.after != null)
	rightArch.after.before = rightArch;

	midArch.before = leftArch;
	midArch.after = rightArch;

	leftArch.after = midArch;

	//detect circleEvent
	let farLeftArch = leftArch.before;
	let farRightArch = rightArch.after;

	if(farLeftArch != null)
	{
		let event = detectCircleEvent(farLeftArch, leftArch, midArch, log);
		if(event != null)
		{
			leftArch.circleEvent = event;
			tree.queue.queue(event);
			tryLog("Left circle on add");
		}
		else tryLog("No left circle")
	} else tryLog("No farLeft");
	if(farRightArch != null)
	{
		let event = detectCircleEvent(midArch, rightArch, farRightArch, log);
		if(event != null)
		{
			rightArch.circleEvent = event;
			tree.queue.queue(event);
			tryLog("right circle on add");
		}
		else tryLog("No right circle")
	} else tryLog("No far right");

	let leftBP = new Breakpoint(leftArch, midArch, leftArch, null, false, e2, tree);
	let rightBP = new Breakpoint(midArch, rightArch, midArch, rightArch, true, e1, tree);
	leftBP.rightChild = rightBP;
	leftBP.rightHeight = 2;

	return leftBP;
}

Edge.prototype.getX = function(y) //Vor
{
	let dX = this.twin.origin.x - this.origin.x;
	let dY = this.twin.origin.y - this.origin.y;
	if(dX == 0) return this.origin.x; //Vertical line
	let k = dY/dX;
	//if (k == 0) throw "Horizontal line. Not supported atm"
	let m = this.origin.y - k * this.origin.x;
	return (y-m)/k;
}
Edge.prototype.intersect = function(otherEdge) //Vor
{
	if(otherEdge == null)
		return null;

	let a = this.origin.x;
	let b = this.origin.y;
	let c = this.twin.origin.x;
	let d = this.twin.origin.y;

	let p = otherEdge.origin.x;
	let q = otherEdge.origin.y;
	let r = otherEdge.twin.origin.x;
	let s = otherEdge.twin.origin.y;

	var det, gamma, lambda;
	det = (c - a) * (s - q) - (r - p) * (d - b);
	if (det === 0) {
		return null;
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		if ((0 < lambda && lambda < 1) && (0 < gamma && gamma < 1))
		{
			let x = a + lambda*(c-a);
			let y = b + lambda*(d-b);
			return [x,y];
		}
		return null;
	}

}
Edge.prototype.draw = function(xCorr, yCorr, col, canvas) //Vor
{
	if(this.origin && this.twin.origin)
	{
		canvas.strokeStyle = col;
		canvas.beginPath();
		canvas.moveTo(xCorr(this.origin.x), yCorr(this.origin.y));
		canvas.lineTo(xCorr(this.twin.origin.x), yCorr(this.twin.origin.y));
		canvas.stroke();
	}
}
export function voronoi(sites, draw, step, xCorr, yCorr, minY, maxY, c1, c2) // vor
{
	var queue = new PriorityQueue({ initialValues: sites, comparator: compareEvents });
	let start = null;
	let tree = new BeachTree(queue);
	let totTime = 10000;
	let line = minY;
	let siteID = 1;

	let firstEvent = queue.dequeue();
	if(firstEvent.y == queue.peek().y)
		firstEvent.y = prevFloat(firstEvent.y);
	queue.queue(firstEvent);

	let newDraw = function (timestep)
	{
		if(!start)
		{
			start = timestep;
			}
		let shouldStep = true;
		while(queue.length > 0 && ((queue.peek().y <= line && !step) || (step && shouldStep)))
		{
			let event = queue.dequeue();
			if(step)
			{
				line = event.y;
			}
			if(event instanceof Site)
			{
				event.siteID = siteID++;
				tree.addSite(event);

				tree.print(c2);
			}
			else if(!event.falseAlarm)
			{
				tree.processCircle(event);

				tree.print(c2);
			}
			else
			{
				continue;
			}
			shouldStep = false;
		}
		if(step && shouldStep)
		{
			line = maxY
		}

		clearCanvas(c1);
		for(let point of sites)
		{
			c1.fillStyle = "#000000";
			c1.beginPath();
			c1.arc(xCorr(point.x), yCorr(point.y), dotSize, 0, 2 * Math.PI, false);
			c1.fill();
		}

		tree.draw(line, xCorr, yCorr, false, c1);

		c1.strokeStyle = "#ff0000";
		c1.beginPath();
		c1.moveTo(0, yCorr(line));
		c1.lineTo(c1.width, yCorr(line));
		c1.stroke();

		if(draw){
			let timeDiff = timestep - start;
			line = minY + (maxY-minY) * (timeDiff/totTime)
			if(timeDiff < totTime)
			{
				window.requestAnimationFrame(newDraw);
			}
			else if(queue.length > 0)
			{
				line = queue.peek().y;
				window.requestAnimationFrame(newDraw);
			}
		}
	};
	if(draw)
		window.requestAnimationFrame(newDraw);
	else if(step)
	{
		newDraw();
		return newDraw;
	}
	else
	{
		while(queue.length > 0)
		{
			let event = queue.dequeue();
			if(event instanceof Site)
				tree.addSite(event);
			else if(!event.falseAlarm)
			{
				tree.processCircle(event);
				//vertices.push([event.x, event.eventY]);  //Relic???
			}
		}
		let nullTwin = 0;
		let nullSelf = 0;
		let nullBoth = 0;
		for (let edge of tree.edges)
		{
			if(edge.origin == null)
				nullSelf++;
			if(edge.twin.origin == null)
				nullTwin++;
			if((edge.origin == null) && (edge.twin.origin == null))
				nullBoth++;
		}
		tree.closeEdges();
		return [tree.vertices, tree.edges];
	}
}
