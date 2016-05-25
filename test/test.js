var templating = require("../index");
require("chai").should();

var model1 = {
	title: "hello world"
};
var templateOne = `<div>{{title}}</div>`


var model2 = {
	name: {
		first: "Andrew",
		last: "Petersen"
	}
}
var templateTwo = `<div>{{name.first}} {{name.last}}</div>`

describe("Shallow Object w/ string property", function() {
	it("Should render proper template", function() {
		var html = templating.renderTemplate(templateOne, model1);
		html.should.equal("<div>hello world</div>");
	})
})

describe("Nested string property", function() {
	it("Should render proper template", function() {
		var html = templating.renderTemplate(templateTwo, model2);
		html.should.equal("<div>Andrew Petersen</div>");
	});
});

describe("Template without Single Parent Element", function() {
	var template = `<span>Hi</span><br/><span>{{name.first}}</span>`;
	it("Should render proper template", function() {
		var html = templating.renderTemplate(template, model2);
		html.should.equal("<span>Hi</span><br><span>Andrew</span>")
	})
});

describe("'_' for current scope", function() {
	var template = "<div>{{_}}</div>";
	it("Should render proper template", function() {
		var html = templating.renderTemplate(template, model2.name.first);
		html.should.equal("<div>Andrew</div>");
	});
})

var model3 = {
	name: model2.name,
	skills: [{
		name: "javascript",
		level: "decent"
	}, {
		name: "c#",
		level: "novice"
	}]
}
var eachTemplate = 
'<h1>{{name.first}} {{name.last}}</h1><ul data-each="skills"><li>{[name]} - {[level]}</li></ul>'
var expected = 
'<h1>Andrew Petersen</h1><ul data-each="skills"><li>javascript - decent</li><li>c# - novice</li></ul>'

describe("data-each repeater", function() {
	it("Should render each element in array", function() {
		var html = templating.renderTemplate(eachTemplate, model3);
		html.should.equal(expected);
	})
})

describe("data-if condition", function() {
	var model4 = {
		name: model2.name,
		nested: {
			shouldShow: false
		}
	};
	var ifTemplate = '<h1>{{name.first}}<span data-if="nested.shouldShow">{{name.last}}</span></h1>';
	it("should remove an element and all child elements if the value resolves truthy", function() {
		expected = "<h1>Andrew</h1>";
		var html = templating.renderTemplate(ifTemplate, model4);
		html.should.equal(expected);
	})
	it("should leave an element and all child elements if the value resolves truthy", function() {
		model4.nested.shouldShow = true;
		expected = '<h1>Andrew<span data-if="nested.shouldShow">Petersen</span></h1>';
		var html = templating.renderTemplate(ifTemplate, model4);
		html.should.equal(expected);
	})

	var ifTemplateInvalid = '<h1>{{name.first}}<span data-if="NOT_A_PROP">{{name.last}}</span></h1>';
	it("should remove an element if an invalid scope property is given", function() {
		expected = "<h1>Andrew</h1>";
		var html = templating.renderTemplate(ifTemplateInvalid, model4);
		html.should.equal(expected);
	})
});

describe("data-if-not condition", function() {
	var model5 = {
		loggedIn: false,
		name: model2.name
	};
	var template = '<span data-if-not="loggedIn">Sign In</span><span data-if="loggedIn">{{name.first}}</span>'
	it("should keep an element and its children if value resolves falsy", function() {
		expected = '<span data-if-not="loggedIn">Sign In</span>';
		var html = templating.renderTemplate(template, model5);
		html.should.equal(expected);
	})
	it("should remove an element and its children if value resolves truthy", function() {
		model5.loggedIn = true;
		expected = '<span data-if="loggedIn">Andrew</span>';
		var html = templating.renderTemplate(template, model5);
		html.should.equal(expected);
	})
})