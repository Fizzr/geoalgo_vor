const dotSize = 3;

function clearCanvas(context) //Over vor lin
{
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
}
function compareEvents(a, b) //Vor Lin
{
	if(a.y === b.y ) return a.x - b.x
	return a.y - b.y;
}

function VertexEvent(vertex, group) //Lin
{
	this.x = vertex.x;
	this.y = vertex.y;
	this.vertex = vertex;
	this.group = group;
}

function IntersectEvent(x, y, leftLeaf, rightLeaf) //Lin
{
	this.x = x;
	this.y = y;
	this.leftLeaf = leftLeaf;
	this.rightLeaf = rightLeaf;
}

function IntersectTree(queue) //Lin
{
	this.root = null;
	this.queue = queue;
	this.leafID = 1;
	this.nodeID = 1;
}

function IntersectNode(leftLeaf, rightLeaf, tree, ID, parent) //Lin
{
	this.rightInLeft = leftLeaf;
	this.tree = tree;
	this.leftChild = leftLeaf;
	this.rightChild = rightLeaf;
	this.ID = ID;
	this.parent = parent;
	this.rightHeight = 1;
	this.leftHeight = 1;
}

function IntersectLeaf(edge, group, tree, ID) //Lin
{
	this.edge = edge;
	this.before = null;
	this.after = null;
	this.group = group;
	this.tree = tree;
	this.parent = null;
	this.ID = ID;
	this.removed = false;
}
IntersectLeaf.prototype.split = function(edge, group) //Lin
{
	let newLeaf = new IntersectLeaf(edge, group, this.tree, this.tree.leafID++);
	//console.log("Created %d", newLeaf.ID);
	let leftLeaf = null;
	let midLeaf = newLeaf;
	let rightLeaf = null;
	let newNode = null;
	let sameOriginNewRight = false;
	let sameOrigin = edge.origin == this.edge.origin;
	if(sameOrigin)
	{
		//console.log("Same origin")
		let newXSlope = (edge.twin.origin.x - edge.origin.x) / (edge.twin.origin.y - edge.origin.y);
		let oldXSlope = (this.edge.twin.origin.x - this.edge.origin.x) / (this.edge.twin.origin.y - this.edge.origin.y);
		sameOriginNewRight = newXSlope > oldXSlope;
		//console.log("newXSlope %f oldXSlope %f. New on right? %s", newXSlope, oldXSlope, sameOriginNewRight);
	}

	if(((edge.origin.x > this.edge.getX(edge.origin.y)) && !sameOrigin) || sameOriginNewRight)
	{
		//console.log("New on right");
		leftLeaf = this;
		midLeaf.after = leftLeaf.after;
		midLeaf.before = leftLeaf;
		leftLeaf.after = midLeaf;
		rightLeaf = midLeaf.after;
		if(rightLeaf) rightLeaf.before = midLeaf;
		newNode = new IntersectNode(leftLeaf, midLeaf, this.tree, this.tree.nodeID++, this.parent);
		midLeaf.parent = newNode;
		leftLeaf.parent = newNode;
	}
	else
	{
		//console.log("New on left");
		rightLeaf = this;
		midLeaf.before = rightLeaf.before;
		midLeaf.after = rightLeaf;
		rightLeaf.before = midLeaf;
		leftLeaf = midLeaf.before;
		if(leftLeaf) leftLeaf.after = midLeaf;
		newNode = new IntersectNode(midLeaf, rightLeaf, this.tree, this.tree.nodeID++, this.parent);
		midLeaf.parent = newNode;
		rightLeaf.parent = newNode;
	}

	let leftIntersection = (leftLeaf ? midLeaf.edge.intersect(leftLeaf.edge) : null);
	let rightIntersection = (rightLeaf ? midLeaf.edge.intersect(rightLeaf.edge) : null);

	if(leftIntersection)
	{
		//console.log("left intersect involving %d and %d", leftLeaf.ID, midLeaf.ID);
		let event = new IntersectEvent(leftIntersection[0], leftIntersection[1], leftLeaf, midLeaf);
		this.tree.queue.queue(event);
	}
	if(rightIntersection)
	{
		//console.log("right intersect involving %d and %d", midLeaf.ID, rightLeaf.ID);
		let event = new IntersectEvent(rightIntersection[0], rightIntersection[1], midLeaf, rightLeaf);
		this.tree.queue.queue(event);
	}
	return newNode;
}
IntersectLeaf.prototype.print = function(start, end, height, y, canvas) //Lin
{
	canvas.fillStyle = "#0000FF";
	canvas.font = "12px Arial";
	canvas.textAlign = "center"
	let mid = start + (end-start)/2;
	canvas.fillText(this.ID, mid, height);
	canvas.fillStyle = "#00BB00";
	canvas.fillText(this.edge.getX(y).toFixed(2), mid, height+15);
	canvas.fillStyle = "#000000";
	canvas.fillText((this.before ? this.before.ID : "null") + " | " + (this.after ? this.after.ID : "null"), mid, height+30);

}
IntersectLeaf.prototype.getBiggestHeight = function() //Lin
{
	return 0;
}
IntersectLeaf.prototype.draw = function(xCorr, yCorr, canvas) //Lin
{
	let dx = this.edge.twin.origin.x - this.edge.origin.x;
	let dy = this.edge.twin.origin.y - this.edge.origin.y;
	canvas.fillStyle = "#000000"
	canvas.font = "12px Arial";
	canvas.fillText(this.ID, xCorr(this.edge.origin.x + dx/2), yCorr(this.edge.origin.y + dy/2));
}

IntersectNode.prototype.getBiggestHeight = function() //Lin
{
	return (this.rightHeight > this.leftHeight ? this.rightHeight : this.leftHeight);
}
IntersectNode.prototype.removeEdge = function(edge) //Lin
{
	//console.log("Searching remove through %d", this.ID);
	if((this.leftChild instanceof IntersectLeaf) && (this.leftChild.edge.twin.origin == edge.twin.origin))
	{
		//console.log("found in left child ID %d", this.leftChild.ID);
		this.leftChild.removed = true;
		let left = this.leftChild.before;
		let right = this.leftChild.after;
		if(left) left.after = right;
		if(right)right.before = left;
		if(left && right)
		{
			let intersect = right.edge.intersect(left.edge);
			if(intersect)
			{
				//console.log("New intersect")
				this.tree.queue.queue(new IntersectEvent(intersect[0], intersect[1], left, right));
			}
		}
		return this.rightChild;
	}
	else if ((this.rightChild instanceof IntersectLeaf) && (this.rightChild.edge.twin.origin == edge.twin.origin))
	{
		//console.log("found in right child, ID %d", this.rightChild.ID);
		this.rightChild.removed = true;
		let left = this.rightChild.before;
		let right = this.rightChild.after;
		if(left) left.after = right;
		if(right)right.before = left;
		if((left != null) && (right != null))
		{
			//console.log(left, right);
			let intersect = right.edge.intersect(left.edge);
			if(intersect)
			{
				//console.log("New intersect")
				this.tree.queue.queue(new IntersectEvent(intersect[0], intersect[1], left, right));
			}
		}
		return this.leftChild;
	}
	else
	{
		if((this.rightInLeft.edge.twin.origin == edge.twin.origin) || (this.rightInLeft.edge.getX(edge.twin.origin.y) > edge.twin.origin.x))
		{
			let res = this.leftChild.removeEdge(edge);
			if(res)
			{
				//console.log("replacing leftChild in %d after remove", this.ID);
				//console.log(res);
				this.leftChild = res;
				this.leftChild.parent = this;
				let leftRightest = this.leftChild;
				while(!(leftRightest instanceof IntersectLeaf))
					leftRightest = leftRightest.rightChild;
				this.rightInLeft = leftRightest;
			}
			this.leftHeight = this.leftChild.getBiggestHeight()+1;
			return null;
		}
		else
		{
			let res = this.rightChild.removeEdge(edge);
			if(res)
			{
				//console.log("replacing rightChild in %d after remove", this.ID);
				this.rightChild = res;
				this.rightChild.parent = this;
				let rightest = res;
				while(!(rightest instanceof IntersectLeaf))
					rightest = rightest.rightChild;
				propogateRightInLeft(rightest);
			}
			this.rightHeight = this.rightChild.getBiggestHeight()+1;
			return null;
		}
	}
}
IntersectNode.prototype.addEdge = function(edge, group) //Lin
{
	let sharedOrigin = edge.origin == this.rightInLeft.edge.origin;
	//console.log("%s shared origin at %d", (sharedOrigin ? "has" : "not"), this.ID);
	let goingRight = (!(sharedOrigin)) && (edge.origin.x > this.rightInLeft.edge.getX(edge.origin.y));
	let child = (goingRight ? this.rightChild : this.leftChild);
	let rightMost = null;
	if(child instanceof IntersectLeaf)
	{
		let newNode = child.split(edge, group);
		if (goingRight)
		{
			this.rightChild = newNode;
			this.rightHeight = 2;
			return newNode.rightChild;
		}
		else
		{
			this.leftChild = newNode;
			this.leftHeight = 2;
			this.rightInLeft = newNode.rightChild;
			return null;
		}
	}
	else
	{
		let res = child.addEdge(edge, group);
		if(goingRight)
		{
			this.rightHeight = this.rightChild.getBiggestHeight()+1;
			return res;
		}
		else
		{
			this.leftHeight = this.leftChild.getBiggestHeight()+1;
			if(res != null)
				this.rightInLeft = res
			return null;
		}
	}
}
IntersectNode.prototype.print = function(start, end, height, y, canvas) //Lin
{
	let stdHeightDiff = 50;
	let level = height;
	let fontSize = 12;
	let rowSize = fontSize + 3;
	let topToBotArr = 45;
	canvas.fillStyle = "#FF0000";
	canvas.font = fontSize+"px Arial";
	canvas.textAlign = "center"
	let mid = start + (end-start)/2;
	canvas.fillText(this.ID, mid, level);
	level+= rowSize;
	canvas.fillStyle = "#0000FF";
	canvas.fillText(this.rightInLeft.ID, mid, level);
	level+= rowSize;
	canvas.fillStyle = "#000000";
	canvas.fillText(this.leftHeight + " h " + this.rightHeight, mid, level);
	level+= rowSize;
	canvas.fillStyle = "#00FF00";
	canvas.fillText(this.rightInLeft.edge.getX(y).toFixed(10), mid, level);
	level+= 3;
	let ratio = this.leftHeight/(this.leftHeight+this.rightHeight);
	//let ratio = 0.5;
	let leftPartition = (end-start) * ratio;

	canvas.strokeStyle = "#000000";
	canvas.beginPath();
	canvas.moveTo(mid, level);
	canvas.lineTo(start + (leftPartition)/2, level+stdHeightDiff-rowSize);
	canvas.stroke();

	canvas.beginPath();
	canvas.moveTo(mid, level);
	canvas.lineTo(start+leftPartition + (end-(start+leftPartition))/2, level+stdHeightDiff-rowSize);
	canvas.stroke();

	this.leftChild.print(start, start+leftPartition, level+stdHeightDiff, y, canvas);
	this.rightChild.print(start+leftPartition, end, level+stdHeightDiff, y, canvas);

}
IntersectNode.prototype.draw = function(xCorr, yCorr, canvas) //Lin
{
	this.rightChild.draw(xCorr, yCorr, canvas);
	this.leftChild.draw(xCorr, yCorr, canvas);
}

function propogateRightInLeft(leaf) //Lin
{
	let curr = leaf.parent;
	let child = leaf;
	while(curr)
	{
		if(curr.rightChild == child)
		{
			child = curr;
			curr = curr.parent;
		}
		else
		{
			curr.rightInLeft = leaf;
			break;
		}
	}
}
function propogateHeight(leaf) //Lin
{
	let curr = leaf.parent;
	let child = leaf;
	while(curr)
	{
		if(curr.rightChild == child)
			curr.rightHeight = child.getBiggestHeight()+1;
		else
			curr.leftHeight = child.getBiggestHeight()+1;
		child = curr;
		curr = curr.parent;
	}
}
function cutEdge(cutLeaf) //Lin
{
	//console.log("Cutting %d", cutLeaf.ID);
	let other;
	let pa = cutLeaf.parent;
	let onRightSide = pa.rightChild == cutLeaf;
	let gran = pa.parent;
	if(onRightSide)
		other = pa.leftChild;
	else other = pa.rightChild;

	if(gran.rightChild == pa)
	gran.rightChild = other;
	else gran.leftChild = other;
	other.parent = gran;

	if(onRightSide)
	{
		let otherRight = other;
		while(!(otherRight instanceof IntersectLeaf))
			otherRight = otherRight.rightChild;

		propogateRightInLeft(otherRight);
	}
	propogateHeight(other);
	let left = cutLeaf.before;
	let right = cutLeaf.after;
	if(left != null)
	{
		//console.log("left ", left);
		left.after = right;
	}
	if(right != null)
	{
		//console.log("right", right);
		right.before = left;
	}
	cutLeaf.removed = true;
	if(left && right)
	{
		let intersect = right.edge.intersect(left.edge);
		if(intersect)
		{
			//console.log("New intersect after cut")
			right.tree.queue.queue(new IntersectEvent(intersect[0], intersect[1], left, right));
		}
	}

	let v1 = cutLeaf.edge.origin;
	let v2 = cutLeaf.edge.twin.origin;
	v1.edge = cutLeaf.edge.twin.next;
	v2.edge = cutLeaf.edge.next;

	cutLeaf.edge.prev.next = cutLeaf.edge.twin.next;
	cutLeaf.edge.next.prev = cutLeaf.edge.twin.prev;

	cutLeaf.edge.twin.prev.next = cutLeaf.edge.next;
	cutLeaf.edge.twin.next.prev = cutLeaf.edge.prev;

	cutLeaf.edge.origin = null;
	cutLeaf.edge.twin.origin = null;

}
IntersectTree.prototype.processVertex = function(vertexEvent, step, canvas) //Lin
{
	let removeEdges = [];
	let addEdges = [];
	let vert = vertexEvent.vertex;
	let currEdge = vert.edge;
	if(!currEdge) return;
	let first = true;
	while(currEdge != vert.edge || first)
	{
		first = false;
		let otherVert = currEdge.twin.origin;
		if((otherVert.y < vert.y) || ((otherVert.y == vert.y) && (otherVert.x < vert.y)))
		{
			//remove
			removeEdges.push(currEdge.twin); //The twin is pointing down.
		}
		else if((otherVert.y > vert.y) || ((otherVert.y == vert.y) && (otherVert.x > vert.y)))
		{
			//add
			addEdges.push(currEdge); //Current is pointing down.
		}
		else console.error("Duplicate vertecies")
		currEdge = currEdge.twin.next;
		if(currEdge == null)
			break;
	}
	for(let remove of removeEdges)
	{
		if(this.root == null)
		{
			throw "Tried to remove edge from empty tree"
		}
		else if(this.root instanceof IntersectLeaf)
		{
			if(this.root.edge == remove)
			{
				this.root = null;
				//console.log("Found remove in root");
			}
			else
				throw "Could not find edge for removal"
		}
		else
		{
			let res = this.root.removeEdge(remove);
			if(res) this.root = res;
		}
		if(step)
		{
			//console.log("reprint")
			this.print(vertexEvent.y, canvas);
		}
	}
	for(let add of addEdges)
	{
		if(this.root == null)
		{
			this.root = new IntersectLeaf(add, vertexEvent.group, this, this.leafID++);
			//console.log("Created %d", this.root.ID);
		}
		else if(this.root instanceof IntersectLeaf)
		{
			this.root = this.root.split(add, vertexEvent.group);
		}
		else
		{
			this.root.addEdge(add, vertexEvent.group);
		}
		if(step)
		{
			//console.log("reprint")
			this.print(vertexEvent.y, canvas);
		}

	}

}
IntersectTree.prototype.processIntersect = function(intersectEvent) //Lin
{
	if((this.root == null) || (this.root instanceof IntersectLeaf))
	{
		throw "Intresect on empty or leaf tree"
	}
	let left = intersectEvent.leftLeaf;
	let right = intersectEvent.rightLeaf;
	if(left.removed || right.removed)
	{
		//console.log("Already removed");
		return;
	}
	if((left.before == right) && (right.after == left))
	{
		//console.log("Swap already in place")
		return;
	}

	if(left.group != right.group)
	{
		if(left.group < right.group)
			cutEdge(right);
		else cutEdge(left);

	}
	else
	{

		let farLeft = left.before;
		let farRight = right.after;

		right.before = farLeft;
		left.after = farRight;
		right.after = left;
		left.before = right;

		let lpRight = left.parent.rightChild == left;
		let rpRight = right.parent.rightChild == right;

		if(lpRight) left.parent.rightChild = right
		else left.parent.leftChild = right;

		if(rpRight) right.parent.rightChild = left;
		else right.parent.rightChild = left;

		propogateRightInLeft(left);
		propogateRightInLeft(right);
		propogateHeight(left);
		propogateHeight(right);
		console.error("Check new interections!");
	}
}
IntersectTree.prototype.print = function(y, canvas) //Lin
{
	clearCanvas(canvas);
	if(this.root)
	{
		this.root.print(0, canvas.canvas.clientWidth, 50, y, canvas);
	}
}
IntersectTree.prototype.draw = function(xCorr, yCorr, canvas) //Lin
{
	if(this.root)
		this.root.draw(xCorr, yCorr, canvas);
}

export function lineIntersect(primaryGroup, secondaryGroup, draw, step, xCorr, yCorr, minY, maxY, c1, c2) // Lin
{
	var queue = new PriorityQueue({comparator: compareEvents });
	let tree = new IntersectTree(queue);
	let line = minY;
	let totTime = 10000;
	let start = null;
	let timeDiff;
	for(let vert of primaryGroup[0])
	{
		queue.queue(new VertexEvent(vert, 1));
	}
	for(let vert of secondaryGroup[0])
	{
		queue.queue(new VertexEvent(vert, 2));
	}
	let drawer = function(timestep)
	{
		if(draw)
		{
			if(!start) start = timestep;
		}
		clearCanvas(c1);

		let shouldStep = true;
		while(queue.length > 0 && ((queue.peek().y <= line && !step) || (step && shouldStep)))
		{
			event = queue.dequeue();
			if(event instanceof VertexEvent)
			{
				tree.processVertex(event, step, c2);
			}
			else
			{
				tree.processIntersect(event);
			}
			shouldStep = false;
			if(step)
			{
				tree.draw(xCorr, yCorr, c2);
				c1.fillStyle = "#000000"
				line = event.y;
				c1.beginPath();
				c1.arc(xCorr(event.x), yCorr(event.y), dotSize, 0, 2 * Math.PI, false);
				c1.fill();

			}
			tree.print(event.y, c2);
		}

		for(let edge of primaryGroup[1])
		{
			edge.draw(xCorr, yCorr, "#000000", c1);
		}
		for(let edge of secondaryGroup[1])
		{
			edge.draw(xCorr, yCorr, "#FF0000", c1);
		}

		c1.strokeStyle = "#000000";
		c1.beginPath();
		c1.moveTo(0, yCorr(line));
		c1.lineTo(c1.canvas.clientWidth, yCorr(line));
		c1.stroke();

		tree.print(line, c2);

		if(draw)
		{
			timeDiff = timestep - start;
			if((timeDiff < totTime))
			{
				line = minY + (maxY-minY) * (timeDiff/totTime)
				window.requestAnimationFrame(drawer);
			}
			else if(queue.length > 0)
			{
				line = queue.peek().y;
				window.requestAnimationFrame(drawer);
			}
			else
				console.log("done");
		}

	}
	if(draw)
		window.requestAnimationFrame(drawer);
	else if(step)
	{
		drawer();
		return drawer;
	}
	else
	{
		while(queue.length > 0)
		{
			event = queue.dequeue();
			if(event instanceof VertexEvent)
			{
				tree.processVertex(event, step, c2);
			}
			else
			{
				tree.processIntersect(event);
			}
		}
		//Cut edges still in set. Remove these.
		let cleanEdges = [];
		let cleanVertices = [];
		for(let edge of secondaryGroup[1])
		{
			if(edge.origin && edge.twin.origin)
				cleanEdges.push(edge)
		}
		for(let vert of secondaryGroup[0])
		{
			if(vert.edge)
				cleanVertices.push(vert);
		}
		return [cleanVertices, cleanEdges];
	}
}
