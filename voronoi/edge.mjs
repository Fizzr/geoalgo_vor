export function Edge (origin, twin) //Vor Overworld
{
	this.origin = origin;
	this.twin = twin;
	this.next = null;
	this.prev = null;
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
