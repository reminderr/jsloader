/**
 * @description Javascript asynchronous class loader
 * @version 1.0
 * @author Macolic Sven <macolic.sven@gmail.com>
 *
 * @license 
 * Copyright (c) 2018 Macolic Sven
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

class jsloader {
	
	/**
	 * @description Class constructor
	 * @returns void
	 */
	constructor() {
		this._include = new Map
		window.onload = e => {
			let classPath = document.querySelector('[load]').getAttribute('load')
			this.load([classPath]).then(run => {
				new run[jsloader.getClassName(classPath)]
			})
		}
	}

	/**
	 * @description Class collection setter
	 * @param {object} _class - Class to register
	 * @returns void
	 */
	set include(_class) {
		this._include.set(_class.name, _class)
	}

	/**
	 * @description Class collection getter
	 * @returns Class collection object
	 */
	get include() {
		return this._include
	}

	/**
	 * @description Create class emulation and load files
	 * @param {string} className - Object name
	 * @param {string} classProto - Object prototype
	 * @param {array} classes - Classes relative paths
	 * @param {function} fn - Function containing class
	 * @returns void
	 */
	preload(className, classProto, classes, fn) {
		let _class = {}
		if(this.include.has(className)) {
    			_class = this.include.get(className)
		} else {
			jsloader.define(_class, 'name', className)
		}
		jsloader.define(_class, classProto, () => {
			return this.load(classes).then(fn)
		})
		this.include = _class
	}

	/**
	 * @description Load files
	 * @param {array} classPaths - Class path collection
	 * @returns Promise
	 */
	load(classPaths) {
		return new Promise(resolve => {
			let collection = []
			let loadCls = classPaths => {
				if(classPaths.length) {
					let clsName = classPaths.shift() 
					let cls = jsloader.getClassName(clsName)
					if(this.include.has(cls)) {
						collection[cls] = this.include.get(cls)
						classPaths.length == 0 && resolve(collection)
						loadCls(classPaths)
					} else {
						let script = document.createElement('SCRIPT')
						script.setAttribute('src', clsName+'.js')
						script.onload = e => {
							collection[cls] = this.include.get(cls)
							classPaths.length == 0 && resolve(collection)
							loadCls(classPaths)
						}
						script.onerror = e => console.log(`Filename ${clsName}.js does not exist!`)
	        				document.querySelector('HEAD').insertAdjacentElement('beforeend', script)
					}
				}
			}
			loadCls(classPaths)
		})
	}

	/**
	 * @description Define object property
	 * @param {object} obj - Object to set property to
	 * @param {string} prop - Property name
	 * @param {mixed} val - Property value
	 * @returns void
	 */
    	static define(obj, prop, val) {
		Object.defineProperty(obj, prop, {
			value: val
		})
	}
	
	/**
	 * @description Get class name from relative path
	 * @param {string} classPath - Relative path to parse
	 * @returns string
	 */
	static getClassName(classPath) {
		return classPath.match(/^.*\/(.*)$/)[1]
	}

}

jsloader.define(window, document.querySelector('[load]').getAttribute('instance'), new jsloader)




