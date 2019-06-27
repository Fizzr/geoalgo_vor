import {BeachTree} from "./beachTree.mjs"
import {Site} from "./site.mjs"
import {Arch} from "./arch.mjs"
import {Edge} from "./edge.mjs"
import {clearCanvas, dotSize} from "./drawStuff.mjs"

//Grabbing the "negative" X value will always give the appropriate sided X. Since the sites have a specified ordered in the tuple and the equation flipped upside down if sites are flipped.
const myIntersect = 0; // Vor


function compareEvents(a, b) //Vor Lin
{
	if(a.y === b.y ) return a.x - b.x
	return a.y - b.y;
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
		clearCanvas(c1);
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
			}
			else if(!event.falseAlarm)
			{
				if(step && true) //Draw circle event
				{
					c1.strokeStyle = "#0000FF";
					c1.beginPath();
					c1.arc(xCorr(event.x), yCorr(event.eventY), yCorr(event.y) - yCorr(event.eventY), 0, 2 * Math.PI, false);
					c1.stroke();
				}
				tree.processCircle(event);
			}
			else
			{
				continue;
			}
			tree.print(c2);
			shouldStep = false;
		}
		if(step && shouldStep)
		{
			line = maxY
		}

		for(let point of sites)
		{
			c1.fillStyle = "#000000";
			c1.beginPath();
			c1.arc(xCorr(point.x), yCorr(point.y), dotSize, 0, 2 * Math.PI, false);
			c1.fill();
		}

		tree.draw(line, xCorr, yCorr, true, c1);

		c1.strokeStyle = "#ff0000";
		c1.beginPath();
		c1.moveTo(0, yCorr(line));
		c1.lineTo(c1.canvas.clientWidth, yCorr(line));
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
