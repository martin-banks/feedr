/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions
 */

(function() {

	var container = document.querySelector('#container');
	var $navContainer = document.getElementById('navbar');

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
			}
		},
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
			}

		},
		
	};

	var loaderTemplate = `<div id="pop-up" class="loader"></div>`;

	function renderLoading(data, into) {
		container.innerHTML = loaderTemplate;
	}; // end renderLoading

	function loadNewsContent( feed ){
		renderLoading( state, container );

		fetch( state[feed].url() ).then( ( data )=>{
			console.log(data);
			return data.json();

		}).then( (datajson)=>{
			var storyArr = state[feed].newStories(datajson)
			console.log( storyArr );
			renderArticle( storyArr, container );
		});
	}; // end loadNewsContent
	




			







	function renderArticle(data, into){ // headline only at this stage
		var feed = state[state.feedInUse];
		var headlines = data.map((v,i,a)=>{
			if(i>=5){ // restrict to 5 titles only
				return null
			} else {
				return `
					<article class="article">
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
			}
		}).join('\n');
		var sourceName = `<h3>${state.feedInUse}</h3>`
		into.innerHTML =  sourceName + headlines
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
		$navContainer.innerHTML = navTemplate
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
	})



})()
