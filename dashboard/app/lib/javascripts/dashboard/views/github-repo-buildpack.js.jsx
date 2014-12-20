/** @jsx React.DOM */
//= require ../stores/github-repo-buildpack
//= require ./external-link

(function () {

"use strict";

var BuildpackStore = Dashboard.Stores.GithubRepoBuildpack;

var ExternalLink = Dashboard.Views.ExternalLink;

Dashboard.Views.GithubRepoBuildpack = React.createClass({
	displayName: "Views.GithubRepoBuildpack",

	render: function () {
		var buildpack = this.state.buildpack;
		return (
			<div className={'buildpack alert-'+ (buildpack.unknown ? 'error' : 'info')}>
				{buildpack.unknown ? "Unknown Buildpack" : (
					buildpack.name ? (
						<div>
							{this.__formatName(buildpack.name) + " app detected. "}
							{this.state.docsURL ? (
								<ExternalLink href={buildpack.docsURL}>Docs</ExternalLink>
							) : (
								<ExternalLink href={buildpack.url}>Buildpack</ExternalLink>
							)}
						</div>
					) : "Detecting buildpack..."
				)}
			</div>
		);
	},

	getInitialState: function () {
		return this.__getState(this.props);
	},

	componentDidMount: function () {
		BuildpackStore.addChangeListener(this.state.buildpackStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		var oldBuildpackStoreId = this.state.buildpackStoreId;
		var newBuildpackStoreId = this.__getBuildpackStoreId(props);
		if ( !Marbles.Utils.assertEqual(oldBuildpackStoreId, newBuildpackStoreId) ) {
			BuildpackStore.removeChangeListener(oldBuildpackStoreId, this.__handleStoreChange);
			this.__handleStoreChange(props);
			BuildpackStore.addChangeListener(newBuildpackStoreId, this.__handleStoreChange);
		}
	},

	componentWillUnmount: function () {
		BuildpackStore.removeChangeListener(this.state.buildpackStoreId, this.__handleStoreChange);
	},

	__getBuildpackStoreId: function (props) {
		return {
			ownerLogin: props.ownerLogin,
			repoName: props.repoName,
			ref: props.selectedBranchName || props.defaultBranchName || 'master'
		};
	},

	__getState: function (props) {
		var state = {
			buildpackStoreId: this.__getBuildpackStoreId(props)
		};

		state.buildpack = BuildpackStore.getState(state.buildpackStoreId);

		return state;
	},

	__handleStoreChange: function (props) {
		this.setState(this.__getState(props || this.props));
	},

	__formatName: function (name) {
		return name[0].toUpperCase() + name.slice(1);
	}
});

})();
