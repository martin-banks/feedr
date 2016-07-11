/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions
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
			}
		}// end reddit
		
	};

	const popupLoading = ()=>{
		popupContainer.innerHTML = '';
		popupContainer.className = 'loader';
		//`<div id="pop-up" class="loader"></div>`;
	} 
	const popupOff = ()=>{
		popupContainer.innerHTML = '';
		popupContainer.className = 'hidden';
		//`<div id="pop-up" class="loader"></div>`;
	} 



	function loadNewsContent( feed ){
		//renderLoading( state, container );
		popupLoading();

		fetch( state[feed].url() ).then( ( data )=>{
			console.log(data);
			return data.json();

		}).then( (datajson)=>{
			console.log(datajson)
			var storyArr = state[feed].newStories(datajson)
			console.log( storyArr );
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
		`
	};


	

	function renderArticle(data, into, datajson){ // headline only at this stage
		console.log(datajson)
		const previewCount = 5;
		var feed = state[state.feedInUse];
		var previewList = data.filter( (v,i,a)=>{
				return i<previewCount
			})
		var headlines = previewList.map((v,i,a)=>{
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
				`
		}).join('');
		var sourceName = `<h3>${state.feedInUse}</h3>${ datajson['copyright'] ? `<h6>${datajson['copyright']}</h6>` : '' }`;
		into.innerHTML =  `${sourceName}<section id='articleContainer'>${headlines}</section>`;


		


		// show preview
		delegate('#articleContainer', 'click', '.article', ()=>{
			var index = data[parseInt(event.target.closest('article').title)];
			console.log( index );
			
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
		`
		navContainer.innerHTML = navTemplate
		return navTemplate
	}; // end renderNav

	



	function allchannels(){
		var stateAll = {
			bydate: [],
			content: []
		};
		var allcontent;
		state.feedNames.forEach( (v,i,a)=>{
			stateAll[v] = {}
			var allfeed = state[v]
			fetch(state[v].url()).then( (response)=>{
				return response.json()
			}).then((data)=>{
				stateAll[v] = data;

				state[v].newStories(data).forEach((val,ind,arr)=>{
					stateAll.bydate.push(v);
					let x = ()=>{
						return `
							<article id='${ind}' class="article" title='${v}'>
								<section class="featured-image">
									<img src="${allfeed.thumbnail(val)}" alt="" />
								</section>
								<section class="article-content">
									<a href="#"><h3>${allfeed.headline(val)}</h3></a>
									<h6>${allfeed.labelText(val)}</h6>
								</section>
								<section class="impressions">
									${allfeed.impressions(val)}
								</section>
								<div class="clearfix"></div>
							</article>
						`
					};
					stateAll.content.push(x())

				})
				
				console.log(stateAll.bydate)
			}).then( (data)=>{
				container.innerHTML = stateAll.content.join('')
				console.log(stateAll);

			}).then( (data)=>{
				
			})
		});

		delegate('#container', 'click', 'section', ()=>{
			var getbrand = event.target.closest('article').title;
			var getind = parseInt(event.target.closest('article').id);
			
			let thisBrand = state[getbrand]
			let thisStory = state[getbrand].newStories( stateAll[getbrand] )[getind]

			// render popup
			popupContainer.innerHTML = popupTemplate( thisBrand, thisStory, thisBrand );
			popupContainer.className = ''
				
		})

/*
	fetch each channel
		get length of channels
		loop through all channels
		push articles to obj/array
	combine all articles
		loop throughe each entry in each channel
		push to master channel array
		order by date
	render each channel
		loop through master channel
		apply to tempalte
		render to DOM


*/


	}



// doing stuff ////////////////////
	renderNav(state.feedNames);




	delegate('#newsSourcesList', 'click', 'li', ()=>{
		if (event.target.closest('li').title !== 'allChannels'){
			state.feedInUse = event.target.closest('li').title;
			loadNewsContent(state.feedInUse);
		} else {
			console.log('all channels');
			allchannels()
		}
		
	});


	// close button
	delegate('#pop-up', 'click', 'a.close-pop-up', ()=>{
		console.log('close button clicked');
		popupContainer.className = 'hidden';
		popupContainer.innerHTML = ''
	})

	









})()
