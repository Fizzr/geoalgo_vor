import {nextFloat} from "./floatOps.mjs"

export function Arch(site, tree) // Vor
{
	this.site = site;
	this.circleEvent = null;
	this.before = null;
	this.after = null;
	this.archID = tree.archID++;
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
Arch.prototype.draw = function(line, xCorr, yCorr, drawArches, canvas) //Vor
{
	if(!drawArches) return;
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
