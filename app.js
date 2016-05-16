var buildApp = angular.module('buildApp', ['ngRoute']);
  
buildApp.config(function($routeProvider){
	$routeProvider
		.when('/',
		{
			controller: 'BuildController',
			templateUrl: 'templates/list.html'
		})
		.otherwise({redirectTo: '/'});
	})
	.controller('BuildController', function($scope, $interval, buildFactory) {
		  
		$scope.statusVisible = false;
		
		$scope.getGlyphClass = function(tile) {	
			if(tile.state == 'running') {
				return 'glyphicon glyphicon-refresh glyphicon-refresh-animate';
			}	
			else if(tile.status == 'SUCCESS') {
				return 'glyphicon glyphicon-ok';
			}
			else if(tile.status == 'FAILURE') {
				return 'glyphicon glyphicon-exclamation-sign';
			}
			return 'glyphicon glyphicon-question-sign';
		}
		
		$scope.getPanelClass = function(tile){
			if(tile.status == 'SUCCESS') {
				return 'alert alert-dismissible alert-success';
			}
			else if(tile.status == 'FAILURE') {
				return 'alert alert-dismissible alert-danger';
			}
			
			return 'alert alert-dismissible alert-warning';
		}
		
		$scope.reload = function() {
			$scope.statusVisible = true;

			buildFactory.getBuilds()
				.then(function(responses) {
					$scope.buildResponses = responses
						.filter(function(r) { return (r.status == 200 && r.data.build.length > 0)})
						.map(function(r){ return r.data.build[0] })
				})
				.then(buildFactory.getRunningBuilds)
				.then(function(data) {
					$scope.runningBuilds = data.data.build.map(function(row) { return row.buildTypeId })
				})
				.then(function() {
					$scope.builds = $scope.buildResponses.map(function(b) { return buildFactory.decodeBuild(b, $scope.runningBuilds); });
				})
				.then(function() {
					$scope.tiles = buildFactory.generateTiles($scope.builds)
				})
				.then(function() {
					$scope.statusVisible = false;
				});
		    };
			
			$scope.reload();
			
			$interval(function () {$scope.reload()}, 10000);
	});
	