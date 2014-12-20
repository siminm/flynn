//= require ../store

(function () {
"use strict";

function buildpackMatchFn(pattern) {
	return function (paths) {
		for (var i = 0, len = paths.length; i < len; i++) {
			if (paths[i].match(pattern)) {
				return true;
			}
		}
		return false;
	};
}

var buildpackRules = [
	{
		name: 'multi',
		match: buildpackMatchFn(/^\.buildpacks$/),
		url: "https://github.com/heroku/heroku-buildpack-multi"
	},
	{
		name: 'ruby',
		match: buildpackMatchFn(/^Gemfile$/),
		url: "https://github.com/heroku/heroku-buildpack-ruby",
		docsURL: "https://flynn.io/docs/how-to-deploy-ruby"
	},
	{
		name: 'node',
		match: buildpackMatchFn(/^package\.json/),
		url: "https://github.com/heroku/heroku-buildpack-nodejs",
		docsURL: "https://flynn.io/docs/how-to-deploy-nodejs"
	},
	{
		name: 'clojure',
		match: buildpackMatchFn(/^project\.clj$/),
		url: "https://github.com/heroku/heroku-buildpack-clojure"
	},
	{
		name: 'python',
		match: buildpackMatchFn(/^(requirements\.txt)|(setup\.py)$/),
		url: "https://github.com/heroku/heroku-buildpack-python",
		docsURL: "https://flynn.io/docs/how-to-deploy-python"
	},
	{
		name: 'java',
		match: buildpackMatchFn(/^pom\.xml$/),
		url: "https://github.com/heroku/heroku-buildpack-java",
		docsURL: "https://flynn.io/docs/how-to-deploy-java"
	},
	{
		name: 'php',
		match: buildpackMatchFn(/^(composer\.json)|(index\.php)$/),
		url: "https://github.com/heroku/heroku-buildpack-php",
		docsURL: "https://flynn.io/docs/how-to-deploy-php"
	},
	{
		name: 'gradle',
		match: buildpackMatchFn(/^(gradlew)|(build\.gradle)|(settings\.gradle)$/),
		url: "https://github.com/heroku/heroku-buildpack-gradle",
		docsURL: "https://flynn.io/docs/how-to-deploy-java"
	},
	{
		name: 'scala',
		match: function (paths) {
			return buildpackMatchFn(/.*\.sbt$/)(paths) ||
				buildpackMatchFn(/^project\/.*\.scala$/)(paths) ||
				buildpackMatchFn(/^\.sbt\/.*\.scala$/)(paths) ||
				buildpackMatchFn(/^project\/build\.properties$/)(paths);
		},
		url: "https://github.com/heroku/heroku-buildpack-scala"
	},
	{
		name: 'play',
		match: function (paths) {
			return buildpackMatchFn(/^.*\/?conf\/application\.conf/)(paths) && !buildpackMatchFn(/^.*\/?modules\/.*\/conf\/application\.conf/)(paths);
		},
		url: "https://github.com/heroku/heroku-buildpack-play"
	},
	{
		name: 'go',
		match: buildpackMatchFn(/.*\.go$/),
		url: "https://github.com/kr/heroku-buildpack-go",
		docsURL: "https://flynn.io/docs/how-to-deploy-go"
	}
];

var GithubRepoBuildpack = Dashboard.Stores.GithubRepoBuildpack = Dashboard.Store.createClass({
	displayName: "Stores.GithubRepoBuildpack",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			name: null,
			unknown: false
		};
	},

	didBecomeActive: function () {
		this.__detectBuildpack();
	},

	__findBuildpack: function (paths) {
		for (var i = 0, len = buildpackRules.length; i < len; i++) {
			if (buildpackRules[i].match(paths)) {
				return buildpackRules[i];
			}
		}
		return null;
	},

	__detectBuildpack: function () {
		return Dashboard.githubClient.getRepoTree(this.props.ownerLogin, this.props.repoName, this.props.ref, [{ recursive: 1 }]).then(function (args) {
			var buildpack = this.__findBuildpack(args[0].tree.map(function (item) {
				return item.path;
			}));
			if (buildpack) {
				this.setState({
					name: buildpack.name,
					unknown: false,
					url: buildpack.url,
					docsURL: buildpack.docsURL || null
				});
			} else {
				this.setState({
					name: null,
					unknown: true,
					url: null,
					docsURL: null
				});
			}
		}.bind(this));
	}
});

GithubRepoBuildpack.isValidId = function (id) {
	return id.ownerLogin && id.repoName && id.ref;
};

})();
