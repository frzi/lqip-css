import { packColor11Bit, packColor10Bit } from './color.js'

const startViewTransition = (fn) => {
	if (document.startViewTransition) {
		document.startViewTransition(fn)
	}
	else {
		fn()
	}
}

addEventListener('DOMContentLoaded', () => {
	const imagesElement = document.querySelector('.images')
	const images = Array.from(imagesElement.querySelectorAll('img'))

	for (const image of images) {
		image.remove()
		const demo = new ImageDemo(image)
		imagesElement.append(demo.element)
	}

	// Select image(s)
	const selectInput = document.getElementById('select-images')
	selectInput.addEventListener('change', (event) => {
		const files = event.target.files

		startViewTransition(() => {
			for (const file of files) {
				const image = new Image()
				image.src = URL.createObjectURL(file)
				const demo = new ImageDemo(image)
				imagesElement.insertBefore(demo.element, imagesElement.firstChild)
			}
		})
	})

	const selectButton = document.getElementById('select-images-button')
	selectButton.addEventListener('click', () => selectInput.showPicker())

	// Toggle colors preview.
	const toggleColorsButton = document.getElementById('toggle-colors')
	toggleColorsButton.addEventListener('click', () => {
		startViewTransition(() => {
			document.body.classList.toggle('show-colors')
		})
	})
})

class ImageDemo {
	static {
		this.templateElement = document.getElementById('demo-template')
	}

	constructor(image) {
		this.image = image

		this.element = this.constructor.templateElement.content.cloneNode(true).children[0]
		this.element.id = 'image-' + crypto.randomUUID()

		// Give the new image its new home.
		this.element.querySelector('.image').append(this.image)

		// Prepare the canvas.
		const canvas = document.createElement('canvas')
		canvas.width = canvas.height = 3
		this.context = canvas.getContext('2d')
		this.element.querySelector('.resized').append(canvas)

		// Prepare the preview.
		this.preview = this.image.cloneNode(true)
		this.element.querySelector('.preview').append(this.preview)

		// Load the image.
		this.image.addEventListener('load', () => this.render())
	}

	async render() {
		const bitmap = await createImageBitmap(this.image, {
			resizeHeight: this.context.canvas.height,
			resizeQuality: 'low', // Try this with low.
			resizeWidth: this.context.canvas.width,
		})

		this.context.drawImage(bitmap, 0, 0, this.context.canvas.width, this.context.canvas.height)

		bitmap.close()

		// Get the colors and pack them into a 32-bit value.
		const imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height)
		const pixels = []

		for (let a = 0; a < imageData.data.length; a += 4) {
			pixels.push({
				r: imageData.data[a],
				g: imageData.data[a + 1],
				b: imageData.data[a + 2],
			})
		}

		const [c0, c1, c2] = [pixels[0], pixels[4], pixels[8]]

		const pc0 = packColor11Bit(c0)
		const pc1 = packColor11Bit(c1)
		const pc2 = packColor10Bit(c2)
		const combined = (BigInt(pc0) << 21n) | (BigInt(pc1) << 10n) | BigInt(pc2)
		const hex = `#${combined.toString(16).padStart(8, '0')}`

		this.preview.style.setProperty('--lqip', hex)
		this.element.querySelector('.packed-colors').style.setProperty('--lqip', hex)

		this.element.querySelector('code').textContent = hex
	}
}