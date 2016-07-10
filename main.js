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
		feedNames: ['mashable', 'reddit'],
		feedInUse: null,
		mashable: {
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
			}
		}, // end mashable
		reddit: {
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

	var previewTemplate = (data)=>{
		return `
			<a href="#" class="close-pop-up">X</a>
			<div class="wrapper">
				<h1>Article title here</h1>
				<p>
					Article description/content here.
				</p>
				<a href="#" class="pop-up-action" target="_blank">Read more from source</a>
			</div>
		` // end preview template
	}

	function loadNewsContent( feed ){
		//renderLoading( state, container );
		popupLoading();

		fetch( state[feed].url() ).then( ( data )=>{
			console.log(data);
			return data.json();

		}).then( (datajson)=>{
			var storyArr = state[feed].newStories(datajson)
			console.log( storyArr );
			renderArticle( storyArr, container );
			popupOff();
		});
	}; // end loadNewsContent
	





	function renderArticle(data, into){ // headline only at this stage
		var previewCount = 5
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
		var sourceName = `<h3>${state.feedInUse}</h3>`;
		into.innerHTML =  `</div>${sourceName}<section id='articleContainer'>${headlines}</section>`;

		// show preview
		delegate('#articleContainer', 'click', '.article', ()=>{
			var articleIndex = parseInt(event.target.closest('article').title);

			var previewTemplate = (param)=>{
				return `
					<img src="${param.thumbnail(data[articleIndex])}" alt="" />
					<a href="${param.link(data[articleIndex])}" target="_blank"><h3>${param.headline(data[articleIndex])}</h3></a>
					<h6>${param.labelText(data[articleIndex])}</h6>
					<section class="impressions">
						${param.impressions(data[articleIndex])}
					</section>
				`
			} ;
			popupContainer.innerHTML = previewTemplate(feed);
			popupContainer.className = ''
			console.log( data[articleIndex] );

		}) // end render preview pop-up
	}; // end render article




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

	function renderSources(data){
		var sources = data.map( (v,i,a)=>{
			return `<li class="sourceId"><a href="#">${v}</a></li>`
		}).join('');
		return sources
	}; // end render sources




// doing stuff ////////////////////
	renderNav(state.feedNames);

	delegate('#newsSourcesList', 'click', 'li', ()=>{
		state.feedInUse = event.target.textContent;
		loadNewsContent(state.feedInUse);
	});

	



})()
