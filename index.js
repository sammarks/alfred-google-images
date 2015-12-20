var AlfredNode = require('alfred-workflow-nodejs');
var actionHandler = AlfredNode.actionHandler;
var workflow = AlfredNode.workflow;
var Item = AlfredNode.Item;
var _ = require('lodash');
var ImageSearch = require('./search');

function displayResults(images) {
	_(images).forEach(function (image) {
		console.log(image);
		workflow.addItem(new Item({
			title: image.title,
			subtitle: image.url,
			valid: true,
			icon: image.thumbnail,
			arg: image.url
		}));
	});
	workflow.feedback();
}

(function main () {

	actionHandler.onAction('search', function (query) {
		ImageSearch(query, displayResults);
	});

	AlfredNode.run();

})();
