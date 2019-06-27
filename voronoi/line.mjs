//TODO: Merge concepts of lines and edges.

export function Line(offset, slope) //Vor
{
	this.offset = offset;
	this.slope = slope;
}
Line.prototype.getX = function (y) //Vor
{
	return (y-this.offset)/this.slope;
}
Line.prototype.getY = function (x) //Vor
{
	return this.offset+this.slope*x;
}
