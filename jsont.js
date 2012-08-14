(function(window, undefined) {
	var helpers = {
		isString: function(obj) {
			return toString.call(obj) == '[object String]';
		},

		isObject: function(obj) {
			return obj === Object(obj);
		},

		isArray: function(obj) {
			return Array.isArray(obj) || toString.call(obj) == '[object Array]';
		},

		isElement: function(obj) {
			return obj instanceof HTMLElement;
		}
	};

	window.jsont = function(json, wrapper) {
		if (arguments.length === 0)
			throw "Invalid number of parameters.";

		if (helpers.isString(json) === true) {
			json = JSON.parse(json);
		} else if (!(helpers.isObject(json) || helpers.isArray(json))) {
			throw "Improper json entered.";
		}

		if (typeof wrapper === "undefined") {
			wrapper = document.createElement('div');
		} else if (helpers.isString(wrapper)) {
			wrapper = document.querySelector(wrapper);
		} else if (!helpers.isElement(wrapper)) {
			throw "Improper wrapper supplied."
		}

		return jsontemplate.init(json, wrapper);
	};

	var jsontemplate = {
		init: function(json, wrapper) {
			this.wrapper = wrapper;

			return this.buildDOM(json, wrapper);
		},

		buildDOM: function(json, wrapper) {
			var self = this;
			this.iterate(json, function(selector, properties) {
				var element = self.constructElement(selector, properties);
				wrapper.appendChild(element);
			});
		},

		iterate: function(json, callback) {
			if (helpers.isArray(json)) {
				var selector;
				for (var i=0, l=json.length; i<l; i++) {
					selector = json[i].selector;
					delete json[i].selector;

					if (typeof selector === "undefined")
						throw "No selector defined for " + json.toString();
					callback(selector, json[i]);
				}
			} else if (helpers.isObject(json)) {
				for (var prop in json) {
					callback(prop, json[prop]);
				}
			}
		},

		constructElement: function(selector, properties) {
			var element = this.parseSelector(selector);
			this.setAttributes(element, properties.attr);
			this.fillHTML(element, properties);

			return element;
		},

		parseSelector: function(selector) {
			var comps = selector.split(/(#|\.)/);

			var temp_comps = [];
			for (var i=0, l=comps.length; i<l; i++) {
				if (comps[i]) {
					temp_comps.push(comps[i]);
				}
			}
			comps = temp_comps;

			var comp, tag, element;
			while (comps.length > 0) {
				var comp = comps.shift();

				if (typeof element === "undefined") {
					tag = comp;
					if (tag === "#" || tag === ".") {
						tag = 'div';
					}

					element = document.createElement(tag);
				}

				if (comp === "#") {
					comp = comps.shift();
					element.id = comp;
				} else if (comp === ".") {
					comp = comps.shift();
					element.className += element.className + comp + " ";
				}
			}

			return element;
		},

		setAttributes: function(element, attributes) {
			if (helpers.isString(attributes)) {
				var attrs = attributes.split(/\s*,\s*/);

				var comps;
				while (attrs.length > 0) {
					comps = attrs.shift().split("=");
					element.setAttribute(comps[0], comps[1].replace('"', ""));
				}
			} else {
				for (var prop in attributes) {
					element.setAttribute(prop, attributes[prop]);
				}
			}
		},

		fillHTML: function(element, properties) {
			if (helpers.isString(properties) || helpers.isString(properties.html)) {
				element.innerHTML = helpers.isString(properties) ? properties : properties.html;
			} else if (helpers.isArray(properties)) {
				this.buildDOM(properties, element);
			} else {
				this.buildDOM(properties.html, element);
			}
		}
	};

}(window));