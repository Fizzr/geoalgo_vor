import {Arch} from "./arch.mjs"
import {nextFloat} from "./floatOps.mjs"
import {splitArch, findArchIntersect} from "./functions.mjs"
import {dotSize} from "./drawStuff.mjs"
//Grabbing the "negative" X value will always give the appropriate sided X. Since the sites have a specified ordered in the tuple and the equation flipped upside down if sites are flipped.
const myIntersect = 0; // Vor

export function Breakpoint(leftArch, rightArch, leftChild, rightChild, isRightSide, edge, tree) //Vor
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
Breakpoint.prototype.draw = function(line, xCorr, yCorr, drawArches, canvas) //Vor
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

	this.leftChild.draw(line, xCorr, yCorr, drawArches, canvas);
	this.rightChild.draw(line, xCorr, yCorr, drawArches, canvas);
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
