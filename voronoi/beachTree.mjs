import {Site} from "./site.mjs"
import {Arch} from "./arch.mjs"
import {Vertex} from "./vertex.mjs"
import {Edge} from "./edge.mjs"
import {Breakpoint} from "./breakpoint.mjs"
import {splitArch, detectCircleEvent} from "./functions.mjs"
import {clearCanvas} from "./drawStuff.mjs"
export function BeachTree(queue) //Vor
{
	this.root = null;
	this.edges = [];
	this.vertices = [];
	this.queue = queue;
	this.archID = 1;
	this.bpID = 1;
}


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
	let log = true;

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
			tryLog("BreakX %f \nEventX %f \nEventY %f", breakX, circleEvent.x, circleEvent.y);
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
		// for(let vert of this.vertices)
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
		//console.log(canvas);
		clearCanvas(canvas);

		this.root.print(0, canvas.canvas.clientWidth, 40, canvas);
	}
}
