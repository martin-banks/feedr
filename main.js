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
				return state.cors + 'https://api.nytimes.com/svc/movies/v2/reviews/search.json?api-key='+nytapikey
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
	





	function renderArticle(data, into, datajson){ // headline only at this stage
		console.log(datajson)
		const previewCount = 10
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
			var previewTemplate = (param)=>{
				return `
					<a href="#" class="close-pop-up">X</a>
					<div class="wrapper">
						<img src="${param.thumbnail(index)}" alt="" />
						<h1>${param.headline(index)}</h1>
						<h6>${param.labelText(index)}</h6>
						<p>
							${param.synopsis(index)}
						</p>
						<a href="${param.link(index)}" class="pop-up-action" target="_blank">Read more from source</a>
						${ datajson['copyright'] ? `<h6>${datajson['copyright']}</h6>` : '' }
					</div>

				`
			} ;
			popupContainer.innerHTML = previewTemplate(feed);
			popupContainer.className = ''
			
		}) // end render preview pop-up delegate

		delegate('#pop-up', 'click', 'a.close-pop-up', ()=>{
			console.log('close button clicked');
			popupContainer.className = 'hidden';
			popupContainer.innerHTML = ''
		})
	}; // end render article


	function renderSources(data){
		var sources = data.map( (v,i,a)=>{
			return `<li class="sourceId" title='${v}'><a href="#">${state[v].brandname}</a></li>`
		}).join('');
		return sources
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

	



// doing stuff ////////////////////
	renderNav(state.feedNames);

	delegate('#newsSourcesList', 'click', 'li', ()=>{
		state.feedInUse = event.target.closest('li').title;
		loadNewsContent(state.feedInUse);
	});

	



})()
