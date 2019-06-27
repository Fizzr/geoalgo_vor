import {Edge} from "./edge.mjs"
import {Line} from "./line.mjs"
import {Arch} from "./arch.mjs"
import {CircleEvent} from "./circleEvent.mjs"
import {Breakpoint} from "./breakpoint.mjs"
import {nextFloat} from "./floatOps.mjs"

//Grabbing the "negative" X value will always give the appropriate sided X. Since the sites have a specified ordered in the tuple and the equation flipped upside down if sites are flipped.
const myIntersect = 0; // Vor

export function splitArch(oldArch, newSite, farRightBP, tree) //Vor
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

export function findArchIntersect(leftSite, rightSite, line, log) //Vor
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


export function detectCircleEvent(leftArch, midArch, rightArch, log = false) //Vor
{
	let meeting = findLineIntersect(leftArch.site, midArch.site, rightArch.site, log);
	if (meeting == null)
	{
		return null;
	}
	let pointToEvent = [meeting[0]-midArch.site.x, meeting[1]-midArch.site.y];
	let pteMag = Math.sqrt(Math.pow(pointToEvent[0],2)+Math.pow(pointToEvent[1],2));
	let event = new CircleEvent(meeting[0], meeting[1]+pteMag, meeting[1], midArch);
	return event;
}
