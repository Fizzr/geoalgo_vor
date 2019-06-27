import {nextFloat} from "./floatOps.mjs"

export function Site(x, y) //Vor
{
	this.x = x;
	this.y = y;
	this.siteID = 0
}

Site.prototype.getZeroX = function(line) //Vor
{
	if(this.y == line)
		line = nextFloat(line);
	let a = this.x;
	let b = this.y;
	let l = line;
	let squarePart = Math.sqrt((4*Math.pow(a,2))/Math.pow(2*b - 2*l,2) - (4*(Math.pow(a,2)/(2*b - 2*l) + Math.pow(b,2)/(2*b - 2*l) -Math.pow(l,2)/(2*b - 2*l)))/(2*b - 2*l));
	let posX = (1/2)*(2*b - 2*l)*((2*a)/(2*b - 2*l) + squarePart);
	let negX = (1/2)*(2*b - 2*l)*((2*a)/(2*b - 2*l) - squarePart);

	return [negX, posX];
}
Site.prototype.getMidY = function (line) //Vor
{
	if(this.y == line)
		line = nextFloat(line);
	let a = this.x;
	let b = this.y;
	let x = a;
	let l = line;

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
