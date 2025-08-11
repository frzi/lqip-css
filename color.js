export function packColor11Bit(c) {
	const r = Math.round((c.r / 0xFF) * 0b1111)
	const g = Math.round((c.g / 0xFF) * 0b1111)
	const b = Math.round((c.b / 0xFF) * 0b111)
	const packed = (r << 7) | (g << 3) | b
	return packed
}

export function packColor10Bit(c) {
	const r = Math.round((c.r / 0xFF) * 0b111)
	const g = Math.round((c.g / 0xFF) * 0b1111)
	const b = Math.round((c.b / 0xFF) * 0b111)
	const packed = (r << 7) | (g << 3) | b
	return packed
}

export function unpackColor11Bit(packed) {
	const r = (packed >> 7) & 0b1111
	const g = (packed >> 3) & 0b1111
	const b = packed & 0b111
	return {
		r: Math.ceil((r / 0b1111) * 0xFF),
		g: Math.ceil((g / 0b1111) * 0xFF),
		b: Math.ceil((b / 0b111) * 0xFF),
	}
}

export function unpackColor10Bit(packed) {
	const r = (packed >> 7) & 0b111
	const g = (packed >> 3) & 0b1111
	const b = packed & 0b111
	return {
		r: Math.ceil((r / 0b111) * 0xFF),
		g: Math.ceil((g / 0b1111) * 0xFF),
		b: Math.ceil((b / 0b111) * 0xFF),
	}
}