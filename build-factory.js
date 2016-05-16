angular.module('buildApp').factory('buildFactory', function($http) {
	var factory = {};
	  
	var getBuildTypes = function() {
		return $http.get('http://tc/guestAuth/app/rest/buildTypes?locator=start:0,count:100');
	};
	
	var getBuildStatus = function(id) {
		return $http.get('http://tc/guestAuth/app/rest/builds?locator=buildType:' + id + ',start:0,count:1&fields=build(id,status,state,buildType(name,id,projectName))');
	};
	
	factory.getRunningBuilds = function() {
		return $http.get('http://tc/guestAuth/app/rest/builds?locator=running:true');
	};
	  
	factory.getBuilds = function() {
		return getBuildTypes().then(function getBuildStatuses(data){
			var gets = data.data.buildType.map(function(currentBuildType) { 
				return getBuildStatus(currentBuildType.id) 
			});
			return Promise.all(gets)
		})
	};
	
	factory.decodeBuild = function(build, runningBuilds) {
		var state = build.state;
		
		if(runningBuilds.indexOf(build.buildType.id) >= 0) {
			state = 'running';
		}

		return { 
				'id': build.id,
				'name': build.buildType.name,
				'status': build.status,
				'state': state,
				'project': build.buildType.projectName,
				'projectGroup': build.buildType.projectName.split('::')[0].trim()
		}
	};
	
	factory.generateTiles = function(builds) {			
		var grouped = groupBy(builds, function(x) { return x.projectGroup });
		var tiles = []
		grouped.forEach(function(group) {
			var badChildren = group.filter(function(b) { return b.status == 'FAILURE' })
			var goodChildren = group.filter(function(b) { return b.status != 'FAILURE' })
			
			badChildren.forEach(function(b) { tiles.push(b) })
			
			if(goodChildren.length > 1) {
				var state = goodChildren[0].state;
				goodChildren.filter(function(b) { return b.state == 'running' }).forEach(function(x) { state = x.state });
				
				var tile = jQuery.extend(goodChildren[0], {'name': goodChildren[0].projectGroup, 'project': goodChildren[0].projectGroup, 'buildCount': goodChildren.length, 'state': state});
				tiles.push(tile);
			}
			else {
				goodChildren.forEach(function(b) { tiles.push(b) });
			}
		});					
			
		return tiles
	};
	  
	return factory;
});


