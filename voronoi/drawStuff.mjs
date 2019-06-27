export const dotSize = 3;
export function clearCanvas(context) //Over vor lin
{
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
}
