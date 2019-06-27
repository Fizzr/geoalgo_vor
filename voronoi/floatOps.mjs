//From internet
function floatToBits(f) //Vor
{
	var buf = new ArrayBuffer(4);
	(new Float32Array(buf))[0] = f;
	return (new Uint32Array(buf))[0];
}
function bitsToFloat(b) //Vor
{
	var buf = new ArrayBuffer(4);
	(new Uint32Array(buf))[0] = b;
	return (new Float32Array(buf))[0];
}
export function nextFloat(f)  //Vor
{
	// Note that this moves away from 0.0
	// It will fail at +/- infinity and result in an NaN
	var bitRepr = floatToBits(f);
	bitRepr++;
	return bitsToFloat(bitRepr);
}
export function prevFloat(f)//Vor
{
	// Note that this moves towards 0.0
	// This will fail at 0.0 and result in an NaN
	var bitRepr = floatToBits(f);
	bitRepr--;
	return bitsToFloat(bitRepr);
}
