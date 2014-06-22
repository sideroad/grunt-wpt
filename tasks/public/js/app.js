(function( $, _ ){

	$.when(
		$.ajax({
			url: 'results.json',
			dataType: 'json'
		}),
		$.ajax({
			url: 'locations.json',
			dataType: 'json'
		})
	).done(function(resultsAjax, locationsAjax){
		var results = resultsAjax[0],
		    locations = locationsAjax[0];

		new Vue({
			el: '#app',
			data: {
				results: results,
				locations: locations,
				tests: {},
				labels: {
					responseTime: {
						median: {
			                domContentLoadedEventStart: 'DOM Content Ready Start',
			                domContentLoadedEventEnd: 'DOM Content Ready End',
					    	loadTime: 'Document Complete',
					    	loadEventStart: 'Load Event Start',
			                loadEventEnd: 'Load Event End',
					    	fullyLoaded: 'Fully Loaded'
						},
						average: {
							loadTime: 'Document Complete',
							fullyLoaded: 'Fully Loaded'
						}
					},
					contents: {
		                'html': 'HTML',
				    	'css': 'CSS',
				    	'image': 'Image',
		                'flash': 'Flash',
		                'js': 'JavaScript',
		                'font': 'Font',
		                'other': 'Other'
					}
				}
			},
			ready: function(){
				this.location = _.chain(this.locations).keys().first().value();
				this.url = _.chain(this.urls).keys().first().value();
				this.render();
			},
			computed: {
				urls: function(){
					return this.results[this.location]||{};
				},
				testIds: function(){
					return this.urls[this.url];
				}
			},
			filters: {
				convertToDate: function(time){
					return moment(time*1000).format('LLL')
				},
				totalBytes: function(data){
					var total = _.reduce(data, function(memo, val, key){
						return memo + (val.bytes||0);
					}, 0);

					return total;
				},
				ms: function(num){
					return String(num).replace(/(\d{1,3})(?=(?:\d{3})+$)/g,"$1,")+' ms';
				},
				KB: function(num){
					return String((num / 1000).toFixed(1)).replace(/(\d{1,3})(?=(?:\d{3})+$)/g,"$1,")+' KB';
				}
			},
			methods: {
				render: function(){

					var dummy = new $.Deferred(),
					    requests = [dummy],
					    that = this;

					dummy.resolve([]);

					_(this.testIds).each(function(testId){
						requests.push($.ajax({
							url: 'tests/'+testId+'.json',
							dataType: 'json',
							cache: true
						}));
					});

					$.when.apply( $, requests ).done(function(){
						var tests = _.map(arguments, function(arr){
							return arr[0];
						});
						
						// Remove dummy deferred object
						tests.shift();

						that.$set('tests', tests);

						that.renderResponseTimeGraph( tests, 'average', 'first' );
						that.renderResponseTimeGraph( tests, 'median', 'first' );
						that.renderResponseTimeGraph( tests, 'average', 'repeat' );
						that.renderResponseTimeGraph( tests, 'median', 'repeat' );
						that.renderContentsSizeGraph( tests, 'first' );
						that.renderContentsSizeGraph( tests, 'repeat' );
					});

				},
				renderContentsSizeGraph: function(tests, view){
			        this.renderGraph({
				      	data: _.map(tests, function(test){
							var obj = {};
							var tmp = 0;
							_.each(test.response.data.median[view+'View'].breakdown, function(val, key){
								obj[key] = ( val.bytes / 1000).toFixed(1);
								tmp += Number(obj[key]);
							});
							obj.total = _.reduce(obj, function(memo, val, key){
								return memo + Number(val||0);
							}, 0).toFixed(1);
							obj.date = new Date( test.info.completed*1000 ).getTime();
							return obj;
						}),
					    keys: _(this.labels.contents).keys().value().concat(['total']),
				        labels: _(this.labels.contents).values().value().concat(['Total']),
				        element: view + 'ContentsSize'
			        });
			  	},
			  	renderResponseTimeGraph: function(tests, type, view){
					this.renderGraph({
						data: _.map(tests, function(test){
							var obj = test.response.data[type][view+'View'] || {};
							obj.date = new Date( test.info.completed*1000 ).getTime();
							return obj;
						}),
						keys: _(this.labels.responseTime[type]).keys().value(),
				        labels: _(this.labels.responseTime[type]).values().value(),
						element: $.camelCase( view + '-' + type)
					});
			  	},
			  	renderGraph: function(data){
					$("#"+data.element).html('');
					Morris.Area({
					  element: data.element,
					  data: data.data,
					  xkey: 'date',
					  ykeys: data.keys,
					  labels: data.labels,
					  behaveLikeLine: true
					});
				}
			}
		});
	});

})(jQuery, _);