/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions

 IMPORTANT
 NYT api keys applied for here:
 http://developer.nytimes.com/signup
 approval usually within 15mins
 */



(function() {	
	var containerTemplate = `
		<header id="navbar"></header>
		<div id="container"></div>
		<div id="pop-up" class='hidden'></div>
	`
	document.getElementById('appContainer').innerHTML = containerTemplate

	var container = document.querySelector('#appContainer #container');
	var navContainer = document.querySelector('#appContainer #navbar');
	var articleContainer = document.querySelector('#appContainer #articleContainer');
	var popupContainer = document.querySelector('#appContainer #pop-up')

	const previewCount = 10;

	var state = {
		cors: 'https://crossorigin.me/',
		feedNames: ['mashable', 'reddit', 'nytMovies'],
		feedInUse: null,
		nytMovies: {
			copyright: 'copyright',
			brandname: 'NYT movie reviews',
			url: ()=>{
				return state.cors + 'https://api.nytimes.com/svc/movies/v2/reviews/search.json?api-key='+nytkey
			},
			newStories: (data)=>{
				return data['results']
			},
			headline: (data)=>{
				return data['display_title']
			},
			thumbnail: (data)=>{
				return data['multimedia']['src']
			},
			labelText: (data)=>{
				return data['headline']
			},
			impressions: (data)=>{
				return data['mpaa_rating']
			},
			link: (data)=>{
				return data['link']['url']
			},
			synopsis: (data)=>{
				return data['summary_short']
			},
			date: (data)=>{
				return data['publication_date']
			}
		},
		mashable: {
			brandname: 'Mashable',
			url: ()=>{
				return state.cors+'http://mashable.com/stories.json'
			},
			newStories: (data)=>{
				return data['hot']
			},
			trendingStories: '',
			headline: (data)=>{
				return data['title']
			},
			thumbnail: (data)=>{
				return data['responsive_images'][4]['image']
			},
			labelText: (data)=>{
				return data['channel_label']
			},
			impressions: (data)=>{
				return data['shares']['total']
			},
			link: (data)=>{
				return data['link']
			},
			synopsis: (data)=>{
				return data['excerpt']
			},
			date: (data)=>{
				return data['post_date']
			}
		}, // end mashable
		reddit: {
			brandname: 'reddit',
			url: ()=>{
				return state.cors+'https://www.reddit.com/top.json'
			},
			newStories: (data)=>{
				return data['data']['children'];
			},
			trendingStories: '',
			headline: (data)=>{
				return data['data']['title']
			},
			thumbnail: (data)=>{
				return data['data']['thumbnail']
			},
			labelText: (data)=>{
				return data['data']['subreddit']
			},
			impressions: (data)=>{
				return data['data']['score']
			},
			link: (data)=>{
				return 'http://www.reddit.com'+data['data']['permalink']
			},
			synopsis: (data)=>{
				return data['data']['selftext']
			},
			date: (data)=>{
				return data['data']['created']
			}
		}// end reddit
		
	};

	const popupLoading = ()=>{
		popupContainer.innerHTML = '';
		popupContainer.className = 'loader';
	} 
	const popupOff = ()=>{
		popupContainer.innerHTML = '';
		popupContainer.className = 'hidden';
	} 

	function loadNewsContent( feed ){
		popupLoading();
		fetch( state[feed].url() ).then( ( data )=>{
			return data.json();
		}).then( (datajson)=>{
			var storyArr = state[feed].newStories(datajson)
			renderArticle( storyArr, container, datajson );
			popupOff();
		});
	}; // end loadNewsContent
	
	var popupTemplate = (brand, index, response)=>{
		return `
			<a href="#" class="close-pop-up">X</a>
			<div class="wrapper">
				<img src="${brand.thumbnail(index)}" alt="" />
				<h1>${brand.headline(index)}</h1>
				<h6>${brand.labelText(index)}</h6>
				<p>
					${brand.synopsis(index)}
				</p>
				<a href="${brand.link(index)}" class="pop-up-action" target="_blank">Read more from source</a>
				${ response['copyright'] ? `<h6>${response['copyright']}</h6>` : '' }
			</div>
		` // end template
	};


	

	function renderArticle(data, into, datajson){
		var feed = state[state.feedInUse];
		var previewList = data.filter( (v,i,a)=>{
				return i<previewCount
			})
		var headlines = previewList.map((v,i,a)=>{
			//console.log(v)
				return `
					<article id='${i}' class="article" title='${i}'>
						<section class="featured-image">
							<img src="${feed.thumbnail(v)}" alt="" />
						</section>
						<section class="article-content">
							<a href="#"><h3>${feed.headline(v)}</h3></a>
							<h6>${feed.labelText(v)}</h6>
						</section>
						<section class="impressions">
							${feed.impressions(v)}
						</section>
						<div class="clearfix"></div>
					</article>
				` // end template
		}).join('');
		var sourceName = `<h3>${state.feedInUse}</h3>${ datajson['copyright'] ? `<h6>${datajson['copyright']}</h6>` : '' }`;
		into.innerHTML =  `${sourceName}<section id='articleContainer'>${headlines}</section>`;

		// show preview
		delegate('#articleContainer', 'click', '.article', ()=>{
			var index = data[parseInt(event.target.closest('article').title)];
			popupContainer.innerHTML = popupTemplate(feed, index, datajson);
			popupContainer.className = ''
		}) // end render preview pop-up delegate	

	}; // end render article

	function renderSources(data){
		let allChannels = `<li class="sourceId" title='allChannels'><a href="#">All channels</a></li>`
		var sources = data.map( (v,i,a)=>{
			return `<li class="sourceId" title='${v}'><a href="#">${state[v].brandname}</a></li>`
		}).join('');
		return allChannels + sources
	}; // end render sources

	function renderNav(param) {
		var navTemplate = `
		<section class="wrapper">
			<a href="#"><h1>Feedr</h1></a>
			<nav>
				<section id="search">
					<input type="text" name="name" value="">
					<div id="search-icon"><img src="images/search.png" alt="" /></div>
				</section>
				<ul>
					<li><a href="#">News Source: <span>Source Name</span></a>
					<ul id="newsSourcesList">
						${renderSources(param)}
					</ul>
					</li>
				</ul>
			</nav>
			<div class="clearfix"></div>
		</section>
		` // end template
		navContainer.innerHTML = navTemplate
		return navTemplate
	}; // end renderNav

	// convert date format
	function timeConverter(timeJSON){
		if(new Date(timeJSON) === 'invalid'){
			var a = new Date(timeJSON * 1000);
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			var year = a.getFullYear();
			var month = months[a.getMonth()];
			var date = a.getDate();
			var hour = a.getHours();
			var min = a.getMinutes();
			var sec = a.getSeconds();
			var time = month + ' ' + date + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
			return time;
		} else {
			return timeJSON
		}
	};


	function allchannels(){
		popupContainer.className = 'loader';
		var stateAll = {
			bydate: [],
			content: []
		};
		state.feedNames.forEach( (v,i,a)=>{
			stateAll[v] = {}
			var allfeed = state[v]
			fetch(state[v].url()).then( (response)=>{
				return response.json();
			}).then((data)=>{
				stateAll[v] = data;
				state[v].newStories(data).forEach((val,ind,arr)=>{
					if (ind<previewCount){ // limit story count per channel
						val.brand = v;
						if (typeof allfeed.date(val) === "number" ){ // if unix format multiply
							if ( (allfeed.date(val).toString().length) < 13 ) { 
								var diff = 13 - allfeed.date(val).toString().length;
								var newDate = allfeed.date(val)
								for (var i=0; i<diff; i++){
									newDate *= 10
								}	
								val.dateStamp = newDate
							} else { // date is correct length
								val.dateStamp = allfeed.date(val)
							} // end date length check
						} else {
							val.dateStamp = new Date(timeConverter(allfeed.date(val) ) ).getTime() // use getTime to convert to unix format 
						}
						stateAll.bydate.push(val);
						//console.log('state all', stateAll.bydate);	
						if ( stateAll.bydate.length === (previewCount*(state.feedNames.length)) ){
							var orderedArray = stateAll.bydate.sort(function(a, b) {
							return b.dateStamp - a.dateStamp;
						});
						
						//console.log('pre-template:', orderedArray);
						var orderTemplate = orderedArray.map( (ov,oi,oa)=>{
							//console.log(ov)
							return `
								<article id='${oi}' class="article" title='${ov.brand}' data-date='${ov.dateStamp}'>
									<section class="featured-image">
										<img src="${state[ov.brand].thumbnail(ov)}" alt="" />
									</section>
									<section class="article-content">
										<a href="#"><h3>${state[ov.brand].headline(ov)}</h3></a>
										<h6>${state[ov.brand].labelText(ov)}</h6>
									</section>
									<section class="impressions">
										${state[ov.brand].impressions(ov)}
									</section>
									<div class="clearfix"></div>
								</article>
							`// end template
						});	
						//console.log('final order', orderTemplate)
						container.innerHTML = orderTemplate.join('');
						popupContainer.className = 'hidden';
						}
					}
				});
			})
		});

		setTimeout(function() {
			//console.log('timeout!')
		}, 2000);

		delegate('#container', 'click', 'section', (event)=>{
			event.preventDefault();
			var getBrand = event.target.closest('article').title;
			var thisHeadline = event.target.closest('article').querySelector('h3').textContent;
			var getInd = parseInt(event.target.closest('article').id);
			var thisBrand = state[getBrand];
			var thisjson = stateAll[getBrand];
			var thisStory;
			var findStoryObj = thisBrand.newStories(thisjson).filter((v,i,a)=>{
				if ( thisBrand.headline(v) === thisHeadline){
					thisStory = v
				}
			})
			
			// render popup
			popupContainer.innerHTML = popupTemplate( thisBrand, thisStory, thisjson );
			popupContainer.className = ''	
		})
		
	};

	renderNav(state.feedNames);
	delegate('#newsSourcesList', 'click', 'li', (event)=>{
		if (event.target.closest('li').title !== 'allChannels'){
			state.feedInUse = event.target.closest('li').title;
			loadNewsContent(state.feedInUse);
		} else {
			allchannels()
		}
	});

	// close button
	delegate('#pop-up', 'click', 'a.close-pop-up', ()=>{
		event.preventDefault();
		popupContainer.className = 'hidden';
		popupContainer.innerHTML = ''
	});
	delegate('.wrapper a', 'click', 'h1', ()=>{
		allchannels()
	})

	// load all channels on load
	allchannels()
	popupContainer.className = 'loader';
	

})() // end iife


