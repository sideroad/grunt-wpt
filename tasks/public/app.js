(function( $, _ ){

	var renderResponseAverage = function(results, type){
	      render({
	      	data: _.map(results, function(result){
					var obj = result.response.data.average[type] || {};
					obj.date = new Date( result.info.completed*1000 ).getTime();
					return obj;
				  }),
		    keys: ['fullyLoaded', 'loadTime'],
	        labels: ['Fully Loaded', 'Document Complete'],
	        element: type === 'firstView' ? 'firstAverage' : 'repeatAverage'
	      });		  
		},
		renderResponseMedian = function(results, type){
	      render({
	      	data: _.map(results, function(result){
					var obj = result.response.data.median[type] || {};
					obj.date = new Date( result.info.completed*1000 ).getTime();
					return obj;
				  }),
		    keys: [
		    	'fullyLoaded',
                'loadEventEnd',
		    	'loadEventStart',
		    	'loadTime',
                'domContentLoadedEventEnd',
                'domContentLoadedEventStart'
            ],
	        labels: [
	        	'Fully Loaded',
                'Load Event End',
		    	'Load Event Start',
	        	'Document Complete',
                'DOM Content Ready End',
                'DOM Content Ready Start'
            ],
	        element: type === 'firstView' ? 'firstMedian' : 'repeatMedian'
	      });
		},
		renderResponseAverageTable = function(results){
			var $tbody = $('#averageTable');
			
			$tbody.html(_.map(results, function(result){
				return  '<tr>'+
						'<td>'+moment(result.info.completed*1000).format('LLL')+'</td>'+
						'<td><a href="'+result.response.data.summary+'">'+result.info.id+'</a></td>'+
					    '<td>'+result.response.data.average.firstView.loadTime+'</td>'+
					    '<td>'+result.response.data.average.firstView.fullyLoaded+'</td>'+
					    '<td>'+result.response.data.average.repeatView.loadTime+'</td>'+
					    '<td>'+result.response.data.average.repeatView.fullyLoaded+'</td>'+
					    '</tr>';
			}));
		},
		renderResponseMedianTable = function(results){
			var $tbody = $('#medianTable');
			
			$tbody.html(_.map(results, function(result){
				return  '<tr>'+
						'<td>'+moment(result.info.completed*1000).format('LLL')+'</td>'+
						'<td><a href="'+result.response.data.summary+'">'+result.info.id+'</a></td>'+
					    '<td>'+result.response.data.median.firstView.domContentLoadedEventStart+'</td>'+
					    '<td>'+result.response.data.median.firstView.domContentLoadedEventEnd+'</td>'+
					    '<td>'+result.response.data.median.firstView.loadTime+'</td>'+
					    '<td>'+result.response.data.median.firstView.loadEventStart+'</td>'+
					    '<td>'+result.response.data.median.firstView.loadEventEnd+'</td>'+
					    '<td>'+result.response.data.median.firstView.fullyLoaded+'</td>'+
					    '<td>'+result.response.data.median.repeatView.domContentLoadedEventStart+'</td>'+
					    '<td>'+result.response.data.median.repeatView.domContentLoadedEventEnd+'</td>'+
					    '<td>'+result.response.data.median.repeatView.loadTime+'</td>'+
					    '<td>'+result.response.data.median.repeatView.loadEventStart+'</td>'+
					    '<td>'+result.response.data.median.repeatView.loadEventEnd+'</td>'+
					    '<td>'+result.response.data.median.repeatView.fullyLoaded+'</td>'+
					    '</tr>';
			}));
		},
		render = function(data){
			$("#"+data.element).html('');
			Morris.Area({
			  element: data.element,
			  data: data.data,
			  xkey: 'date',
			  ykeys: data.keys,
			  labels: data.labels,
			  behaveLikeLine: true
			});
		};

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
			locations = locationsAjax[0],
		    $locations = $("#locations"),
			$urls = $('#urls');

		$locations.html(_.map(results, function(urls, location){
			return '<option value="'+location+'">'+locations[location]+'</option>'
		}).join(''));

		$locations.change(function(){
			var location = $locations.val();

			$urls.html(_(results[location]).map(function(ids, url){
				return '<option>'+url+'</option>';
			}).join(''));

			$urls.change(function(){
				var url = $urls.val(),
					dummy = new $.Deferred()
				    requests = [dummy];

				dummy.resolve([]);

				_(results[location][url]).each(function(id){
					requests.push($.ajax({
						url: 'tests/'+id+'.json',
						dataType: 'json',
						cache: true
					}));
				});

				$.when.apply( $, requests ).done(function(){
					var results = _.map(arguments, function(arr){
						return arr[0];
					});
					results.shift();

					renderResponseAverage( results, 'firstView' );
					renderResponseMedian( results, 'firstView' );
					renderResponseAverage( results, 'repeatView' );
					renderResponseMedian( results, 'repeatView' );

					renderResponseAverageTable( results );
					renderResponseMedianTable( results );

				});
			}).change();
		}).change();
	});


})(jQuery, _);